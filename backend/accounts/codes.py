"""One-time sign-in codes: normalising phones and emails, issuing, checking and sending."""
import hashlib
import hmac
import json
import logging
import re
import secrets
import urllib.request
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import LoginCode

log = logging.getLogger(__name__)

CODE_TTL = timedelta(minutes=10)
RESEND_AFTER = timedelta(seconds=60)
MAX_PER_HOUR = 5
MAX_ATTEMPTS = 5


class CodeError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


def normalise_phone(raw):
    """Nigerian numbers in any common form (0803…, 234803…, +234 803…) become +234803…"""
    digits = re.sub(r"\D", "", raw or "")
    if raw and raw.strip().startswith("+") and not digits.startswith("234"):
        if 8 <= len(digits) <= 15:
            return "+" + digits
        return None
    if digits.startswith("234"):
        digits = digits[3:]
    elif digits.startswith("0"):
        digits = digits[1:]
    return "+234" + digits if len(digits) == 10 and digits[0] in "789" else None


def normalise_email(raw):
    email = (raw or "").strip().lower()
    return email if re.fullmatch(r"[^@\s]+@[^@\s]+\.[a-z]{2,}", email) else None


def _hash(destination, code):
    return hmac.new(settings.SECRET_KEY.encode(), f"{destination}:{code}".encode(), hashlib.sha256).hexdigest()


def issue(channel, destination):
    now = timezone.now()
    recent = LoginCode.objects.filter(destination=destination, created_at__gte=now - timedelta(hours=1))
    if recent.count() >= MAX_PER_HOUR:
        raise CodeError("Too many codes requested. Try again in an hour.", 429)
    last = recent.first()
    if last and now - last.created_at < RESEND_AFTER:
        wait = int((RESEND_AFTER - (now - last.created_at)).total_seconds()) + 1
        raise CodeError(f"Please wait {wait} seconds before asking for another code.", 429)
    code = f"{secrets.randbelow(10**6):06d}"
    LoginCode.objects.create(channel=channel, destination=destination, code_hash=_hash(destination, code), expires_at=now + CODE_TTL)
    deliver(channel, destination, code)
    return code


def check(destination, code):
    """True once, for the latest unexpired code. Each wrong guess counts against it."""
    lc = LoginCode.objects.filter(destination=destination, used_at__isnull=True, expires_at__gt=timezone.now()).first()
    if not lc or lc.attempts >= MAX_ATTEMPTS:
        raise CodeError("That code has expired. Ask for a new one.")
    if not hmac.compare_digest(lc.code_hash, _hash(destination, (code or "").strip())):
        lc.attempts += 1
        lc.save(update_fields=["attempts"])
        left = MAX_ATTEMPTS - lc.attempts
        raise CodeError(f"That code isn't right. {left} {'try' if left == 1 else 'tries'} left." if left else "Too many wrong tries. Ask for a new code.")
    lc.used_at = timezone.now()
    lc.save(update_fields=["used_at"])
    return True


def deliver(channel, destination, code):
    message = f"Your Akines code is {code}. It expires in 10 minutes. Don't share it with anyone."
    if channel == LoginCode.Channel.EMAIL:
        send_mail("Your Akines sign-in code", message, settings.DEFAULT_FROM_EMAIL, [destination])
        return
    if not settings.TERMII_API_KEY:
        # No SMS provider yet (local development): show the code in the server terminal.
        log.warning("SMS code for %s: %s", destination, code)
        print(f"\n[akines] SMS code for {destination}: {code}\n", flush=True)
        return
    body = json.dumps({"api_key": settings.TERMII_API_KEY, "to": destination.lstrip("+"), "from": settings.TERMII_SENDER_ID, "sms": message, "type": "plain", "channel": settings.TERMII_CHANNEL}).encode()
    req = urllib.request.Request(f"{settings.TERMII_BASE_URL.rstrip('/')}/api/sms/send", data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            r.read()
    except Exception:
        log.exception("Termii send failed for %s", destination)
        raise CodeError("We couldn't send the SMS just now. Try again, or use your email.", 502)
