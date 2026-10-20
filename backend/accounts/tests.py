from datetime import timedelta
from unittest import mock

from django.core import mail
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from . import codes
from .models import LoginCode, User


class PhoneNumbers(TestCase):
    def test_nigerian_forms(self):
        for raw in ["08031234567", "0803 123 4567", "2348031234567", "+234 803 123 4567", "8031234567"]:
            self.assertEqual(codes.normalise_phone(raw), "+2348031234567", raw)

    def test_rejects_bad(self):
        for raw in ["", "12345", "0603123456", "080312345678"]:
            self.assertIsNone(codes.normalise_phone(raw), raw)

    def test_other_countries_with_plus(self):
        self.assertEqual(codes.normalise_phone("+44 7700 900123"), "+447700900123")


@mock.patch("accounts.codes.secrets.randbelow", return_value=123456)
class SignIn(TestCase):
    def setUp(self):
        self.c = APIClient()

    def ask(self, **kw):
        return self.c.post("/api/auth/request-code/", kw, format="json")

    def verify(self, **kw):
        return self.c.post("/api/auth/verify-code/", kw, format="json")

    def test_phone_sign_up_then_sign_in(self, _):
        r = self.ask(phone="0803 123 4567")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data, {"sentTo": "+2348031234567", "channel": "sms", "isNew": True})
        r = self.verify(phone="08031234567", code="123456", name="Amara")
        self.assertEqual(r.status_code, 201)
        self.assertTrue(r.data["isNew"])
        self.assertEqual(r.data["user"]["name"], "Amara")
        self.assertEqual(self.c.get("/api/auth/me/").data["phone"], "+2348031234567")
        self.assertFalse(User.objects.get(phone="+2348031234567").has_usable_password())
        # same person again: no new account
        self.c.post("/api/auth/sign-out/")
        self.assertEqual(self.c.get("/api/auth/me/").status_code, 403)
        LoginCode.objects.update(created_at=timezone.now() - timedelta(minutes=2))
        self.assertFalse(self.ask(phone="+2348031234567").data["isNew"])
        r = self.verify(phone="+2348031234567", code="123456")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(User.objects.count(), 1)

    def test_code_works_once(self, _):
        self.ask(phone="08031234567")
        self.assertEqual(self.verify(phone="08031234567", code="123456").status_code, 201)
        self.assertEqual(self.verify(phone="08031234567", code="123456").status_code, 400)

    def test_wrong_code_counts_down_then_locks(self, _):
        self.ask(phone="08031234567")
        for left in [4, 3, 2, 1]:
            self.assertIn(str(left), self.verify(phone="08031234567", code="000000").data["detail"])
        self.assertIn("Too many", self.verify(phone="08031234567", code="000000").data["detail"])
        self.assertEqual(self.verify(phone="08031234567", code="123456").status_code, 400)

    def test_expired(self, _):
        self.ask(phone="08031234567")
        LoginCode.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
        self.assertIn("expired", self.verify(phone="08031234567", code="123456").data["detail"])

    def test_resend_wait_and_hourly_limit(self, _):
        self.assertEqual(self.ask(phone="08031234567").status_code, 200)
        self.assertEqual(self.ask(phone="08031234567").status_code, 429)
        for _i in range(4):
            LoginCode.objects.update(created_at=timezone.now() - timedelta(minutes=2))
            self.assertEqual(self.ask(phone="08031234567").status_code, 200)
        LoginCode.objects.update(created_at=timezone.now() - timedelta(minutes=2))
        self.assertIn("hour", self.ask(phone="08031234567").data["detail"])

    def test_code_is_not_stored_in_plain_text(self, _):
        self.ask(phone="08031234567")
        self.assertNotIn("123456", LoginCode.objects.get().code_hash)

    def test_email_fallback(self, _):
        r = self.ask(email=" Amara@Example.com ")
        self.assertEqual(r.data["sentTo"], "amara@example.com")
        self.assertIn("123456", mail.outbox[0].body)
        self.assertEqual(self.verify(email="amara@example.com", code="123456").data["user"]["email"], "amara@example.com")

    def test_bad_input(self, _):
        self.assertEqual(self.ask(phone="123").status_code, 400)
        self.assertEqual(self.ask().status_code, 400)

    def test_update_profile(self, _):
        self.ask(phone="08031234567")
        self.verify(phone="08031234567", code="123456")
        r = self.c.patch("/api/auth/me/", {"name": "Amara O.", "city": "Abuja", "phone": "+2340000000000"}, format="json")
        self.assertEqual((r.data["name"], r.data["city"], r.data["phone"]), ("Amara O.", "Abuja", "+2348031234567"))

    def test_signed_in_user_can_register_community(self, _):
        self.ask(phone="08031234567")
        self.verify(phone="08031234567", code="123456")
        r = self.c.post("/api/communities/", {"name": "Chillers Club", "category": "Social hangouts", "area": "Jabi"}, format="json")
        self.assertEqual(r.status_code, 201)
