from datetime import date

from django.test import SimpleTestCase, override_settings
from rest_framework.exceptions import ValidationError

from accounts import validators as v


def code_of(fn, *args):
    try:
        fn(*args)
    except ValidationError as e:
        return e.detail[0].code
    return None


class Phones(SimpleTestCase):
    def test_nigerian_forms_normalise(self):
        for raw in ["08031234567", "0803 123 4567", "0803-123-4567", "2348031234567", "+234 803 123 4567", "+234 (0) 803 123 4567"]:
            self.assertEqual(v.clean_phone(raw), "+2348031234567", raw)

    def test_all_networks(self):
        for raw in ["07011234567", "08051234567", "09031234567", "08121234567"]:
            self.assertTrue(v.clean_phone(raw).startswith("+234"), raw)

    def test_invalid(self):
        for raw in ["", "123", "0803123456", "080312345678", "abcdefghijk", "0" * 40]:
            self.assertEqual(code_of(v.clean_phone, raw), "invalid_phone", raw)

    def test_other_countries_blocked_by_default(self):
        self.assertEqual(code_of(v.clean_phone, "+44 7400 123456"), "unsupported_region")

    @override_settings(PHONE_ALLOWED_REGIONS=["NG", "GB"])
    def test_other_countries_when_allowed(self):
        self.assertEqual(v.clean_phone("+44 7400 123456"), "+447400123456")

    def test_landline_rejected(self):
        self.assertEqual(code_of(v.clean_phone, "+2342033123456"), "not_mobile")


class Emails(SimpleTestCase):
    def test_normalised(self):
        self.assertEqual(v.clean_email("  Amara@Example.COM "), "amara@example.com")

    def test_invalid_and_disposable(self):
        self.assertEqual(code_of(v.clean_email, "amara@"), "invalid_email")
        self.assertEqual(code_of(v.clean_email, "x@mailinator.com"), "disposable_email")


class Names(SimpleTestCase):
    def test_real_names(self):
        for name in ["Amara", "Chinedu Okafor", "Ngozi Adichie-Eze", "O'Neil", "Adébáyọ̀ Ọlá", "Ọmọ́túndé", "Jean-Luc", "Fatima Bello"]:
            self.assertEqual(v.clean_name(name), name, name)

    def test_whitespace_collapsed(self):
        self.assertEqual(v.clean_name("  Amara    Okafor "), "Amara Okafor")

    def test_rejected(self):
        for bad in ["A", "Amara123", "http://spam.com", "@amara", "👋🏾", "a" * 51]:
            self.assertIsNotNone(code_of(v.clean_name, bad), bad)

    def test_hidden_characters_stripped(self):
        self.assertEqual(v.clean_name("Amara\u200b Okafor\u0000"), "Amara Okafor")


class Handles(SimpleTestCase):
    def test_ok(self):
        self.assertEqual(v.clean_handle("@Amara.Okafor_"), "amara.okafor_")

    def test_rules(self):
        for bad in ["ab", "a" * 31, ".amara", "_amara", "amara.", "am..ara", "am ara", "amára", "1234", "admin", "akinesofficial"]:
            self.assertIsNotNone(code_of(v.clean_handle, bad), bad)


class Ages(SimpleTestCase):
    def test_age_maths(self):
        self.assertEqual(v.age_on(date(2008, 10, 26), date(2026, 10, 25)), 17)
        self.assertEqual(v.age_on(date(2008, 10, 26), date(2026, 10, 26)), 18)

    @override_settings(MIN_SIGNUP_AGE=18)
    def test_minimum_age(self):
        today = date.today()
        self.assertEqual(code_of(v.clean_date_of_birth, date(today.year - 17, 1, 1)), "too_young")
        self.assertEqual(code_of(v.clean_date_of_birth, date(today.year + 1, 1, 1)), "invalid_date")
        self.assertEqual(code_of(v.clean_date_of_birth, date(1890, 1, 1)), "invalid_date")


class Masking(SimpleTestCase):
    def test_mask(self):
        self.assertEqual(v.mask_destination("+2348031234567"), "+234 803 *** 4567")
        self.assertEqual(v.mask_destination("amara@example.com"), "a***@example.com")
