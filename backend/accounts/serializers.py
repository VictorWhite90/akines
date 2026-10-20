from django.conf import settings
from django.core import signing
from rest_framework import serializers

from . import validators as v
from .models import LoginCode, User, UserSession
from .security import describe_device

SIGNUP_SALT = "akines.accounts.signup"


class ContactSerializer(serializers.Serializer):
    """Exactly one of phone or email. Adds `channel` and the normalised `destination`."""

    phone = serializers.CharField(required=False, allow_blank=True, max_length=32)
    email = serializers.CharField(required=False, allow_blank=True, max_length=254)

    def validate(self, attrs):
        phone, email = attrs.get("phone", "").strip(), attrs.get("email", "").strip()
        if bool(phone) == bool(email):
            raise serializers.ValidationError("Enter your phone number or your email.", code="contact_required")
        try:
            if phone:
                attrs.update(channel=LoginCode.Channel.SMS, destination=v.clean_phone(phone))
            else:
                attrs.update(channel=LoginCode.Channel.EMAIL, destination=v.clean_email(email))
        except serializers.ValidationError as e:
            raise serializers.ValidationError({"phone" if phone else "email": e.detail})
        return attrs


class StartSerializer(ContactSerializer):
    captchaToken = serializers.CharField(required=False, allow_blank=True, max_length=4096)


class CodeSerializer(serializers.Serializer):
    code = serializers.RegexField(r"^\d{6}$", error_messages={"invalid": "Enter the 6-digit code."})


class VerifySerializer(ContactSerializer, CodeSerializer):
    pass


def make_signup_token(channel, destination):
    return signing.dumps({"c": channel, "d": destination}, salt=SIGNUP_SALT, compress=True)


def read_signup_token(token):
    try:
        data = signing.loads(token, salt=SIGNUP_SALT, max_age=settings.SIGNUP_TOKEN_MAX_AGE)
        return data["c"], data["d"]
    except (signing.BadSignature, KeyError, TypeError):
        raise serializers.ValidationError({"signupToken": ["Your sign-up session expired. Start again with your number."]}, code="signup_expired")


class HandleField(serializers.CharField):
    def to_internal_value(self, data):
        return v.clean_handle(super().to_internal_value(data))


class NameField(serializers.CharField):
    def to_internal_value(self, data):
        return v.clean_name(super().to_internal_value(data))


class TextField(serializers.CharField):
    def __init__(self, limit, **kw):
        self.limit = limit
        super().__init__(allow_blank=True, required=False, **kw)

    def to_internal_value(self, data):
        return v.clean_text(super().to_internal_value(data), self.limit)


class CompleteSignupSerializer(serializers.Serializer):
    signupToken = serializers.CharField(max_length=2048)
    name = NameField(max_length=200)
    handle = HandleField(max_length=64)
    dateOfBirth = serializers.DateField()
    city = TextField(80)
    acceptTerms = serializers.BooleanField()
    termsVersion = serializers.CharField(max_length=20)
    marketingOptIn = serializers.BooleanField(default=False)

    def validate_dateOfBirth(self, value):
        return v.clean_date_of_birth(value)

    def validate_handle(self, value):
        if User.objects.filter(handle=value).exists():
            raise serializers.ValidationError("That username is taken.", code="handle_taken")
        return value

    def validate(self, attrs):
        if not attrs["acceptTerms"]:
            raise serializers.ValidationError({"acceptTerms": ["Please accept the Terms and Privacy Policy to continue."]})
        if attrs["termsVersion"] != settings.TERMS_VERSION:
            raise serializers.ValidationError("Our terms have been updated. Please review them again.", code="terms_outdated")
        attrs["channel"], attrs["destination"] = read_signup_token(attrs["signupToken"])
        return attrs


class MeSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="username", read_only=True)
    name = NameField(source="display_name", max_length=200, required=False)
    handle = HandleField(max_length=64, required=False)
    city = TextField(80)
    role = TextField(80)
    avatarUrl = serializers.URLField(source="avatar_url", allow_blank=True, required=False, max_length=500)
    phoneVerified = serializers.SerializerMethodField()
    emailVerified = serializers.SerializerMethodField()
    marketingOptIn = serializers.BooleanField(source="marketing_opt_in", required=False)
    isStaff = serializers.BooleanField(source="is_staff", read_only=True)
    joinedAt = serializers.DateTimeField(source="date_joined", read_only=True)

    class Meta:
        model = User
        fields = ["id", "handle", "name", "phone", "email", "phoneVerified", "emailVerified", "city", "role", "avatarUrl", "marketingOptIn", "isStaff", "joinedAt"]
        read_only_fields = ["phone", "email"]

    def get_phoneVerified(self, u) -> bool:
        return bool(u.phone and u.phone_verified_at)

    def get_emailVerified(self, u) -> bool:
        return bool(u.email and u.email_verified_at)

    def validate_avatarUrl(self, value):
        if value and not value.startswith("https://"):
            raise serializers.ValidationError("Use a secure (https) image link.")
        return value

    def validate_handle(self, value):
        if User.objects.filter(handle=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("That username is taken.", code="handle_taken")
        return value


class SessionSerializer(serializers.ModelSerializer):
    device = serializers.SerializerMethodField()
    current = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at")
    lastSeenAt = serializers.DateTimeField(source="last_seen_at")

    class Meta:
        model = UserSession
        fields = ["id", "device", "ip", "createdAt", "lastSeenAt", "current"]

    def get_device(self, s) -> str:
        return describe_device(s.user_agent)

    def get_current(self, s) -> bool:
        return s.session_key == self.context["request"].session.session_key
