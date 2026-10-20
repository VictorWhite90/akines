from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import LoginCode, User


@admin.register(User)
class AkinesUserAdmin(UserAdmin):
    list_display = ("username", "display_name", "phone", "email", "city", "date_joined", "is_staff")
    search_fields = ("username", "display_name", "phone", "email")
    fieldsets = UserAdmin.fieldsets + (("Akines profile", {"fields": ("phone", "display_name", "city", "role", "avatar_url")}),)


@admin.register(LoginCode)
class LoginCodeAdmin(admin.ModelAdmin):
    list_display = ("destination", "channel", "created_at", "expires_at", "used_at", "attempts")
    list_filter = ("channel",)
    search_fields = ("destination",)
    readonly_fields = [f.name for f in LoginCode._meta.fields]

    def has_add_permission(self, request):
        return False
