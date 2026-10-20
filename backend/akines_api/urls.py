from django.contrib import admin
from django.db import connection
from django.http import JsonResponse
from django.urls import path


def health(request):
    """For the load balancer and uptime checks: 200 when the app can reach the database."""
    with connection.cursor() as c:
        c.execute("SELECT 1")
    return JsonResponse({"ok": True})


admin.site.site_header = "Akines admin"
admin.site.site_title = "Akines admin"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health),
]
