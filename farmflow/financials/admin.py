from django.contrib import admin
from .models import Cost, Sale


@admin.register(Cost)
class CostAdmin(admin.ModelAdmin):
    list_display = ['description', 'category', 'amount', 'batch', 'date']
    list_filter = ['category', 'batch']
    search_fields = ['description']
    ordering = ['-date']


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['description', 'amount', 'batch', 'buyer_name', 'date']
    list_filter = ['batch']
    search_fields = ['description', 'buyer_name']
    ordering = ['-date']