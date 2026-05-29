from django.contrib import admin
from .models import Profile, CookieConsent


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'role', 'farm_name', 'phone']
    list_filter = ['role']
    search_fields = ['user__username', 'full_name', 'farm_name']

@admin.register(CookieConsent)
class CookieConsentAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'consent', 'ip_address', 'created_at', 'updated_at']
    list_filter = ['consent']
    readonly_fields = ['created_at', 'updated_at', 'ip_address', 'user_agent']