from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class AkinesUserAdmin(UserAdmin):
    list_display = ("username", "display_name", "phone", "email", "city", "date_joined", "is_staff")
    search_fields = ("username", "display_name", "phone", "email")
    fieldsets = UserAdmin.fieldsets + (("Akines profile", {"fields": ("phone", "display_name", "city", "role", "avatar_url")}),)
