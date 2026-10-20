from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Akines member. Phone is the main sign-in; email is the fallback."""

    phone = models.CharField(max_length=20, unique=True, null=True, blank=True, help_text="E.164, e.g. +2348012345678")
    display_name = models.CharField(max_length=80, blank=True)
    city = models.CharField(max_length=80, blank=True)
    role = models.CharField(max_length=80, blank=True, help_text="What they do, in their words")
    avatar_url = models.URLField(blank=True)

    def __str__(self):
        return self.display_name or self.phone or self.username


class LoginCode(models.Model):
    """A one-time sign-in code sent by SMS or email. Only a hash of the code is stored."""

    class Channel(models.TextChoices):
        SMS = "sms", "SMS"
        EMAIL = "email", "Email"

    channel = models.CharField(max_length=5, choices=Channel.choices)
    destination = models.CharField(max_length=254, db_index=True, help_text="Phone in E.164 or a lower-case email")
    code_hash = models.CharField(max_length=64)
    attempts = models.PositiveSmallIntegerField(default=0)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.channel} code for {self.destination}"
