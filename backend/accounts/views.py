"""Sign-in, sign-up and account security.

Flow (the same endpoints serve new and returning members, so a number's account status is never revealed
before the person proves they own it):

    1. POST start/          {phone | email, captchaToken?}  → 202, code sent
    2. POST verify/         {phone | email, code}           → 200 {status: "signed_in", user}
                                                            → 200 {status: "needs_profile", signupToken}
    3. POST complete-signup/ {signupToken, name, handle, dateOfBirth, acceptTerms, termsVersion, ...} → 201 {user}
"""
import secrets

from django.conf import settings
from django.contrib.auth import login, logout
from django.db import IntegrityError, transaction
from django.middleware.csrf import get_token
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from akines_api.exceptions import ApiError

from . import codes, delivery, security
from . import validators as v
from .models import LoginCode, SecurityEvent, User, UserSession
from .serializers import (CodeSerializer, CompleteSignupSerializer, ContactSerializer, MeSerializer, SessionSerializer,
                          StartSerializer, VerifySerializer, make_signup_token)
from .throttles import IpScopedThrottle

Kind = SecurityEvent.Kind


def _lookup(channel, destination):
    return {"phone": destination} if channel == LoginCode.Channel.SMS else {"email__iexact": destination}


def _sign_in(request, user, *, new=False):
    login(request, user, backend="django.contrib.auth.backends.ModelBackend")  # rotates the session id
    security.mark_recent_auth(request)
    security.track_session(request, user)
    security.record(Kind.SIGNED_UP if new else Kind.SIGNED_IN, request, user=user)


class AuthView(APIView):
    throttle_classes = [IpScopedThrottle]
    permission_classes = [AllowAny]


@method_decorator(never_cache, name="dispatch")
class CsrfView(AuthView):
    """Sets the csrftoken cookie. Clients call this once before their first POST and send X-CSRFToken."""

    throttle_scope = "auth_read"

    @extend_schema(responses=inline_serializer("Csrf", {"csrfToken": serializers.CharField()}))
    def get(self, request):
        return Response({"csrfToken": get_token(request)})


class StartView(AuthView):
    throttle_scope = "auth_start"

    @extend_schema(request=StartSerializer, responses={202: inline_serializer("CodeSent", {"sentTo": serializers.CharField(), "channel": serializers.CharField(), "expiresIn": serializers.IntegerField(), "resendIn": serializers.IntegerField()})})
    def post(self, request):
        s = StartSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        if not delivery.verify_captcha(s.validated_data.get("captchaToken"), security.client_ip(request)):
            raise ApiError("captcha_failed", "Please complete the check to show you're not a robot.", 400)
        d = s.validated_data
        codes.issue(channel=d["channel"], destination=d["destination"], purpose=LoginCode.Purpose.SIGN_IN, request=request)
        return Response({
            "sentTo": v.mask_destination(d["destination"]), "channel": d["channel"],
            "expiresIn": settings.LOGIN_CODE_TTL_MINUTES * 60, "resendIn": settings.LOGIN_CODE_RESEND_SECONDS,
        }, status=status.HTTP_202_ACCEPTED)


class VerifyView(AuthView):
    throttle_scope = "auth_verify"

    @extend_schema(request=VerifySerializer, responses=inline_serializer("Verified", {"status": serializers.ChoiceField(["signed_in", "needs_profile"]), "user": MeSerializer(required=False), "signupToken": serializers.CharField(required=False)}))
    def post(self, request):
        s = VerifySerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        codes.check(destination=d["destination"], purpose=LoginCode.Purpose.SIGN_IN, code=d["code"], request=request)
        user = User.objects.filter(**_lookup(d["channel"], d["destination"])).first()
        if user is None:
            return Response({"status": "needs_profile", "signupToken": make_signup_token(d["channel"], d["destination"])})
        if not user.is_active:
            raise ApiError("account_unavailable", "This account isn't available. Contact support if you think this is a mistake.", 403)
        field = "phone_verified_at" if d["channel"] == LoginCode.Channel.SMS else "email_verified_at"
        if getattr(user, field) is None:
            setattr(user, field, timezone.now())
            user.save(update_fields=[field])
        _sign_in(request, user)
        return Response({"status": "signed_in", "user": MeSerializer(user).data})


class CompleteSignupView(AuthView):
    throttle_scope = "auth_verify"

    @extend_schema(request=CompleteSignupSerializer, responses={201: inline_serializer("SignedUp", {"user": MeSerializer()})})
    def post(self, request):
        s = CompleteSignupSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        now = timezone.now()
        sms = d["channel"] == LoginCode.Channel.SMS
        try:
            with transaction.atomic():
                if User.objects.filter(**_lookup(d["channel"], d["destination"])).exists():
                    raise ApiError("already_registered", "This number already has an account. Sign in instead.", 409)
                user = User(
                    username=f"ak_{secrets.token_hex(8)}",
                    phone=d["destination"] if sms else None, phone_verified_at=now if sms else None,
                    email="" if sms else d["destination"], email_verified_at=None if sms else now,
                    handle=d["handle"], display_name=d["name"], date_of_birth=d["dateOfBirth"], city=d.get("city", ""),
                    terms_version=settings.TERMS_VERSION, terms_accepted_at=now, marketing_opt_in=d["marketingOptIn"],
                )
                user.set_unusable_password()
                user.save()
        except IntegrityError:
            if User.objects.filter(handle=d["handle"]).exists():
                raise ApiError("handle_taken", "That username was just taken. Try another.", 409, extra={"fields": {"handle": ["That username is taken."]}})
            raise ApiError("already_registered", "This number already has an account. Sign in instead.", 409)
        _sign_in(request, user, new=True)
        return Response({"user": MeSerializer(user).data}, status=status.HTTP_201_CREATED)


class HandleAvailableView(AuthView):
    throttle_scope = "auth_handle"

    @extend_schema(parameters=[inline_serializer("HandleQuery", {"handle": serializers.CharField()})], responses=inline_serializer("HandleAvailable", {"handle": serializers.CharField(), "available": serializers.BooleanField(), "reason": serializers.CharField(allow_null=True)}))
    def get(self, request):
        raw = request.query_params.get("handle", "")
        try:
            handle = v.clean_handle(raw)
        except serializers.ValidationError as e:
            return Response({"handle": raw, "available": False, "reason": str(e.detail[0])})
        mine = request.user.is_authenticated and request.user.handle == handle
        taken = not mine and User.objects.filter(handle=handle).exists()
        return Response({"handle": handle, "available": not taken, "reason": "That username is taken." if taken else None})


class MeView(AuthView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "account"

    @extend_schema(responses=MeSerializer)
    def get(self, request):
        return Response(MeSerializer(request.user).data)

    @extend_schema(request=MeSerializer, responses=MeSerializer)
    def patch(self, request):
        s = MeSerializer(request.user, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        security.record(Kind.PROFILE_CHANGED, request, user=request.user, fields=sorted(request.data.keys()))
        return Response(s.data)


class SignOutView(AuthView):
    throttle_scope = "account"

    @extend_schema(request=None, responses={204: None})
    def post(self, request):
        if request.user.is_authenticated:
            security.record(Kind.SIGNED_OUT, request, user=request.user)
            UserSession.objects.filter(session_key=request.session.session_key).delete()
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class SessionsView(AuthView):
    """Devices you're signed in on. DELETE ends every session except this one."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "account"

    @extend_schema(responses=SessionSerializer(many=True))
    def get(self, request):
        qs = UserSession.objects.filter(user=request.user)
        return Response(SessionSerializer(qs, many=True, context={"request": request}).data)

    @extend_schema(operation_id="account_sessions_end_others", responses=inline_serializer("SessionsEnded", {"ended": serializers.IntegerField()}))
    def delete(self, request):
        n = security.end_sessions(request.user, keep_key=request.session.session_key)
        security.record(Kind.SESSION_REVOKED, request, user=request.user, count=n, scope="others")
        return Response({"ended": n})


class SessionDetailView(AuthView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "account"

    @extend_schema(responses={204: None})
    def delete(self, request, pk):
        session = UserSession.objects.filter(user=request.user, pk=pk).first()
        if session is None:
            raise ApiError("not_found", "That session has already ended.", 404)
        if session.session_key == request.session.session_key:
            raise ApiError("use_sign_out", "To end this session, sign out.", 400)
        security.end_session(session)
        security.record(Kind.SESSION_REVOKED, request, user=request.user, scope="one")
        return Response(status=status.HTTP_204_NO_CONTENT)


def _require_recent_auth(request):
    if not security.has_recent_auth(request):
        raise ApiError("reauth_required", "For your security, confirm it's you by signing in again.", 401)


class ContactStartView(AuthView):
    """Add or change your phone or email: sends a code to the new one. Needs a recent sign-in."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "auth_start"

    @extend_schema(request=ContactSerializer, responses={202: inline_serializer("ContactCodeSent", {"sentTo": serializers.CharField(), "channel": serializers.CharField()})})
    def post(self, request):
        _require_recent_auth(request)
        s = ContactSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        if User.objects.filter(**_lookup(d["channel"], d["destination"])).exclude(pk=request.user.pk).exists():
            raise ApiError("contact_in_use", "That's already used by another account.", 409)
        codes.issue(channel=d["channel"], destination=d["destination"], purpose=LoginCode.Purpose.CHANGE_CONTACT, request=request, user=request.user)
        return Response({"sentTo": v.mask_destination(d["destination"]), "channel": d["channel"]}, status=status.HTTP_202_ACCEPTED)


class ContactVerifyView(AuthView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "auth_verify"

    @extend_schema(request=VerifySerializer, responses=MeSerializer)
    def post(self, request):
        _require_recent_auth(request)
        s = VerifySerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        user = request.user
        codes.check(destination=d["destination"], purpose=LoginCode.Purpose.CHANGE_CONTACT, code=d["code"], request=request, user=user)
        old_email = user.email
        now = timezone.now()
        if d["channel"] == LoginCode.Channel.SMS:
            user.phone, user.phone_verified_at, fields = d["destination"], now, ["phone", "phone_verified_at"]
        else:
            user.email, user.email_verified_at, fields = d["destination"], now, ["email", "email_verified_at"]
        try:
            user.save(update_fields=fields)
        except IntegrityError:
            raise ApiError("contact_in_use", "That's already used by another account.", 409)
        security.record(Kind.CONTACT_CHANGED, request, user=user, destination=d["destination"], channel=d["channel"])
        if old_email and old_email != user.email:
            delivery.notify(User(email=old_email), "Your Akines email was changed", f"The email on your Akines account was changed to {v.mask_destination(user.email)}.")
        elif user.email:
            delivery.notify(user, "Your Akines contact details changed", f"Your {'phone number' if d['channel'] == 'sms' else 'email'} on Akines was updated.")
        return Response(MeSerializer(user).data)


def _primary_contact(user):
    if user.phone:
        return LoginCode.Channel.SMS, user.phone
    if user.email:
        return LoginCode.Channel.EMAIL, user.email
    raise ApiError("no_contact", "Add a phone number or email first.", 400)


class DeleteAccountStartView(AuthView):
    """Step 1 of deleting your account: sends a confirmation code to your phone (or email)."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "auth_start"

    @extend_schema(request=None, responses={202: inline_serializer("DeleteCodeSent", {"sentTo": serializers.CharField(), "channel": serializers.CharField()})})
    def post(self, request):
        channel, dest = _primary_contact(request.user)
        codes.issue(channel=channel, destination=dest, purpose=LoginCode.Purpose.DELETE_ACCOUNT, request=request, user=request.user)
        return Response({"sentTo": v.mask_destination(dest), "channel": channel}, status=status.HTTP_202_ACCEPTED)


class DeleteAccountConfirmView(AuthView):
    """Step 2: with the code, removes personal data, ends every session and leaves all communities."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "auth_verify"

    @extend_schema(request=CodeSerializer, responses={204: None})
    def post(self, request):
        s = CodeSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = request.user
        channel, dest = _primary_contact(user)
        blocking = _sole_leader_of(user)
        if blocking:
            raise ApiError("sole_leader", "You're the only leader of a community with members. Make someone else a leader first.", 409, extra={"communities": blocking})
        codes.check(destination=dest, purpose=LoginCode.Purpose.DELETE_ACCOUNT, code=s.validated_data["code"], request=request, user=user)
        with transaction.atomic():
            from communities.models import Membership
            Membership.objects.filter(user=user).delete()
            user.phone = None
            user.email = ""
            user.handle = None
            user.display_name = ""
            user.first_name = user.last_name = ""
            user.date_of_birth = None
            user.city = user.role = user.avatar_url = ""
            user.phone_verified_at = user.email_verified_at = None
            user.marketing_opt_in = False
            user.is_active = False
            user.deleted_at = timezone.now()
            user.set_unusable_password()
            user.save()
        security.record(Kind.ACCOUNT_DELETED, request, user=user)
        security.end_sessions(user)
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


def _sole_leader_of(user):
    from django.db.models import Count, Q

    from communities.models import CommunityCircle, Membership

    led_ids = Membership.objects.filter(user=user, role=Membership.Role.LEADER).values("community_id")
    led = CommunityCircle.objects.filter(pk__in=led_ids).annotate(
        leaders=Count("memberships", filter=Q(memberships__role=Membership.Role.LEADER), distinct=True),
        members=Count("memberships", distinct=True),
    )
    return [{"id": c.slug, "name": c.name} for c in led if c.leaders == 1 and c.members > 1]
