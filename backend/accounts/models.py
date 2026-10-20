from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower


class User(AbstractUser):
    """An Akines member. Signs in with a one-time code to their phone (or email as a fallback)."""

    phone = models.CharField(max_length=20, unique=True, null=True, blank=True, help_text="E.164, e.g. +2348031234567")
    phone_verified_at = models.DateTimeField(null=True, blank=True)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    handle = models.CharField(max_length=30, unique=True, null=True, blank=True, help_text="Public @username, lower-case")
    display_name = models.CharField(max_length=80, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    city = models.CharField(max_length=80, blank=True)
    role = models.CharField(max_length=80, blank=True, help_text="What they do, in their words")
    avatar_url = models.URLField(blank=True)
    terms_version = models.CharField(max_length=20, blank=True)
    terms_accepted_at = models.DateTimeField(null=True, blank=True)
    marketing_opt_in = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True, help_text="Set when the member deleted their account")

    class Meta:
        constraints = [
            models.UniqueConstraint(Lower("email"), condition=~Q(email=""), name="unique_email_ci"),
        ]

    def __str__(self):
        return self.display_name or (f"@{self.handle}" if self.handle else "") or self.phone or self.username


class LoginCode(models.Model):
    """A one-time code sent by SMS or email. Only an HMAC of the code is stored."""

    class Channel(models.TextChoices):
        SMS = "sms", "SMS"
        EMAIL = "email", "Email"

    class Purpose(models.TextChoices):
        SIGN_IN = "sign_in", "Sign in or sign up"
        CHANGE_CONTACT = "change_contact", "Add or change phone/email"
        DELETE_ACCOUNT = "delete_account", "Delete account"

    channel = models.CharField(max_length=5, choices=Channel.choices)
    purpose = models.CharField(max_length=20, choices=Purpose.choices, default=Purpose.SIGN_IN)
    destination = models.CharField(max_length=254, help_text="Phone in E.164 or a lower-case email")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="+", help_text="Set for codes tied to a signed-in account")
    code_hash = models.CharField(max_length=64)
    attempts = models.PositiveSmallIntegerField(default=0)
    ip = models.GenericIPAddressField(null=True, blank=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["destination", "-created_at"]),
            models.Index(fields=["ip", "-created_at"]),
            models.Index(fields=["channel", "created_at"]),
        ]

    def __str__(self):
        return f"{self.get_purpose_display()} code ({self.channel})"


class UserSession(models.Model):
    """One signed-in device. Lets members see where they're signed in and sign a device out remotely."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="device_sessions")
    session_key = models.CharField(max_length=40, unique=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-last_seen_at"]

    def __str__(self):
        return f"{self.user} on {self.user_agent[:40] or 'unknown device'}"


class SecurityEvent(models.Model):
    """Append-only audit trail for account security. Never stores codes; destinations are masked."""

    class Kind(models.TextChoices):
        CODE_SENT = "code_sent"
        CODE_FAILED = "code_failed"
        LOCKED = "locked"
        SIGNED_UP = "signed_up"
        SIGNED_IN = "signed_in"
        SIGNED_OUT = "signed_out"
        SESSION_REVOKED = "session_revoked"
        CONTACT_CHANGED = "contact_changed"
        PROFILE_CHANGED = "profile_changed"
        ACCOUNT_DELETED = "account_deleted"
        SMS_CAP_REACHED = "sms_cap_reached"

    kind = models.CharField(max_length=20, choices=Kind.choices)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="security_events")
    destination = models.CharField(max_length=60, blank=True, help_text="Masked")
    ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)
    meta = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "-created_at"]), models.Index(fields=["kind", "-created_at"])]

    def __str__(self):
        return f"{self.kind} at {self.created_at:%Y-%m-%d %H:%M}"
