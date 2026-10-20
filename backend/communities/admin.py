from django.contrib import admin
from django.db.models import Count

from .models import CommunityCircle, Membership


class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 0
    autocomplete_fields = ["user"]
    readonly_fields = ["joined_at"]


@admin.register(CommunityCircle)
class CommunityCircleAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "area", "member_total", "verified", "created_by", "created_at")
    list_filter = ("verified", "category", "area")
    list_editable = ("verified",)
    search_fields = ("name", "tagline", "instagram", "invite_code")
    readonly_fields = ("slug", "invite_code", "created_at", "updated_at")
    inlines = [MembershipInline]
    actions = ["mark_verified"]

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_members=Count("memberships"))

    @admin.display(description="Members", ordering="_members")
    def member_total(self, obj):
        return obj._members

    @admin.action(description="Mark selected communities as verified")
    def mark_verified(self, request, queryset):
        queryset.update(verified=True)


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "community", "role", "joined_at")
    list_filter = ("role",)
    search_fields = ("user__username", "user__display_name", "community__name")
    autocomplete_fields = ["user", "community"]
