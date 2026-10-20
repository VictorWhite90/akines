"""Akines API settings. Every environment-specific value comes from env vars (see .env.example)."""
import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env(name, default=""):
    return os.environ.get(name, default)


def env_bool(name, default=False):
    return env(name, str(default)).strip().lower() in ("1", "true", "yes", "on")


def env_int(name, default):
    return int(env(name, str(default)))


def env_list(name, default=""):
    return [x.strip() for x in env(name, default).split(",") if x.strip()]


# ---------------------------------------------------------------- core
DEBUG = env_bool("DEBUG")
SECRET_KEY = env("SECRET_KEY") or ("dev-only-not-secret" if DEBUG else "")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY must be set when DEBUG is false")
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", "http://localhost:3000")
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:3000")
CORS_ALLOW_CREDENTIALS = True
# Number of reverse proxies / load balancers in front of the app that append to X-Forwarded-For.
TRUSTED_PROXY_COUNT = env_int("TRUSTED_PROXY_COUNT", 0)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "drf_spectacular",
    "accounts",
    "communities",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "accounts.middleware.SessionActivityMiddleware",
]

ROOT_URLCONF = "akines_api.urls"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]
WSGI_APPLICATION = "akines_api.wsgi.application"
ADMIN_URL = env("ADMIN_URL", "admin/")

# ---------------------------------------------------------------- data
DATABASES = {"default": dj_database_url.config(env="DATABASE_URL", conn_max_age=600, conn_health_checks=True)}
if not DATABASES["default"]:
    raise RuntimeError("DATABASE_URL must be set (see .env.example)")

REDIS_URL = env("REDIS_URL")
if REDIS_URL:
    CACHES = {"default": {"BACKEND": "django.core.cache.backends.redis.RedisCache", "LOCATION": REDIS_URL, "KEY_PREFIX": "akines"}}
    SESSION_ENGINE = "django.contrib.sessions.backends.cached_db"
else:
    if not DEBUG:
        raise RuntimeError("REDIS_URL must be set in staging/production (rate limits and sessions must be shared between servers)")
    CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
    SESSION_ENGINE = "django.contrib.sessions.backends.db"

AUTH_USER_MODEL = "accounts.User"
AUTH_PASSWORD_VALIDATORS = [  # staff passwords for the admin; members sign in with codes
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 12}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ---------------------------------------------------------------- API
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["accounts.throttles.CsrfSessionAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticatedOrReadOnly"],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"] + (["rest_framework.renderers.BrowsableAPIRenderer"] if DEBUG else []),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "akines_api.exceptions.exception_handler",
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.AnonRateThrottle", "rest_framework.throttling.UserRateThrottle"],
    "NUM_PROXIES": TRUSTED_PROXY_COUNT,
    "DEFAULT_THROTTLE_RATES": {
        "anon": env("THROTTLE_ANON", "600/hour"),
        "user": env("THROTTLE_USER", "3000/hour"),
        # per IP; generous because Nigerian mobile networks put many people behind one IP
        "auth_start": env("THROTTLE_AUTH_START", "60/hour"),
        "auth_verify": env("THROTTLE_AUTH_VERIFY", "120/hour"),
        "auth_handle": env("THROTTLE_AUTH_HANDLE", "300/hour"),
        "auth_read": "600/hour",
        "account": "600/hour",
        "community_write": env("THROTTLE_COMMUNITY_WRITE", "60/hour"),
        "invite_lookup": env("THROTTLE_INVITE_LOOKUP", "120/hour"),
    },
}
SPECTACULAR_SETTINGS = {
    "TITLE": "Akines API",
    "DESCRIPTION": "Sign-in, accounts and community circles. Errors always look like {code, detail, fields?, retryAfter?}.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
}
API_DOCS = env_bool("API_DOCS", DEBUG)

# ---------------------------------------------------------------- sign-in
PHONE_DEFAULT_REGION = env("PHONE_DEFAULT_REGION", "NG")
PHONE_ALLOWED_REGIONS = env_list("PHONE_ALLOWED_REGIONS", "NG")
BLOCKED_EMAIL_DOMAINS = set(env_list("BLOCKED_EMAIL_DOMAINS", "mailinator.com,guerrillamail.com,10minutemail.com,tempmail.com,yopmail.com,trashmail.com"))
MIN_SIGNUP_AGE = env_int("MIN_SIGNUP_AGE", 18)
TERMS_VERSION = env("TERMS_VERSION", "2026-10-26")

LOGIN_CODE_TTL_MINUTES = env_int("LOGIN_CODE_TTL_MINUTES", 10)
LOGIN_CODE_RESEND_SECONDS = env_int("LOGIN_CODE_RESEND_SECONDS", 60)
LOGIN_CODE_MAX_PER_HOUR = env_int("LOGIN_CODE_MAX_PER_HOUR", 5)
LOGIN_CODE_MAX_PER_DAY = env_int("LOGIN_CODE_MAX_PER_DAY", 10)
LOGIN_CODE_MAX_PER_IP_HOUR = env_int("LOGIN_CODE_MAX_PER_IP_HOUR", 50)
LOGIN_CODE_MAX_ATTEMPTS = env_int("LOGIN_CODE_MAX_ATTEMPTS", 5)
LOGIN_LOCK_AFTER_FAILS = env_int("LOGIN_LOCK_AFTER_FAILS", 10)
SMS_DAILY_CAP = env_int("SMS_DAILY_CAP", 5000)
SIGNUP_TOKEN_MAX_AGE = 30 * 60
RECENT_AUTH_SECONDS = env_int("RECENT_AUTH_SECONDS", 15 * 60)

TERMII_API_KEY = env("TERMII_API_KEY")
TERMII_BASE_URL = env("TERMII_BASE_URL", "https://api.ng.termii.com")
TERMII_SENDER_ID = env("TERMII_SENDER_ID", "Akines")
TERMII_CHANNEL = env("TERMII_CHANNEL", "dnd")
TURNSTILE_SECRET_KEY = env("TURNSTILE_SECRET_KEY")

DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", "Akines <no-reply@akines.com>")
if env("EMAIL_HOST"):
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = env("EMAIL_HOST")
    EMAIL_PORT = env_int("EMAIL_PORT", 587)
    EMAIL_HOST_USER = env("EMAIL_HOST_USER")
    EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
    EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", True)
    EMAIL_TIMEOUT = 10
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

COMMUNITY_MAX_PER_USER = env_int("COMMUNITY_MAX_PER_USER", 5)

# ---------------------------------------------------------------- sessions and cookies
SESSION_COOKIE_AGE = 60 * 60 * 24 * 60  # 60 days, renewed while active
SESSION_SAVE_EVERY_REQUEST = False
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_HTTPONLY = False  # the web app reads it to send X-CSRFToken
SESSION_COOKIE_DOMAIN = env("COOKIE_DOMAIN") or None
CSRF_COOKIE_DOMAIN = env("COOKIE_DOMAIN") or None
X_FRAME_OPTIONS = "DENY"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", True)
    SECURE_REDIRECT_EXEMPT = [r"^health/$"]
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = env_int("SECURE_HSTS_SECONDS", 31536000)
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = env_bool("SECURE_HSTS_PRELOAD", False)

# ---------------------------------------------------------------- misc
LANGUAGE_CODE = "en-gb"
TIME_ZONE = "Africa/Lagos"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
DATA_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024  # 1 MB JSON bodies are plenty

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {"plain": {"format": "%(asctime)s %(levelname)s %(name)s %(message)s"}},
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "plain"}},
    "root": {"handlers": ["console"], "level": env("LOG_LEVEL", "INFO")},
    "loggers": {"django.db.backends": {"level": "WARNING"}},
}
