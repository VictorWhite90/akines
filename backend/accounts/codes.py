"""Issuing and checking one-time codes, with the limits that protect accounts and the SMS budget.

Limits (all configurable in settings):
- one code per destination per LOGIN_CODE_RESEND_SECONDS; LOGIN_CODE_MAX_PER_HOUR / _PER_DAY per destination
- LOGIN_CODE_MAX_PER_IP_HOUR codes per IP (generous: Nigerian mobile networks share IPs)
- LOGIN_CODE_MAX_ATTEMPTS guesses per code; LOGIN_LOCK_AFTER_FAILS wrong guesses per destination per hour locks it
- SMS_DAILY_CAP texts per day across the whole platform (stops SMS-pumping fraud running up the bill)
- requesting a new code cancels the previous one; a code works once
"""
import hashlib
import hmac
import secrets
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from akines_api.exceptions import ApiError

from . import delivery, security
from .models import LoginCode, SecurityEvent


def _hash(purpose, destination, code):
    key = hashlib.sha256(f"akines-otp:{settings.SECRET_KEY}".encode()).digest()
    return hmac.new(key, f"{purpose}:{destination}:{code}".encode(), hashlib.sha256).hexdigest()


def _wait(seconds):
    return max(1, int(seconds))


def _failed_recently(destination):
    since = timezone.now() - timedelta(hours=1)
    return LoginCode.objects.filter(destination=destination, created_at__gte=since).aggregate(n=Sum("attempts"))["n"] or 0


def _locked_error():
    return ApiError("locked", "Too many wrong codes. For your safety, try again in an hour.", 429, retry_after=3600)


def issue(*, channel, destination, purpose, request, user=None):
    now = timezone.now()
    ip = security.client_ip(request)
    s = settings

    if _failed_recently(destination) >= s.LOGIN_LOCK_AFTER_FAILS:
        raise _locked_error()
    per_dest = LoginCode.objects.filter(destination=destination)
    last = per_dest.only("created_at").first()
    if last and (now - last.created_at).total_seconds() < s.LOGIN_CODE_RESEND_SECONDS:
        wait = s.LOGIN_CODE_RESEND_SECONDS - (now - last.created_at).total_seconds()
        raise ApiError("resend_too_soon", f"Wait {_wait(wait)} seconds before asking for another code.", 429, retry_after=_wait(wait))
    if per_dest.filter(created_at__gte=now - timedelta(hours=1)).count() >= s.LOGIN_CODE_MAX_PER_HOUR:
        raise ApiError("rate_limited", "Too many codes requested for this number. Try again in an hour.", 429, retry_after=3600)
    if per_dest.filter(created_at__gte=now - timedelta(days=1)).count() >= s.LOGIN_CODE_MAX_PER_DAY:
        raise ApiError("rate_limited", "Too many codes requested today. Try again tomorrow.", 429, retry_after=86400)
    if ip and LoginCode.objects.filter(ip=ip, created_at__gte=now - timedelta(hours=1)).count() >= s.LOGIN_CODE_MAX_PER_IP_HOUR:
        raise ApiError("rate_limited", "Too many codes requested from this network. Try again later.", 429, retry_after=900)
    if channel == LoginCode.Channel.SMS:
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        if LoginCode.objects.filter(channel=LoginCode.Channel.SMS, created_at__gte=today).count() >= s.SMS_DAILY_CAP:
            security.record(SecurityEvent.Kind.SMS_CAP_REACHED, request, cap=s.SMS_DAILY_CAP)
            raise ApiError("sms_unavailable", "We can't send SMS codes right now. Use your email instead.", 503)

    code = f"{secrets.randbelow(10**6):06d}"
    with transaction.atomic():
        per_dest.filter(purpose=purpose, used_at__isnull=True, expires_at__gt=now).update(expires_at=now)
        lc = LoginCode.objects.create(
            channel=channel, purpose=purpose, destination=destination, user=user, ip=ip,
            code_hash=_hash(purpose, destination, code), expires_at=now + timedelta(minutes=s.LOGIN_CODE_TTL_MINUTES),
        )
    try:
        delivery.send_code(channel, destination, code, purpose)
    except ApiError:
        LoginCode.objects.filter(pk=lc.pk).update(expires_at=now)  # an unsent code must not count as live
        raise
    security.record(SecurityEvent.Kind.CODE_SENT, request, user=user, destination=destination, channel=channel, purpose=purpose)
    return lc


def check(*, destination, purpose, code, request, user=None):
    """Consumes the live code if `code` matches. Raises ApiError otherwise. Safe under concurrent requests."""
    if _failed_recently(destination) >= settings.LOGIN_LOCK_AFTER_FAILS:
        raise _locked_error()
    error = None
    with transaction.atomic():
        lc = (
            LoginCode.objects.select_for_update()
            .filter(destination=destination, purpose=purpose, used_at__isnull=True, expires_at__gt=timezone.now())
            .first()
        )
        if lc is None or lc.attempts >= settings.LOGIN_CODE_MAX_ATTEMPTS or (user is not None and lc.user_id != user.pk):
            error = ApiError("invalid_code", "That code is wrong or has expired. Ask for a new one.")
        elif not hmac.compare_digest(lc.code_hash, _hash(purpose, destination, code)):
            lc.attempts += 1
            lc.save(update_fields=["attempts"])
            left = settings.LOGIN_CODE_MAX_ATTEMPTS - lc.attempts
            error = ApiError("invalid_code", f"That code isn't right. {left} {'try' if left == 1 else 'tries'} left." if left else "That code isn't right. Ask for a new one.", extra={"attemptsLeft": left})
        else:
            lc.used_at = timezone.now()
            lc.save(update_fields=["used_at"])
    if error is None:
        return lc
    if error.get_codes() == "invalid_code" and getattr(error, "extra", {}).get("attemptsLeft") is not None:
        security.record(SecurityEvent.Kind.CODE_FAILED, request, user=user, destination=destination, purpose=purpose)
        if _failed_recently(destination) >= settings.LOGIN_LOCK_AFTER_FAILS:
            security.record(SecurityEvent.Kind.LOCKED, request, user=user, destination=destination)
    raise error
