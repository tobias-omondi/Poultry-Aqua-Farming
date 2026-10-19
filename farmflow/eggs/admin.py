from django.contrib import admin
from .models import EggCollections, EggSales

# Register your models here.
@admin.register(EggCollections)
class EggCollectionAdmin(admin.ModelAdmin):
    list_display = ['owner', 'collection_date', 'total_eggs_collected', 'broken', 'rotten']
    list_filter = ['collection_date']
    search_fields = ['owner__username']
    ordering = ['-collection_date']

@admin.register(EggSales)
class EggSalesAdmin(admin.ModelAdmin):
    list_display = ['owner', 'sale_date', 'customer_name', 'eggs', 'total_eggs_sold', 'price_per_egg', 'total_sale_amount', 'status']
    list_filter = ['sale_date', 'status']
    search_fields = ['owner__username', 'customer_name']
    ordering = ['-sale_date']
