from datetime import timedelta
from unittest import mock

from django.conf import settings
from django.core import mail
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import LoginCode, SecurityEvent, User, UserSession

from .helpers import CODE, E164, PHONE, AuthTestCase, adult_dob


class SignUpFlow(AuthTestCase):
    def test_full_sign_up(self):
        r = self.start()
        self.assertEqual(r.status_code, 202)
        self.assertEqual(self.sms[0][0], E164)
        self.assertIn(CODE, self.sms[0][1])
        self.assertEqual(r.data, {"sentTo": "+234 803 *** 4567", "channel": "sms", "expiresIn": 600, "resendIn": 60})
        r = self.verify(phone="+234 803 123 4567")
        self.assertEqual(r.data["status"], "needs_profile")
        self.assertFalse(User.objects.exists(), "no account until the profile is complete")
        self.age_codes()
        r = self.signup(marketingOptIn=True, city="Abuja")
        self.assertEqual(r.status_code, 201, r.data)
        u = r.data["user"]
        self.assertEqual((u["handle"], u["name"], u["phone"], u["phoneVerified"], u["city"]), ("amara", "Amara Okafor", E164, True, "Abuja"))
        self.assertNotIn("dateOfBirth", u)
        user = self.user()
        self.assertFalse(user.has_usable_password())
        self.assertEqual(user.terms_version, settings.TERMS_VERSION)
        self.assertIsNotNone(user.terms_accepted_at)
        self.assertTrue(user.marketing_opt_in)
        self.assertEqual(self.c.get("/api/v1/account/me/").data["handle"], "amara")
        self.assertEqual(UserSession.objects.filter(user=user).count(), 1)
        self.assertTrue(SecurityEvent.objects.filter(user=user, kind="signed_up").exists())

    def test_start_does_not_reveal_if_account_exists(self):
        new = self.start(phone="0803 999 0000").data
        self.signup()
        self.age_codes()
        existing = self.start().data
        self.assertEqual(set(new), set(existing))
        self.assertNotIn("isNew", existing)

    def test_signup_validation(self):
        self.start()
        token = self.verify().data["signupToken"]
        base = {"signupToken": token, "name": "Amara", "handle": "amara", "dateOfBirth": adult_dob(), "acceptTerms": True, "termsVersion": settings.TERMS_VERSION}
        cases = [
            ({"acceptTerms": False}, "acceptTerms"),
            ({"name": "A1"}, "name"),
            ({"handle": "admin"}, "handle"),
            ({"dateOfBirth": f"{timezone.now().year - 15}-01-01"}, "dateOfBirth"),
            ({"dateOfBirth": "not-a-date"}, "dateOfBirth"),
        ]
        for patch, field in cases:
            r = self.post("auth/complete-signup/", {**base, **patch})
            self.assertEqual(r.status_code, 400, patch)
            self.assertEqual(r.data["code"], "invalid")
            self.assertIn(field, r.data["fields"], patch)
        r = self.post("auth/complete-signup/", {**base, "termsVersion": "2020-01-01"})
        self.assertEqual(r.data["code"], "terms_outdated")
        self.assertFalse(User.objects.exists())

    def test_signup_token_is_tamper_proof_and_expires(self):
        self.start()
        token = self.verify().data["signupToken"]
        base = {"name": "Amara", "handle": "amara", "dateOfBirth": adult_dob(), "acceptTerms": True, "termsVersion": settings.TERMS_VERSION}
        self.assertIn("signupToken", self.post("auth/complete-signup/", {**base, "signupToken": token[:-2] + "xx"}).data["fields"])
        with mock.patch("django.core.signing.time.time", return_value=timezone.now().timestamp() + 31 * 60):
            self.assertIn("signupToken", self.post("auth/complete-signup/", {**base, "signupToken": token}).data["fields"])

    def test_signup_token_single_use(self):
        self.start()
        token = self.verify().data["signupToken"]
        body = {"signupToken": token, "name": "Amara", "handle": "amara", "dateOfBirth": adult_dob(), "acceptTerms": True, "termsVersion": settings.TERMS_VERSION}
        self.assertEqual(self.post("auth/complete-signup/", body).status_code, 201)
        r = self.post("auth/complete-signup/", {**body, "handle": "amara2"}, client=APIClient())
        self.assertEqual((r.status_code, r.data["code"]), (409, "already_registered"))
        self.assertEqual(User.objects.count(), 1)

    def test_handle_taken_and_case_insensitive(self):
        self.signup()
        r = self.signup(phone="0803 999 0000", handle="AMARA")
        self.assertEqual(r.status_code, 400)
        self.assertEqual(r.data["fields"]["handle"], ["That username is taken."])

    def test_handle_available(self):
        self.signup()
        c = APIClient()
        self.assertFalse(c.get("/api/v1/auth/handle-available/?handle=Amara").data["available"])
        self.assertTrue(c.get("/api/v1/auth/handle-available/?handle=amara_o").data["available"])
        self.assertIsNotNone(c.get("/api/v1/auth/handle-available/?handle=ab").data["reason"])

    def test_email_fallback(self):
        self.start(email="Amara@Example.com")
        self.assertIn(CODE, mail.outbox[0].body)
        self.assertIn(CODE, mail.outbox[0].subject)
        token = self.verify(email="amara@example.com").data["signupToken"]
        r = self.post("auth/complete-signup/", {"signupToken": token, "name": "Amara", "handle": "amara", "dateOfBirth": adult_dob(), "acceptTerms": True, "termsVersion": settings.TERMS_VERSION})
        self.assertEqual((r.data["user"]["email"], r.data["user"]["emailVerified"], r.data["user"]["phone"]), ("amara@example.com", True, None))


class SignInFlow(AuthTestCase):
    def setUp(self):
        super().setUp()
        self.signup()
        self.post("auth/sign-out/")
        self.age_codes()

    def test_sign_in_existing(self):
        self.start()
        r = self.verify()
        self.assertEqual((r.status_code, r.data["status"], r.data["user"]["handle"]), (200, "signed_in", "amara"))
        self.assertEqual(User.objects.count(), 1)

    def test_session_id_rotates_on_sign_in(self):
        self.c.get("/api/v1/auth/csrf/")
        self.c.session.save()
        before = self.c.cookies.get("sessionid")
        self.start()
        self.verify()
        self.assertNotEqual(before and before.value, self.c.cookies["sessionid"].value)

    def test_suspended_account(self):
        User.objects.update(is_active=False)
        self.start()
        r = self.verify()
        self.assertEqual((r.status_code, r.data["code"]), (403, "account_unavailable"))

    def test_sign_out(self):
        self.start()
        self.verify()
        self.assertEqual(self.post("auth/sign-out/").status_code, 204)
        self.assertEqual(self.c.get("/api/v1/account/me/").status_code, 403)
        self.assertFalse(UserSession.objects.exists())


class Codes(AuthTestCase):
    def test_code_works_once(self):
        self.start()
        self.assertEqual(self.verify().status_code, 200)
        self.assertEqual(self.verify().data["code"], "invalid_code")

    def test_wrong_code_counts_down(self):
        self.start()
        lefts = [self.verify(code="000000").data.get("attemptsLeft") for _ in range(5)]
        self.assertEqual(lefts, [4, 3, 2, 1, 0])
        self.assertEqual(self.verify().data["code"], "invalid_code", "the right code no longer works")

    def test_malformed_code_is_validation_not_a_guess(self):
        self.start()
        r = self.verify(code="12ab")
        self.assertEqual(r.status_code, 400)
        self.assertIn("code", r.data["fields"])
        self.assertEqual(LoginCode.objects.get().attempts, 0)

    def test_expired(self):
        self.start()
        LoginCode.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
        self.assertEqual(self.verify().data["code"], "invalid_code")

    def test_new_code_cancels_old(self):
        self.start()
        self.age_codes()
        with mock.patch("accounts.codes.secrets.randbelow", return_value=654321):
            self.start()
        self.assertEqual(self.verify(code=CODE).data["code"], "invalid_code")
        self.assertEqual(self.verify(code="654321").status_code, 200)

    def test_not_stored_in_plain_text(self):
        self.start()
        self.assertNotIn(CODE, LoginCode.objects.get().code_hash)
        self.assertFalse(SecurityEvent.objects.filter(meta__icontains=CODE).exists())

    def test_resend_wait(self):
        self.start()
        r = self.start()
        self.assertEqual((r.status_code, r.data["code"]), (429, "resend_too_soon"))
        self.assertTrue(1 <= r.data["retryAfter"] <= 60)
        self.assertEqual(r["Retry-After"], str(r.data["retryAfter"]))

    def test_hourly_and_daily_limits(self):
        for _ in range(settings.LOGIN_CODE_MAX_PER_HOUR):
            self.assertEqual(self.start().status_code, 202)
            self.age_codes()
        self.assertEqual(self.start().data["code"], "rate_limited")
        self.age_codes(minutes=61)
        for _ in range(settings.LOGIN_CODE_MAX_PER_DAY - settings.LOGIN_CODE_MAX_PER_HOUR):
            self.assertEqual(self.start().status_code, 202)
            self.age_codes(minutes=61)
        self.assertIn("tomorrow", self.start().data["detail"])

    def test_lockout_after_many_wrong_codes(self):
        for _ in range(2):
            self.start()
            for _ in range(5):
                self.verify(code="000000")
            self.age_codes()
        r = self.start()
        self.assertEqual((r.status_code, r.data["code"]), (429, "locked"))
        self.assertTrue(SecurityEvent.objects.filter(kind="locked").exists())

    @override_settings(LOGIN_CODE_MAX_PER_IP_HOUR=3)
    def test_per_ip_limit(self):
        for i in range(3):
            self.assertEqual(self.start(phone=f"0803 123 456{i}").status_code, 202)
        self.assertEqual(self.start(phone="0803 123 4569").data["code"], "rate_limited")

    @override_settings(SMS_DAILY_CAP=2)
    def test_platform_sms_cap(self):
        self.start(phone="0803 123 4561")
        self.start(phone="0803 123 4562")
        r = self.start(phone="0803 123 4563")
        self.assertEqual((r.status_code, r.data["code"]), (503, "sms_unavailable"))
        self.assertEqual(self.start(email="amara@example.com").status_code, 202, "email still works")

    def test_failed_delivery_does_not_leave_live_code(self):
        from akines_api.exceptions import ApiError
        self.sms_patch.stop()
        with mock.patch("accounts.delivery.send_sms", side_effect=ApiError("sms_failed", "x", 502)):
            self.assertEqual(self.start().status_code, 502)
        self.assertEqual(self.verify().data["code"], "invalid_code")

    def test_bad_contact_input(self):
        self.assertEqual(self.start(phone="123").data["fields"]["phone"][0], "That phone number isn't valid. Check the digits.")
        self.assertEqual(self.post("auth/start/", {}).data["code"], "contact_required")
        self.assertEqual(self.post("auth/start/", {"phone": PHONE, "email": "a@b.com"}).data["code"], "contact_required")


class Captcha(AuthTestCase):
    @override_settings(TURNSTILE_SECRET_KEY="secret")
    def test_required_when_configured(self):
        self.assertEqual(self.start().data["code"], "captcha_failed")
        with mock.patch("accounts.delivery.verify_captcha", return_value=True):
            self.assertEqual(self.post("auth/start/", {"phone": PHONE, "captchaToken": "ok"}).status_code, 202)


class Csrf(AuthTestCase):
    def test_unsafe_requests_need_csrf_even_signed_out(self):
        c = APIClient(enforce_csrf_checks=True)
        r = c.post("/api/v1/auth/start/", {"phone": PHONE}, format="json")
        self.assertEqual((r.status_code, r.data["code"]), (403, "csrf_failed"))
        token = c.get("/api/v1/auth/csrf/").data["csrfToken"]
        r = c.post("/api/v1/auth/start/", {"phone": PHONE}, format="json", HTTP_X_CSRFTOKEN=token)
        self.assertEqual(r.status_code, 202)


@override_settings(DEBUG=False, TERMII_API_KEY="")
class ProductionSafety(AuthTestCase):
    def setUp(self):
        super().setUp()
        self.sms_patch.stop()  # exercise the real sender
    def test_never_prints_codes_without_sms_provider(self):
        with mock.patch("builtins.print") as p:
            r = self.start()
        self.assertEqual((r.status_code, r.data["code"]), (503, "sms_unavailable"))
        p.assert_not_called()

    @override_settings(TERMII_API_KEY="k", TERMII_BASE_URL="https://termii.test")
    def test_termii_payload(self):
        with mock.patch("accounts.delivery._post_json", return_value={"message_id": "1"}) as post:
            self.assertEqual(self.start().status_code, 202)
        url, body = post.call_args.args
        self.assertEqual(url, "https://termii.test/api/sms/send")
        self.assertEqual((body["to"], body["from"], body["api_key"]), ("2348031234567", "Akines", "k"))
        self.assertIn(CODE, body["sms"])
