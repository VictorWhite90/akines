# Akines API (Django)

Django 5.2 LTS + Django REST Framework + PostgreSQL. Python 3.12.

## Run locally

```bash
cd backend
cp .env.example .env          # then set DATABASE_URL and DEBUG=true
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8000
```

Admin: http://localhost:8000/admin/ · Health: http://localhost:8000/health/

## Deploy (staging and production)

1. Set the environment variables listed in `.env.example` (`DATABASE_URL`, `SECRET_KEY`, `DEBUG=false`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, `CORS_ALLOWED_ORIGINS`).
2. Build:
   ```bash
   pip install -r requirements.txt
   python manage.py collectstatic --noinput
   ```
3. On every release, before starting the new version:
   ```bash
   python manage.py migrate --noinput
   ```
   Tables are defined in each app's `models.py`; the files in `*/migrations/` create and update them. Never edit tables by hand.
4. Start:
   ```bash
   gunicorn akines_api.wsgi --bind 0.0.0.0:$PORT --workers 3
   ```
5. Health check path: `/health/` (returns 200 when the database is reachable).

## Apps

| App | Holds |
|---|---|
| `accounts` | `User` (phone sign-in, display name, city, role) |
| `communities` | `CommunityCircle`, `Membership` (leader/member), invite codes. API under `/api/communities/` |
