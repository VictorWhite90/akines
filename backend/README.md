# Akines API (Django)

Django 5.2 LTS, Django REST Framework, PostgreSQL, Redis. Python 3.12.

## Run locally

```bash
cd backend
cp .env.example .env          # set DATABASE_URL and DEBUG=true; nothing else is needed locally
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8000
python manage.py test         # 76 tests
```

- Admin: http://localhost:8000/admin/
- API docs (Swagger): http://localhost:8000/api/v1/docs/
- Health: http://localhost:8000/health/

Locally, with no SMS or email provider configured, sign-in codes are printed in the `runserver` terminal.
Outside DEBUG that fallback is disabled: the API refuses to send rather than log a code.

## Deploy (staging and production)

1. **Services:** PostgreSQL 16+, Redis 7+, HTTPS in front (load balancer or reverse proxy).
2. **Environment:** every variable in `.env.example`. Required in staging/production: `DATABASE_URL`, `SECRET_KEY`, `REDIS_URL`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, `CORS_ALLOWED_ORIGINS`, `TRUSTED_PROXY_COUNT`, `TERMII_*` (SMS) and `EMAIL_*`. Recommended: `TURNSTILE_SECRET_KEY`, a non-default `ADMIN_URL`.
   The app refuses to start without `SECRET_KEY` and `REDIS_URL` when `DEBUG=false`.
3. **Build:**
   ```bash
   pip install -r requirements.txt
   python manage.py collectstatic --noinput
   python manage.py check --deploy
   ```
4. **On every release, before the new version takes traffic:**
   ```bash
   python manage.py migrate --noinput
   ```
   Tables are defined in each app's `models.py`; the files in `*/migrations/` create and update them. Never change tables by hand.
5. **Start:** `gunicorn akines_api.wsgi --bind 0.0.0.0:$PORT --workers 3 --timeout 30`
6. **Health check:** `GET /health/` returns 200 when the database is reachable (503 otherwise). It is exempt from the HTTPS redirect.
7. **Housekeeping (daily cron):** `python manage.py clearsessions`

## Security model

| Area | What we do |
|---|---|
| Sign-in | One-time 6-digit code by SMS (Termii) or email. No member passwords. Code valid 10 min, single use, a new code cancels the old one, stored only as an HMAC. |
| Sign-up | Proving the phone/email returns a signed, 30-minute sign-up token. The account is created only when the profile is completed (name, @handle, date of birth, terms). |
| Enumeration | `auth/start` responds the same whether or not an account exists. |
| Brute force | 5 guesses per code; 10 wrong guesses per number per hour locks it for an hour. |
| SMS abuse | Per number: 60 s between codes, 5/hour, 10/day. Per IP: 50/hour (mobile networks share IPs). Platform-wide `SMS_DAILY_CAP`. Optional Cloudflare Turnstile. DRF rate limits per IP on every auth endpoint. |
| Sessions | HttpOnly, Secure, SameSite=Lax cookies; session id rotates at sign-in; 60-day lifetime; sessions in Redis + Postgres. Members can list devices and end them remotely. |
| CSRF | Enforced on every unsafe request, signed in or not (prevents login CSRF). |
| Sensitive changes | Changing phone/email needs a sign-in within the last 15 minutes plus a code sent to the new contact; the old email is notified. Deleting the account needs a code. |
| Account deletion | Personal data is erased, sessions ended, memberships removed; a sole leader of a community with members must hand over first. (Nigeria Data Protection Act 2023.) |
| Consent | Terms version and acceptance time stored; marketing opt-in separate and off by default. Minimum age `MIN_SIGNUP_AGE` (default 18). |
| Audit | `SecurityEvent` log (sign-ups, sign-ins, failed codes, lockouts, device and contact changes, deletions) with IP and device; contacts masked; codes never logged. |
| Validation | Phones via Google libphonenumber (mobile numbers in `PHONE_ALLOWED_REGIONS` only). Names allow Yoruba/Igbo/Hausa diacritics; hidden/control characters stripped. Reserved @handles. Disposable email domains blocked. |
| Headers | HSTS, nosniff, X-Frame-Options DENY, strict referrer policy, COOP. |
| Staff | Admin passwords min 12 characters. "Suspend and sign out of all devices" action. |

## API (v1)

All errors: `{"code": "<stable_code>", "detail": "<message for people>", "fields"?: {...}, "retryAfter"?: seconds}`.
Clients call `GET /api/v1/auth/csrf/` once, then send the `X-CSRFToken` header (re-read the `csrftoken` cookie after signing in; it rotates).

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/auth/csrf/` | Set the CSRF cookie |
| POST | `/api/v1/auth/start/` | `{phone \| email, captchaToken?}` → send a code |
| POST | `/api/v1/auth/verify/` | `{phone \| email, code}` → `signed_in` with `user`, or `needs_profile` with `signupToken` |
| POST | `/api/v1/auth/complete-signup/` | `{signupToken, name, handle, dateOfBirth, acceptTerms, termsVersion, city?, marketingOptIn?}` |
| GET | `/api/v1/auth/handle-available/?handle=` | Live @handle check |
| POST | `/api/v1/auth/sign-out/` | End this session |
| GET/PATCH | `/api/v1/account/me/` | Profile |
| GET/DELETE | `/api/v1/account/sessions/` | List devices / end all other devices |
| DELETE | `/api/v1/account/sessions/<id>/` | End one device |
| POST | `/api/v1/account/contact/start/`, `/verify/` | Add or change phone/email |
| POST | `/api/v1/account/delete/start/`, `/confirm/` | Delete account |
| GET/POST | `/api/v1/communities/` | Browse (paginated, `?q=&category=&area=&page=`) / register |
| GET/PATCH | `/api/v1/communities/<id>/` | One community / leaders edit |
| POST | `/api/v1/communities/<id>/join/`, `/leave/` | Membership (`{code}` needed until verified) |
| GET | `/api/v1/communities/mine/` | Your communities |
| GET | `/api/v1/communities/by-code/<code>/` | Open an invite link |

Full request/response schemas: `/api/v1/docs/` (or `python manage.py spectacular --file schema.yml`).

## Apps

| App | Holds |
|---|---|
| `accounts` | `User`, `LoginCode`, `UserSession`, `SecurityEvent`; sign-in, sign-up, profile, devices, contact change, deletion |
| `communities` | `CommunityCircle`, `Membership` (leader/member), invite codes |
