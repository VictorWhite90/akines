"""Request context (client IP, device), the audit log and device sessions."""
import ipaddress
import logging
from importlib import import_module

from django.conf import settings
from django.utils import timezone

from .models import SecurityEvent, UserSession
from .validators import mask_destination

log = logging.getLogger("akines.security")


def client_ip(request):
    """The caller's IP. Behind a load balancer, trusts exactly TRUSTED_PROXY_COUNT hops of X-Forwarded-For."""
    request = getattr(request, "_request", request)
    remote = request.META.get("REMOTE_ADDR")
    hops = settings.TRUSTED_PROXY_COUNT
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if hops and xff:
        chain = [p.strip() for p in xff.split(",") if p.strip()]
        if len(chain) >= hops:
            remote = chain[-hops]
    try:
        return str(ipaddress.ip_address(remote)) if remote else None
    except ValueError:
        return None


def user_agent(request):
    request = getattr(request, "_request", request)
    return (request.META.get("HTTP_USER_AGENT") or "")[:300]


def record(kind, request=None, user=None, destination="", **meta):
    SecurityEvent.objects.create(
        kind=kind,
        user=user if user is not None and user.pk else None,
        destination=mask_destination(destination) if destination else "",
        ip=client_ip(request) if request is not None else None,
        user_agent=user_agent(request) if request is not None else "",
        meta=meta,
    )
    log.info("security_event kind=%s user=%s ip=%s %s", kind, getattr(user, "pk", None), client_ip(request) if request is not None else None, meta or "")


def mark_recent_auth(request):
    request.session["auth_at"] = int(timezone.now().timestamp())


def has_recent_auth(request):
    at = request.session.get("auth_at")
    return bool(at) and timezone.now().timestamp() - at <= settings.RECENT_AUTH_SECONDS


def track_session(request, user):
    if not request.session.session_key:
        request.session.save()
    UserSession.objects.update_or_create(
        session_key=request.session.session_key,
        defaults={"user": user, "ip": client_ip(request), "user_agent": user_agent(request), "last_seen_at": timezone.now()},
    )


def end_sessions(user, keep_key=None):
    """Signs a member out of every device (optionally except the current one). Returns how many ended."""
    store = import_module(settings.SESSION_ENGINE).SessionStore
    qs = UserSession.objects.filter(user=user)
    if keep_key:
        qs = qs.exclude(session_key=keep_key)
    keys = list(qs.values_list("session_key", flat=True))
    for key in keys:
        store(session_key=key).delete()
    qs.delete()
    return len(keys)


def end_session(session):
    store = import_module(settings.SESSION_ENGINE).SessionStore
    store(session_key=session.session_key).delete()
    session.delete()


def describe_device(ua):
    ua = ua or ""
    os_name = next((n for k, n in [("iPhone", "iPhone"), ("iPad", "iPad"), ("Android", "Android"), ("Windows", "Windows"), ("Mac OS X", "Mac"), ("Macintosh", "Mac"), ("Linux", "Linux")] if k in ua), "Unknown device")
    browser = next((n for k, n in [("Edg/", "Edge"), ("OPR/", "Opera"), ("Chrome/", "Chrome"), ("CriOS", "Chrome"), ("Firefox/", "Firefox"), ("FxiOS", "Firefox"), ("Safari/", "Safari")] if k in ua), "")
    return f"{browser} on {os_name}" if browser else os_name
