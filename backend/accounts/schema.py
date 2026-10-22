from drf_spectacular.extensions import OpenApiAuthenticationExtension


class CsrfSessionScheme(OpenApiAuthenticationExtension):
    target_class = "accounts.throttles.CsrfSessionAuthentication"
    name = "session"

    def get_security_definition(self, auto_schema):
        return {"type": "apiKey", "in": "cookie", "name": "sessionid", "description": "Session cookie. Unsafe requests also need the X-CSRFToken header (GET /api/v1/auth/csrf/)."}
