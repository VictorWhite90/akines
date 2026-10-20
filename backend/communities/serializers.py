import re

from django.conf import settings
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from accounts import validators as v

from .models import CommunityCircle, Membership

PHOTO_KEY_RE = re.compile(r"^[A-Za-z][A-Za-z0-9]{1,40}$")
INSTAGRAM_RE = re.compile(r"^(?!.*\.\.)(?!\.)[A-Za-z0-9._]{1,30}(?<!\.)$")


class PersonSerializer(serializers.Serializer):
    id = serializers.CharField(source="username")
    handle = serializers.CharField()
    name = serializers.SerializerMethodField()
    city = serializers.CharField()
    role = serializers.CharField()
    avatarUrl = serializers.CharField(source="avatar_url")

    def get_name(self, u) -> str:
        return u.display_name or u.get_full_name() or u.username


class CommunitySerializer(serializers.ModelSerializer):
    """Field names match the CommunityCircle type in lib/data/communityCircles.ts."""

    id = serializers.CharField(source="slug", read_only=True)
    inviteCode = serializers.CharField(source="invite_code", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    members = serializers.IntegerField(source="member_count", read_only=True, default=0)
    leaders = serializers.SerializerMethodField()
    mine = serializers.SerializerMethodField()
    myRole = serializers.SerializerMethodField()

    class Meta:
        model = CommunityCircle
        fields = ["id", "name", "tagline", "about", "category", "area", "city", "photo", "verified", "leaders", "members", "instagram", "whatsapp", "inviteCode", "guidelines", "createdAt", "mine", "myRole"]
        read_only_fields = ["verified"]

    def _membership(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return None
        # memberships are prefetched by the view, so this costs no extra query
        return next((m for m in obj.memberships.all() if m.user_id == user.id), None)

    @extend_schema_field(PersonSerializer(many=True))
    def get_leaders(self, obj):
        leaders = [m.user for m in obj.memberships.all() if m.role == Membership.Role.LEADER]
        return PersonSerializer(leaders, many=True).data

    def get_mine(self, obj) -> bool:
        return self._membership(obj) is not None

    def get_myRole(self, obj) -> str | None:
        m = self._membership(obj)
        return m.role if m else None

    def to_representation(self, obj):
        data = super().to_representation(obj)
        # The invite code is for members to share; outsiders only reach a circle with it.
        if not data["mine"]:
            data["inviteCode"] = None
        return data

    def validate_name(self, value):
        value = v.clean_text(value, 60)
        if len(value) < 3:
            raise serializers.ValidationError("Give your community a name of at least 3 characters.")
        return value

    def validate_tagline(self, value):
        return v.clean_text(value, 140)

    def validate_about(self, value):
        return v.clean_text(value, 2000, keep_newlines=True)

    def validate_photo(self, value):
        value = (value or "").strip()
        if value and not (PHOTO_KEY_RE.fullmatch(value) or (value.startswith("https://") and len(value) <= 300)):
            raise serializers.ValidationError("Choose one of the photos or use a secure (https) image link.")
        return value

    def validate_instagram(self, value):
        value = re.sub(r"^(https?://)?(www\.)?instagram\.com/", "", (value or "").strip()).strip("/").lstrip("@")
        if value and not INSTAGRAM_RE.fullmatch(value):
            raise serializers.ValidationError("Enter your Instagram username, e.g. comealoneclub.abj")
        return value

    def validate_whatsapp(self, value):
        return v.clean_phone(value) if (value or "").strip() else ""

    def validate(self, attrs):
        request = self.context["request"]
        if self.instance is None and not request.user.is_staff:
            made = CommunityCircle.objects.filter(created_by=request.user).count()
            if made >= settings.COMMUNITY_MAX_PER_USER:
                raise serializers.ValidationError(f"You can register up to {settings.COMMUNITY_MAX_PER_USER} communities. Contact support to add more.", code="community_limit")
        return attrs

    def validate_guidelines(self, value):
        if not isinstance(value, list) or not all(isinstance(x, str) and x.strip() for x in value) or len(value) > 20:
            raise serializers.ValidationError("A list of up to 20 short guidelines.")
        return [v.clean_text(x, 240) for x in value]
