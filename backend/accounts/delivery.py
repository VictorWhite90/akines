"""Sending codes and notices (Termii SMS, SMTP email) and checking the bot challenge (Cloudflare Turnstile)."""
import json
import logging
import urllib.parse
import urllib.request

from django.conf import settings
from django.core.mail import send_mail

from akines_api.exceptions import ApiError

log = logging.getLogger("akines.delivery")


def _post_json(url, payload, timeout=10):
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read() or b"{}")


def send_sms(to, message):
    if not settings.TERMII_API_KEY:
        if settings.DEBUG:
            # Local development only: show the message in the server terminal.
            print(f"\n[akines] SMS to {to}: {message}\n", flush=True)
            return
        log.error("SMS requested but TERMII_API_KEY is not configured")
        raise ApiError("sms_unavailable", "We can't send SMS right now. Use your email instead.", 503)
    try:
        resp = _post_json(f"{settings.TERMII_BASE_URL.rstrip('/')}/api/sms/send", {
            "api_key": settings.TERMII_API_KEY, "to": to.lstrip("+"), "from": settings.TERMII_SENDER_ID,
            "sms": message, "type": "plain", "channel": settings.TERMII_CHANNEL,
        })
        log.info("termii_sent message_id=%s", resp.get("message_id"))
    except Exception:
        log.exception("termii_send_failed")
        raise ApiError("sms_failed", "We couldn't send the SMS just now. Try again in a minute, or use your email.", 502)


def send_email(to, subject, message):
    if settings.EMAIL_BACKEND.endswith("console.EmailBackend") and not settings.DEBUG:
        log.error("Email requested but EMAIL_HOST is not configured")
        raise ApiError("email_unavailable", "We can't send email right now. Try again later.", 503)
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [to], fail_silently=False)
    except Exception:
        log.exception("email_send_failed")
        raise ApiError("email_failed", "We couldn't send the email just now. Try again in a minute.", 502)


def send_code(channel, destination, code, purpose):
    what = {"sign_in": "sign-in", "change_contact": "confirmation", "delete_account": "account deletion"}[purpose]
    text = f"Your Akines {what} code is {code}. It expires in {settings.LOGIN_CODE_TTL_MINUTES} minutes. Never share it, not even with Akines staff."
    if channel == "sms":
        send_sms(destination, text)
    else:
        send_email(destination, f"{code} is your Akines {what} code", text + "\n\nIf you didn't ask for this, you can ignore this email.")


def notify(user, subject, message):
    """Best-effort security notice to the member's email. Never blocks the action it reports."""
    if not user.email:
        return
    try:
        send_email(user.email, subject, message + "\n\nIf this wasn't you, sign in and end that session under Settings → Devices, then contact support.")
    except ApiError:
        log.warning("security_notice_not_sent user=%s", user.pk)


def verify_captcha(token, ip):
    """True when Turnstile isn't configured (local dev) or the token is valid."""
    if not settings.TURNSTILE_SECRET_KEY:
        return True
    if not token:
        return False
    try:
        data = urllib.parse.urlencode({"secret": settings.TURNSTILE_SECRET_KEY, "response": token, "remoteip": ip or ""}).encode()
        with urllib.request.urlopen("https://challenges.cloudflare.com/turnstile/v0/siteverify", data=data, timeout=8) as r:
            return bool(json.loads(r.read()).get("success"))
    except Exception:
        log.exception("turnstile_verify_failed")
        return False
