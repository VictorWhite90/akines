from django.core.cache import cache
from django.utils import timezone

from .models import UserSession


class SessionActivityMiddleware:
    """Keeps each device's "last active" fresh, writing at most once every 5 minutes per session."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        user = getattr(request, "user", None)
        key = getattr(getattr(request, "session", None), "session_key", None)
        if key and user is not None and user.is_authenticated and cache.add(f"seen:{key}", 1, 300):
            UserSession.objects.filter(session_key=key).update(last_seen_at=timezone.now())
        return response
