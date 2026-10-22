from django.contrib import admin
from .models import Profile, CookieConsent


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'farm_name')
    list_filter = ('created_at',)

@admin.register(CookieConsent)
class CookieConsentAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'consent', 'ip_address', 'created_at', 'updated_at']
    list_filter = ['consent']
    readonly_fields = ['created_at', 'updated_at', 'ip_address', 'user_agent']