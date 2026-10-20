from rest_framework import serializers

from .models import CommunityCircle, Membership


class PersonSerializer(serializers.Serializer):
    id = serializers.CharField(source="username")
    name = serializers.SerializerMethodField()
    city = serializers.CharField()
    role = serializers.CharField()
    avatarUrl = serializers.CharField(source="avatar_url")

    def get_name(self, u):
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

    def get_leaders(self, obj):
        leaders = [m.user for m in obj.memberships.all() if m.role == Membership.Role.LEADER]
        return PersonSerializer(leaders, many=True).data

    def get_mine(self, obj):
        return self._membership(obj) is not None

    def get_myRole(self, obj):
        m = self._membership(obj)
        return m.role if m else None

    def to_representation(self, obj):
        data = super().to_representation(obj)
        # The invite code is for members to share; outsiders only reach a circle with it.
        if not data["mine"]:
            data["inviteCode"] = None
        return data

    def validate_guidelines(self, value):
        if not isinstance(value, list) or not all(isinstance(x, str) and x.strip() for x in value) or len(value) > 20:
            raise serializers.ValidationError("A list of up to 20 short guidelines.")
        return [x.strip()[:240] for x in value]
