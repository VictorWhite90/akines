from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin

from . import security
from .models import LoginCode, SecurityEvent, User, UserSession


class ReadOnlyAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(User)
class AkinesUserAdmin(UserAdmin):
    list_display = ("__str__", "handle", "phone", "email", "city", "date_joined", "is_active", "is_staff")
    list_filter = ("is_active", "is_staff", "marketing_opt_in", "date_joined")
    search_fields = ("username", "handle", "display_name", "phone", "email")
    readonly_fields = ("last_login", "date_joined", "terms_version", "terms_accepted_at", "phone_verified_at", "email_verified_at", "deleted_at")
    fieldsets = UserAdmin.fieldsets + (
        ("Akines profile", {"fields": ("handle", "display_name", "phone", "phone_verified_at", "email_verified_at", "date_of_birth", "city", "role", "avatar_url")}),
        ("Consent", {"fields": ("terms_version", "terms_accepted_at", "marketing_opt_in", "deleted_at")}),
    )
    actions = ["suspend_and_sign_out"]

    @admin.action(description="Suspend and sign out of all devices")
    def suspend_and_sign_out(self, request, queryset):
        n = 0
        for user in queryset.exclude(pk=request.user.pk):
            user.is_active = False
            user.save(update_fields=["is_active"])
            n += security.end_sessions(user)
        self.message_user(request, f"Suspended {queryset.count()} account(s), ended {n} session(s).", messages.SUCCESS)


@admin.register(UserSession)
class UserSessionAdmin(ReadOnlyAdmin):
    list_display = ("user", "device", "ip", "created_at", "last_seen_at")
    search_fields = ("user__handle", "user__phone", "ip")
    exclude = ("session_key",)

    @admin.display(description="Device")
    def device(self, obj):
        return security.describe_device(obj.user_agent)

    def has_delete_permission(self, request, obj=None):
        return True

    def delete_model(self, request, obj):
        security.end_session(obj)

    def delete_queryset(self, request, queryset):
        for s in queryset:
            security.end_session(s)


@admin.register(LoginCode)
class LoginCodeAdmin(ReadOnlyAdmin):
    list_display = ("masked", "channel", "purpose", "ip", "created_at", "expires_at", "used_at", "attempts")
    list_filter = ("channel", "purpose")
    search_fields = ("destination", "ip")
    exclude = ("code_hash",)

    @admin.display(description="Sent to")
    def masked(self, obj):
        from .validators import mask_destination
        return mask_destination(obj.destination)


@admin.register(SecurityEvent)
class SecurityEventAdmin(ReadOnlyAdmin):
    list_display = ("created_at", "kind", "user", "destination", "ip")
    list_filter = ("kind",)
    search_fields = ("user__handle", "user__phone", "destination", "ip")
    date_hierarchy = "created_at"

    def has_delete_permission(self, request, obj=None):
        return False
