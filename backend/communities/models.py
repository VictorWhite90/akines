import secrets

from django.conf import settings
from django.db import models
from django.utils.text import slugify

# Same lists as lib/data/communityCircles.ts (ABUJA_AREAS, COMMUNITY_CATEGORIES).
AREAS = ["Wuse", "Wuse 2", "Maitama", "Asokoro", "Garki", "Jabi", "Utako", "Gwarinpa", "Kubwa", "Lugbe", "Life Camp", "Katampe", "Central Area"]
CATEGORIES = ["Social hangouts", "Food & conversation", "Books & writing", "Faith & fellowship", "Wellness", "Creatives", "Careers & business", "Sports & fitness", "Games", "Volunteering"]

DEFAULT_GUIDELINES = [
    "Come as you are. Everyone here is welcome.",
    "Respect people's boundaries, online and in person.",
    "No harassment, hate or selling without permission.",
    "Look out for each other and tell a leader if something feels off.",
]

CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def default_guidelines():
    return list(DEFAULT_GUIDELINES)


class CommunityCircle(models.Model):
    """A big KinCircle: an organisation with leaders, members and (later) events."""

    slug = models.SlugField(max_length=80, unique=True, help_text="Public id used in URLs")
    name = models.CharField(max_length=80)
    tagline = models.CharField(max_length=140, blank=True)
    about = models.TextField(blank=True)
    category = models.CharField(max_length=40, choices=[(c, c) for c in CATEGORIES])
    area = models.CharField(max_length=40, choices=[(a, a) for a in AREAS])
    city = models.CharField(max_length=60, default="Abuja")
    photo = models.CharField(max_length=300, blank=True, help_text="Photo key from the app or an image URL")
    instagram = models.CharField(max_length=60, blank=True)
    whatsapp = models.CharField(max_length=30, blank=True)
    invite_code = models.CharField(max_length=12, unique=True, editable=False)
    guidelines = models.JSONField(default=default_guidelines, blank=True)
    verified = models.BooleanField(default=False, help_text="Checked by the Akines team")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="communities_created")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["category"]), models.Index(fields=["area"]), models.Index(fields=["verified"])]
        verbose_name = "community circle"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._unique_slug()
        if not self.invite_code:
            self.invite_code = self._unique_code()
        super().save(*args, **kwargs)

    def _unique_slug(self):
        base = slugify(self.name)[:70] or "circle"
        slug, n = base, 2
        while CommunityCircle.objects.filter(slug=slug).exists():
            slug, n = f"{base}-{n}", n + 1
        return slug

    @staticmethod
    def _unique_code():
        while True:
            code = "".join(secrets.choice(CODE_CHARS) for _ in range(6))
            if not CommunityCircle.objects.filter(invite_code=code).exists():
                return code


class Membership(models.Model):
    class Role(models.TextChoices):
        LEADER = "leader", "Leader"
        MEMBER = "member", "Member"

    community = models.ForeignKey(CommunityCircle, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="memberships")
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["community", "user"], name="one_membership_per_user")]
        indexes = [models.Index(fields=["community", "role"])]

    def __str__(self):
        return f"{self.user} in {self.community} ({self.role})"
