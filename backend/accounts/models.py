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
