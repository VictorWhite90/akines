from django.conf import settings
from django.contrib import admin
from django.db import connection
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


def health(request):
    """For the load balancer and uptime checks: 200 when the app can reach the database."""
    try:
        with connection.cursor() as c:
            c.execute("SELECT 1")
    except Exception:
        return JsonResponse({"ok": False}, status=503)
    return JsonResponse({"ok": True})


admin.site.site_header = "Akines admin"
admin.site.site_title = "Akines admin"

api_v1 = [
    path("", include("accounts.urls")),
    path("", include("communities.urls")),
]

urlpatterns = [
    path(settings.ADMIN_URL, admin.site.urls),
    path("health/", health),
    path("api/v1/", include(api_v1)),
]

if settings.API_DOCS:
    urlpatterns += [
        path("api/v1/schema/", SpectacularAPIView.as_view(), name="schema"),
        path("api/v1/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
    ]
