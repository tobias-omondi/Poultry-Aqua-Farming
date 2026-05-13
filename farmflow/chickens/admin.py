from django.contrib import admin
from .models import Batch, DailyLog, Harvest


class DailyLogInline(admin.TabularInline):
    model = DailyLog
    extra = 1
    fields = ['date', 'feed_consumed_kg', 'deaths', 'average_weight_kg', 'notes']


class HarvestInline(admin.StackedInline):
    model = Harvest
    extra = 0
    fields = ['date', 'birds_sold', 'total_weight_kg', 'price_per_kg', 'buyer_name', 'notes']


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ['name', 'breed', 'initial_count', 'current_count', 'status', 'start_date', 'mortality_percentage']
    list_filter = ['status', 'breed']
    search_fields = ['name']
    inlines = [DailyLogInline, HarvestInline]
    readonly_fields = ['mortality_percentage', 'total_deaths']


@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
    list_display = ['batch', 'date', 'feed_consumed_kg', 'deaths', 'average_weight_kg']
    list_filter = ['batch']
    ordering = ['-date']


@admin.register(Harvest)
class HarvestAdmin(admin.ModelAdmin):
    list_display = ['batch', 'date', 'birds_sold', 'total_weight_kg', 'price_per_kg', 'total_revenue']
    readonly_fields = ['total_revenue']