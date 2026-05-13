from django.contrib import admin
from .models import Supplier, FeedStock, Medication, PurchaseOrder, PriceHistory


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'phone', 'location']
    list_filter = ['category']
    search_fields = ['name', 'location']


@admin.register(FeedStock)
class FeedStockAdmin(admin.ModelAdmin):
    list_display = ['feed_type', 'brand', 'quantity_bags', 'total_kg', 'reorder_level', 'is_low', 'last_restocked']
    list_filter = ['feed_type']


@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ['name', 'quantity', 'unit', 'reorder_level', 'is_low', 'expiry_date']


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ['item_name', 'item_type', 'quantity', 'unit', 'supplier', 'estimated_cost', 'actual_cost', 'status', 'date_needed', 'date_purchased']
    list_filter = ['status', 'item_type']
    search_fields = ['item_name']
    readonly_fields = ['cost_variance']


@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ['supplier', 'item_name', 'price_per_unit', 'unit', 'date']
    list_filter = ['supplier', 'item_type']
    ordering = ['-date']