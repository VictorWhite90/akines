"""One error shape for the whole API, so web and mobile clients handle failures the same way:

    {"code": "invalid_code", "detail": "That code is wrong or has expired.", "fields": {...}, "retryAfter": 42}

`code` is stable and machine-readable; `detail` is safe to show to the person.
"""
from rest_framework import status
from rest_framework.exceptions import APIException, ErrorDetail, Throttled, ValidationError
from rest_framework.views import exception_handler as drf_exception_handler


class ApiError(APIException):
    """Raise with a stable code: raise ApiError("rate_limited", "Try again soon.", 429, retry_after=30)."""

    def __init__(self, code, detail, status_code=status.HTTP_400_BAD_REQUEST, retry_after=None, extra=None):
        self.status_code = status_code
        self.retry_after = retry_after
        self.extra = extra or {}
        super().__init__(ErrorDetail(detail, code), code)


def _messages(value):
    if isinstance(value, dict):
        return {k: _messages(v) for k, v in value.items()}
    if isinstance(value, list):
        return [str(v) if not isinstance(v, (dict, list)) else _messages(v) for v in value]
    return [str(value)]


def _first(detail):
    if isinstance(detail, list) and detail:
        return _first(detail[0])
    if isinstance(detail, dict) and detail:
        return _first(next(iter(detail.values())))
    return detail


def exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is None:
        return None  # unhandled: Django returns a plain 500 and logs it

    if isinstance(exc, ValidationError):
        detail = exc.detail
        body = {"code": "invalid", "detail": "Please check the highlighted fields."}
        if isinstance(detail, dict):
            general = detail.get("non_field_errors")
            fields = {k: v for k, v in detail.items() if k != "non_field_errors"}
            if general:
                body["detail"] = str(_first(general))
                code = getattr(_first(general), "code", None)
                if code and code != "invalid":
                    body["code"] = code
            if fields:
                body["fields"] = _messages(fields)
        else:
            body["detail"] = str(_first(detail))
        response.data = body
        return response

    detail = exc.detail if hasattr(exc, "detail") else str(exc)
    code = exc.get_codes() if hasattr(exc, "get_codes") else "error"
    body = {"code": code if isinstance(code, str) else "error", "detail": str(_first(detail))}
    if body["code"] == "not_authenticated":
        body["detail"] = "Please sign in to continue."
    elif body["code"] == "permission_denied" and "CSRF" in body["detail"]:
        body["code"] = "csrf_failed"
        body["detail"] = "Your session needs refreshing. Reload the page and try again."
    retry_after = getattr(exc, "retry_after", None)
    if isinstance(exc, Throttled):
        body["code"] = "rate_limited"
        body["detail"] = "Too many requests. Please slow down and try again shortly."
        retry_after = exc.wait
    if retry_after:
        body["retryAfter"] = int(retry_after) + (0 if float(retry_after).is_integer() else 1)
        response["Retry-After"] = str(body["retryAfter"])
    body.update(getattr(exc, "extra", {}) or {})
    response.data = body
    return response
