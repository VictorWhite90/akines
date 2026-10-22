from rest_framework.authentication import SessionAuthentication
from rest_framework.throttling import ScopedRateThrottle

from .security import client_ip


class IpScopedThrottle(ScopedRateThrottle):
    """Per-IP limit for a view's `throttle_scope`, using the same proxy-aware IP as the audit log."""

    def get_ident(self, request):
        return client_ip(request) or super().get_ident(request)

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}


class CsrfSessionAuthentication(SessionAuthentication):
    """Session cookies, with CSRF enforced on every unsafe request, signed in or not (blocks login CSRF)."""

    def authenticate(self, request):
        if request.method not in ("GET", "HEAD", "OPTIONS", "TRACE"):
            self.enforce_csrf(request)
        return super().authenticate(request)
