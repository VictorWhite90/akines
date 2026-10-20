import secrets

from django.db import transaction
from django.db.models import Count, Prefetch, Q
from django.shortcuts import get_object_or_404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.throttles import IpScopedThrottle

from .models import CommunityCircle, Membership
from .permissions import IsLeaderOrReadOnly
from .serializers import CommunitySerializer


def with_counts(qs):
    return qs.annotate(member_count=Count("memberships", distinct=True)).prefetch_related(
        Prefetch("memberships", queryset=Membership.objects.select_related("user"))
    )


class CommunityViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    GET    /api/v1/communities/?q=&category=&area=&page=   browse, 20 per page
    POST   /api/v1/communities/                      register a community (you become its leader)
    GET    /api/v1/communities/<id>/                 one community
    PATCH  /api/v1/communities/<id>/                 leaders edit
    POST   /api/v1/communities/<id>/join/            join (needs the invite code unless verified)
    POST   /api/v1/communities/<id>/leave/
    GET    /api/v1/communities/mine/                 communities you belong to
    GET    /api/v1/communities/by-code/<code>/       open an invite link
    """

    serializer_class = CommunitySerializer
    lookup_field = "slug"
    lookup_url_kwarg = "pk"
    permission_classes = [IsLeaderOrReadOnly]

    def get_throttles(self):
        if self.action == "by_code":  # invite codes must not be guessable by brute force
            self.throttle_scope = "invite_lookup"
            return [*super().get_throttles(), IpScopedThrottle()]
        if self.request.method not in ("GET", "HEAD", "OPTIONS"):
            self.throttle_scope = "community_write"
            return [*super().get_throttles(), IpScopedThrottle()]
        return super().get_throttles()

    def get_permissions(self):
        if self.action in ("create", "join", "leave", "mine"):
            return [IsAuthenticated()]
        return [p() for p in self.permission_classes]

    def get_queryset(self):
        qs = with_counts(CommunityCircle.objects.all())
        p = self.request.query_params
        if self.action == "list":
            if p.get("q"):
                qs = qs.filter(Q(name__icontains=p["q"]) | Q(tagline__icontains=p["q"]))
            if p.get("category"):
                qs = qs.filter(category=p["category"])
            if p.get("area"):
                qs = qs.filter(area=p["area"])
        return qs

    @transaction.atomic
    def perform_create(self, serializer):
        circle = serializer.save(created_by=self.request.user)
        Membership.objects.create(community=circle, user=self.request.user, role=Membership.Role.LEADER)

    def _fresh(self, circle):
        return Response(self.get_serializer(with_counts(CommunityCircle.objects.filter(pk=circle.pk)).get()).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        resp = self._fresh(serializer.instance)
        resp.status_code = status.HTTP_201_CREATED
        return resp

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        circle = self.get_object()
        code = (request.data.get("code") or "").strip().upper()
        if not circle.verified and not secrets.compare_digest(code, circle.invite_code):
            return Response({"detail": "This community is invite-only. Ask a leader for the link."}, status=status.HTTP_403_FORBIDDEN)
        Membership.objects.get_or_create(community=circle, user=request.user)
        return self._fresh(circle)

    @action(detail=True, methods=["post"])
    def leave(self, request, pk=None):
        circle = self.get_object()
        m = circle.memberships.filter(user=request.user).first()
        if not m:
            return self._fresh(circle)
        if m.role == Membership.Role.LEADER and circle.memberships.filter(role=Membership.Role.LEADER).count() == 1:
            return Response({"detail": "You're the only leader. Make someone else a leader before you leave."}, status=status.HTTP_400_BAD_REQUEST)
        m.delete()
        return self._fresh(circle)

    @action(detail=False, methods=["get"])
    def mine(self, request):
        qs = self.get_queryset().filter(memberships__user=request.user)
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=["get"], url_path=r"by-code/(?P<code>[A-Za-z0-9]{4,12})", permission_classes=[AllowAny])
    def by_code(self, request, code=None):
        circle = get_object_or_404(self.get_queryset(), invite_code=code.upper())
        return Response(self.get_serializer(circle).data)
