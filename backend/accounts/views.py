import secrets

from django.contrib.auth import login, logout
from django.db import IntegrityError, transaction
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from . import codes
from .models import LoginCode, User
from .serializers import MeSerializer


def _destination(data):
    """(channel, normalised destination) from {"phone": …} or {"email": …}."""
    if data.get("phone"):
        phone = codes.normalise_phone(data["phone"])
        if not phone:
            raise codes.CodeError("Enter a valid phone number, e.g. 0803 123 4567.")
        return LoginCode.Channel.SMS, phone
    email = codes.normalise_email(data.get("email"))
    if not email:
        raise codes.CodeError("Enter your phone number or email.")
    return LoginCode.Channel.EMAIL, email


def _error(e):
    return Response({"detail": str(e)}, status=e.status)


@api_view(["GET"])
@permission_classes([AllowAny])
def csrf(request):
    """Sets the csrftoken cookie; the app calls this once before its first POST."""
    return Response({"csrfToken": get_token(request)})


@api_view(["POST"])
@permission_classes([AllowAny])
def request_code(request):
    """POST {"phone": "0803…"} or {"email": "…"} → sends a 6-digit code."""
    try:
        channel, dest = _destination(request.data)
        codes.issue(channel, dest)
    except codes.CodeError as e:
        return _error(e)
    exists = User.objects.filter(**({"phone": dest} if channel == LoginCode.Channel.SMS else {"email__iexact": dest})).exists()
    return Response({"sentTo": dest, "channel": channel, "isNew": not exists})


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_code(request):
    """POST {"phone"|"email", "code", "name"?} → signs in, creating the account the first time."""
    try:
        channel, dest = _destination(request.data)
        codes.check(dest, request.data.get("code"))
    except codes.CodeError as e:
        return _error(e)
    lookup = {"phone": dest} if channel == LoginCode.Channel.SMS else {"email__iexact": dest}
    user = User.objects.filter(**lookup).first()
    created = False
    if not user:
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=f"ak_{secrets.token_hex(5)}",
                    phone=dest if channel == LoginCode.Channel.SMS else None,
                    email=dest if channel == LoginCode.Channel.EMAIL else "",
                    display_name=(request.data.get("name") or "").strip()[:80],
                )
                user.set_unusable_password()
                user.save(update_fields=["password"])
                created = True
        except IntegrityError:
            user = User.objects.get(**lookup)
    login(request, user, backend="django.contrib.auth.backends.ModelBackend")
    return Response({"user": MeSerializer(user).data, "isNew": created}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    if request.method == "PATCH":
        s = MeSerializer(request.user, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)
    return Response(MeSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def sign_out(request):
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)
