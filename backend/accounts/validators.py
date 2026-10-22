"""Input rules for everything a person types during sign-up and on their profile."""
import re
import unicodedata
from datetime import date

import phonenumbers
from django.conf import settings
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError

# A letter, optionally followed by combining marks (Yoruba and Igbo tone marks: Adébáyọ̀, Ọmọ́túndé).
_LETTER = "(?:[^\\W\\d_][\u0300-\u036f\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]*)"
NAME_RE = re.compile(rf"^{_LETTER}+(?:[ '’\-.]{{1,2}}{_LETTER}+)*\.?$")
HANDLE_RE = re.compile(r"^(?!.*\.\.)(?![._])[a-z0-9._]{3,30}(?<!\.)$")
RESERVED_HANDLES = {
    "about", "account", "accounts", "admin", "administrator", "akines", "akinesteam", "api", "app", "auth", "banter",
    "billing", "circle", "circles", "community", "communities", "contact", "events", "explore", "help", "home",
    "kincircle", "legal", "login", "logout", "me", "messages", "moderator", "mod", "news", "null", "official",
    "privacy", "profile", "root", "security", "settings", "signin", "signout", "signup", "staff", "static",
    "support", "system", "team", "terms", "undefined", "verify", "verified", "welcome", "www",
}
_email = EmailValidator()


def _strip_controls(value, keep_newlines=False):
    allowed = {"\n"} if keep_newlines else set()
    return "".join(ch for ch in value if ch in allowed or unicodedata.category(ch)[0] != "C")


def clean_text(value, max_length, keep_newlines=False):
    value = unicodedata.normalize("NFKC", str(value or ""))
    value = _strip_controls(value, keep_newlines)
    if keep_newlines:
        value = re.sub(r"[ \t]+", " ", value)
        value = re.sub(r"\n{3,}", "\n\n", value).strip()
    else:
        value = re.sub(r"\s+", " ", value).strip()
    if len(value) > max_length:
        raise ValidationError(f"Keep this under {max_length} characters.", code="too_long")
    return value


def clean_phone(raw):
    """Any common way of writing a number → E.164 (+2348031234567). Mobile numbers in allowed countries only."""
    raw = str(raw or "").strip()
    if not raw or len(raw) > 32:
        raise ValidationError("Enter your phone number, e.g. 0803 123 4567.", code="invalid_phone")
    try:
        number = phonenumbers.parse(raw, settings.PHONE_DEFAULT_REGION)
    except phonenumbers.NumberParseException:
        raise ValidationError("That doesn't look like a phone number.", code="invalid_phone")
    if not phonenumbers.is_valid_number(number):
        raise ValidationError("That phone number isn't valid. Check the digits.", code="invalid_phone")
    if phonenumbers.region_code_for_number(number) not in settings.PHONE_ALLOWED_REGIONS:
        raise ValidationError("Akines isn't available for numbers from that country yet.", code="unsupported_region")
    if phonenumbers.number_type(number) not in (phonenumbers.PhoneNumberType.MOBILE, phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE):
        raise ValidationError("Use a mobile number that can receive SMS.", code="not_mobile")
    return phonenumbers.format_number(number, phonenumbers.PhoneNumberFormat.E164)


def clean_email(raw):
    email = unicodedata.normalize("NFKC", str(raw or "")).strip().lower()
    if not email or len(email) > 254:
        raise ValidationError("Enter your email address.", code="invalid_email")
    try:
        _email(email)
    except DjangoValidationError:
        raise ValidationError("That email address isn't valid.", code="invalid_email")
    if email.rsplit("@", 1)[1] in settings.BLOCKED_EMAIL_DOMAINS:
        raise ValidationError("Please use a permanent email address.", code="disposable_email")
    return email


def clean_name(raw):
    name = clean_text(raw, 50)
    if len(name) < 2:
        raise ValidationError("Enter the name people know you by.", code="too_short")
    if not NAME_RE.fullmatch(name):
        raise ValidationError("Use letters only. Spaces, hyphens and apostrophes are fine.", code="invalid_name")
    return name


def clean_handle(raw):
    handle = str(raw or "").strip().lstrip("@").lower()
    if not HANDLE_RE.fullmatch(handle):
        raise ValidationError("3 to 30 characters: letters, numbers, dots and underscores. It can't start with a dot or underscore or end with a dot.", code="invalid_handle")
    if not re.search(r"[a-z]", handle):
        raise ValidationError("Include at least one letter.", code="invalid_handle")
    if handle in RESERVED_HANDLES or handle.startswith("akines"):
        raise ValidationError("That username isn't available.", code="handle_taken")
    return handle


def age_on(dob, today=None):
    today = today or date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def clean_date_of_birth(dob):
    today = date.today()
    if dob > today:
        raise ValidationError("That date is in the future.", code="invalid_date")
    age = age_on(dob, today)
    if age > 120:
        raise ValidationError("Check the year you were born.", code="invalid_date")
    if age < settings.MIN_SIGNUP_AGE:
        raise ValidationError(f"You need to be {settings.MIN_SIGNUP_AGE} or older to join Akines.", code="too_young")
    return dob


def mask_destination(destination):
    """For logs and screens: +234 803 *** 4567 / a***@gmail.com"""
    if destination.startswith("+"):
        return f"{destination[:4]} {destination[4:7]} *** {destination[-4:]}" if len(destination) > 10 else destination[:4] + " ***"
    local, _, domain = destination.partition("@")
    return f"{local[:1]}***@{domain}"
