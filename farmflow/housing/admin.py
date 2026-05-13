from django.contrib import admin
from .models import House


@admin.register(House)
class HouseAdmin(admin.ModelAdmin):
    list_display = ['name', 'capacity', 'active_batch', 'is_available', 'occupancy_percentage', 'last_cleaned']
    readonly_fields = ['is_available', 'occupancy_percentage']