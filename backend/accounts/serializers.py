from rest_framework import serializers

from .models import User


class MeSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="username", read_only=True)
    name = serializers.CharField(source="display_name", allow_blank=True, max_length=80, required=False)
    avatarUrl = serializers.URLField(source="avatar_url", allow_blank=True, required=False)
    isStaff = serializers.BooleanField(source="is_staff", read_only=True)

    class Meta:
        model = User
        fields = ["id", "name", "phone", "email", "city", "role", "avatarUrl", "isStaff"]
        read_only_fields = ["phone", "email"]
