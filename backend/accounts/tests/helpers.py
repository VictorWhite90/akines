from datetime import date
from unittest import mock

from django.conf import settings
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User

PHONE = "0803 123 4567"
E164 = "+2348031234567"
CODE = "123456"


def adult_dob():
    return date(date.today().year - 25, 1, 15).isoformat()


class AuthTestCase(TestCase):
    """Every test gets a fresh client, a clear rate-limit cache and a predictable code (123456)."""

    def setUp(self):
        cache.clear()
        self.c = APIClient()
        patcher = mock.patch("accounts.codes.secrets.randbelow", return_value=int(CODE))
        patcher.start()
        self.addCleanup(patcher.stop)
        # Test SMS outbox, like django.core.mail.outbox: texts are captured, never sent.
        self.sms = []
        self.sms_patch = mock.patch("accounts.delivery.send_sms", side_effect=lambda to, msg: self.sms.append((to, msg)))
        self.sms_patch.start()
        self.addCleanup(mock.patch.stopall)

    def post(self, url, data=None, client=None, **extra):
        return (client or self.c).post(f"/api/v1/{url}", data or {}, format="json", **extra)

    def start(self, **kw):
        return self.post("auth/start/", kw or {"phone": PHONE})

    def verify(self, code=CODE, **kw):
        return self.post("auth/verify/", {**(kw or {"phone": PHONE}), "code": code})

    def signup(self, phone=PHONE, handle="amara", name="Amara Okafor", **extra):
        self.start(phone=phone)
        token = self.verify(phone=phone).data["signupToken"]
        body = {"signupToken": token, "name": name, "handle": handle, "dateOfBirth": adult_dob(), "acceptTerms": True, "termsVersion": settings.TERMS_VERSION, **extra}
        return self.post("auth/complete-signup/", body)

    def age_codes(self, minutes=2):
        from datetime import timedelta

        from django.utils import timezone

        from accounts.models import LoginCode
        LoginCode.objects.update(created_at=timezone.now() - timedelta(minutes=minutes))

    def user(self):
        return User.objects.get(phone=E164)
