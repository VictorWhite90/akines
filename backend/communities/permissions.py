from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import Membership


class IsLeaderOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.memberships.filter(user=request.user, role=Membership.Role.LEADER).exists()
