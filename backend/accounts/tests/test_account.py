from datetime import timedelta
from unittest import mock

from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import SecurityEvent, User, UserSession
from communities.models import CommunityCircle, Membership

from .helpers import CODE, E164, PHONE, AuthTestCase


class Profile(AuthTestCase):
    def setUp(self):
        super().setUp()
        self.signup()

    def test_update_profile(self):
        r = self.c.patch("/api/v1/account/me/", {"name": "Amara O.", "city": "  Abuja ", "role": "Teacher", "handle": "amara_o"}, format="json")
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual((r.data["name"], r.data["city"], r.data["handle"]), ("Amara O.", "Abuja", "amara_o"))
        self.assertTrue(SecurityEvent.objects.filter(kind="profile_changed").exists())

    def test_phone_and_email_not_editable_directly(self):
        r = self.c.patch("/api/v1/account/me/", {"phone": "+2348000000000", "email": "x@y.com"}, format="json")
        self.assertEqual((r.data["phone"], r.data["email"]), (E164, ""))

    def test_profile_validation(self):
        r = self.c.patch("/api/v1/account/me/", {"avatarUrl": "http://insecure.example/a.png", "name": "1234"}, format="json")
        self.assertEqual(set(r.data["fields"]), {"avatarUrl", "name"})

    def test_signed_out(self):
        r = APIClient().get("/api/v1/account/me/").data
        self.assertEqual((r["code"], r["detail"]), ("not_authenticated", "Please sign in to continue."))


class Devices(AuthTestCase):
    def setUp(self):
        super().setUp()
        self.signup()
        self.phone2 = APIClient(HTTP_USER_AGENT="Mozilla/5.0 (Linux; Android 14) Chrome/129.0 Mobile")
        self.age_codes()
        self.post("auth/start/", {"phone": PHONE}, client=self.phone2)
        self.post("auth/verify/", {"phone": PHONE, "code": CODE}, client=self.phone2)

    def test_list_devices(self):
        data = self.c.get("/api/v1/account/sessions/").data
        self.assertEqual(len(data), 2)
        self.assertEqual(sum(d["current"] for d in data), 1)
        self.assertIn("Chrome on Android", [d["device"] for d in data])

    def test_end_one_device(self):
        other = next(d for d in self.c.get("/api/v1/account/sessions/").data if not d["current"])
        self.assertEqual(self.c.delete(f"/api/v1/account/sessions/{other['id']}/").status_code, 204)
        self.assertEqual(self.phone2.get("/api/v1/account/me/").status_code, 403, "that phone is signed out")
        self.assertEqual(self.c.get("/api/v1/account/me/").status_code, 200, "this one isn't")

    def test_cannot_end_someone_elses_session(self):
        other = UserSession.objects.exclude(session_key=self.c.session.session_key).first()
        self.signup(phone="0803 999 0000", handle="tunde")  # self.c is now Tunde
        self.assertEqual(self.c.delete(f"/api/v1/account/sessions/{other.pk}/").status_code, 404)

    def test_end_all_others(self):
        self.assertEqual(self.c.delete("/api/v1/account/sessions/").data["ended"], 1)
        self.assertEqual(self.phone2.get("/api/v1/account/me/").status_code, 403)
        self.assertEqual(self.c.get("/api/v1/account/me/").status_code, 200)

    def test_admin_suspend_signs_out_everywhere(self):
        from accounts import security
        user = self.user()
        user.is_active = False
        user.save()
        security.end_sessions(user)
        self.assertEqual(self.c.get("/api/v1/account/me/").status_code, 403)
        self.assertEqual(self.phone2.get("/api/v1/account/me/").status_code, 403)


class ChangeContact(AuthTestCase):
    def setUp(self):
        super().setUp()
        self.signup()

    def test_add_email(self):
        r = self.post("account/contact/start/", {"email": "amara@example.com"})
        self.assertEqual(r.status_code, 202)
        r = self.post("account/contact/verify/", {"email": "amara@example.com", "code": CODE})
        self.assertEqual((r.data["email"], r.data["emailVerified"]), ("amara@example.com", True))
        self.assertTrue(SecurityEvent.objects.filter(kind="contact_changed").exists())

    def test_change_phone(self):
        self.post("account/contact/start/", {"phone": "0805 111 2222"})
        r = self.post("account/contact/verify/", {"phone": "0805 111 2222", "code": CODE})
        self.assertEqual(r.data["phone"], "+2348051112222")
        self.post("auth/sign-out/")
        self.age_codes()
        self.start(phone="0805 111 2222")
        self.assertEqual(self.verify(phone="0805 111 2222").data["status"], "signed_in")

    def test_needs_recent_sign_in(self):
        s = self.c.session
        s["auth_at"] = int((timezone.now() - timedelta(hours=1)).timestamp())
        s.save()
        r = self.post("account/contact/start/", {"email": "amara@example.com"})
        self.assertEqual((r.status_code, r.data["code"]), (401, "reauth_required"))

    def test_cannot_take_another_accounts_number(self):
        other = APIClient()
        self.signup(phone="0805 111 2222", handle="tunde")
        r = self.post("account/contact/start/", {"phone": PHONE})  # self.c is Tunde now
        self.assertEqual((r.status_code, r.data["code"]), (409, "contact_in_use"))
        del other

    def test_code_bound_to_the_requesting_account(self):
        self.post("account/contact/start/", {"email": "amara@example.com"})
        intruder = APIClient()
        self.signup(phone="0805 111 2222", handle="tunde")
        r = self.post("account/contact/verify/", {"email": "amara@example.com", "code": CODE})
        self.assertEqual(r.data["code"], "invalid_code")
        del intruder

    def test_sign_in_code_cannot_be_used_to_change_contact(self):
        self.age_codes()
        self.start(email="amara@example.com")
        r = self.post("account/contact/verify/", {"email": "amara@example.com", "code": CODE})
        self.assertEqual(r.data["code"], "invalid_code")


class DeleteAccount(AuthTestCase):
    def setUp(self):
        super().setUp()
        self.signup()

    def test_delete(self):
        user = self.user()
        self.assertEqual(self.post("account/delete/start/").data["code"], "resend_too_soon", "same 60s gap as any code")
        self.age_codes()
        self.assertEqual(self.post("account/delete/start/").status_code, 202)
        self.assertEqual(self.post("account/delete/confirm/", {"code": "000000"}).data["code"], "invalid_code")
        self.assertEqual(self.post("account/delete/confirm/", {"code": CODE}).status_code, 204)
        user.refresh_from_db()
        self.assertEqual((user.phone, user.handle, user.display_name, user.is_active, user.date_of_birth), (None, None, "", False, None))
        self.assertIsNotNone(user.deleted_at)
        self.assertFalse(UserSession.objects.filter(user=user).exists())
        self.assertEqual(self.c.get("/api/v1/account/me/").status_code, 403)
        # the number and username are free again
        self.age_codes()
        self.assertEqual(self.signup().status_code, 201)

    def test_sole_leader_must_hand_over_first(self):
        user = self.user()
        c = CommunityCircle.objects.create(name="Chillers Club", category="Social hangouts", area="Jabi")
        Membership.objects.create(community=c, user=user, role="leader")
        Membership.objects.create(community=c, user=User.objects.create_user("someone"), role="member")
        self.age_codes()
        self.post("account/delete/start/")
        r = self.post("account/delete/confirm/", {"code": CODE})
        self.assertEqual((r.status_code, r.data["code"], r.data["communities"][0]["name"]), (409, "sole_leader", "Chillers Club"))
        user.refresh_from_db()
        self.assertTrue(user.is_active)


class ErrorShape(AuthTestCase):
    def test_throttled_shape(self):
        from django.test import override_settings
        from rest_framework.settings import api_settings
        rates = {**api_settings.DEFAULT_THROTTLE_RATES, "auth_handle": "2/hour"}
        with mock.patch("rest_framework.throttling.SimpleRateThrottle.THROTTLE_RATES", rates):
            for _ in range(2):
                self.c.get("/api/v1/auth/handle-available/?handle=amara")
            r = self.c.get("/api/v1/auth/handle-available/?handle=amara")
        self.assertEqual((r.status_code, r.data["code"]), (429, "rate_limited"))
        self.assertIn("retryAfter", r.data)
        del override_settings
