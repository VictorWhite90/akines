from django.contrib.auth import get_user_model
from django.db import connection
from django.test.utils import CaptureQueriesContext
from rest_framework.test import APITestCase

from .models import CommunityCircle, Membership

User = get_user_model()

NEW = {"name": "Come Alone Club Abuja", "tagline": "Come alone, leave with friends.", "category": "Social hangouts", "area": "Wuse 2", "instagram": "comealoneclub.abj"}


class CommunityApiTests(APITestCase):
    def setUp(self):
        self.leader = User.objects.create_user("efua", password="x")
        self.member = User.objects.create_user("tunde", password="x")

    def register(self):
        self.client.force_authenticate(self.leader)
        r = self.client.post("/api/v1/communities/", NEW, format="json")
        self.assertEqual(r.status_code, 201, r.data)
        return r.data

    def test_register_makes_creator_leader_with_invite_code(self):
        d = self.register()
        self.assertEqual(d["id"], "come-alone-club-abuja")
        self.assertEqual(d["members"], 1)
        self.assertEqual(d["myRole"], "leader")
        self.assertEqual(len(d["inviteCode"]), 6)
        self.assertFalse(d["verified"])
        self.assertEqual(d["leaders"][0]["id"], "efua")

    def test_signed_out_cannot_register(self):
        self.assertEqual(self.client.post("/api/v1/communities/", NEW, format="json").status_code, 403)

    def test_cannot_self_verify(self):
        self.client.force_authenticate(self.leader)
        d = self.client.post("/api/v1/communities/", {**NEW, "verified": True}, format="json").data
        self.assertFalse(d["verified"])

    def test_bad_category_rejected(self):
        self.client.force_authenticate(self.leader)
        r = self.client.post("/api/v1/communities/", {**NEW, "category": "Nope"}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_duplicate_names_get_unique_ids(self):
        a = self.register()
        b = self.client.post("/api/v1/communities/", NEW, format="json").data
        self.assertNotEqual(a["id"], b["id"])

    def test_join_needs_code_until_verified(self):
        d = self.register()
        self.client.force_authenticate(self.member)
        self.assertIsNone(self.client.get(f"/api/v1/communities/{d['id']}/").data["inviteCode"])
        self.assertEqual(self.client.post(f"/api/v1/communities/{d['id']}/join/").status_code, 403)
        r = self.client.post(f"/api/v1/communities/{d['id']}/join/", {"code": d["inviteCode"].lower()}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["members"], 2)
        self.assertEqual(r.data["myRole"], "member")
        # joining twice is harmless
        self.assertEqual(self.client.post(f"/api/v1/communities/{d['id']}/join/", {"code": d["inviteCode"]}, format="json").data["members"], 2)

    def test_open_join_once_verified(self):
        d = self.register()
        CommunityCircle.objects.filter(slug=d["id"]).update(verified=True)
        self.client.force_authenticate(self.member)
        self.assertEqual(self.client.post(f"/api/v1/communities/{d['id']}/join/").status_code, 200)

    def test_invite_link_lookup(self):
        d = self.register()
        self.client.force_authenticate(None)
        r = self.client.get(f"/api/v1/communities/by-code/{d['inviteCode']}/")
        self.assertEqual(r.data["id"], d["id"])
        self.assertEqual(self.client.get("/api/v1/communities/by-code/ZZZZZZ/").status_code, 404)

    def test_only_leaders_edit(self):
        d = self.register()
        self.client.force_authenticate(self.member)
        self.assertEqual(self.client.patch(f"/api/v1/communities/{d['id']}/", {"tagline": "hacked"}, format="json").status_code, 403)
        self.client.force_authenticate(self.leader)
        self.assertEqual(self.client.patch(f"/api/v1/communities/{d['id']}/", {"tagline": "New"}, format="json").data["tagline"], "New")

    def test_last_leader_cannot_leave(self):
        d = self.register()
        self.assertEqual(self.client.post(f"/api/v1/communities/{d['id']}/leave/").status_code, 400)

    def test_mine_and_filters(self):
        self.register()
        self.client.post("/api/v1/communities/", {**NEW, "name": "Sunday Table", "category": "Food & conversation", "area": "Maitama"}, format="json")
        self.assertEqual(len(self.client.get("/api/v1/communities/mine/").data), 2)
        self.assertEqual(self.client.get("/api/v1/communities/?area=Maitama").data["count"], 1)
        self.assertEqual(self.client.get("/api/v1/communities/?q=sunday").data["count"], 1)

    def test_list_query_count_does_not_grow(self):
        self.register()
        for i in range(10):
            c = CommunityCircle.objects.create(name=f"C{i}", category="Games", area="Jabi")
            Membership.objects.create(community=c, user=self.leader, role="leader")
        with CaptureQueriesContext(connection) as q:
            self.client.get("/api/v1/communities/")
        self.assertLessEqual(len(q), 5)
