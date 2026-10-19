from django.contrib import admin
from .models import IncubationBatch


@admin.register(IncubationBatch)
class IncubationBatchAdmin(admin.ModelAdmin):
    list_display = ['owner', 'batch_name', 'date_set', 'hatcher_date', 'expected_hatch_date', 'eggs_set', 'infertile', 'hatched', 'hatch_rate']
    list_filter = ['date_set']
    search_fields = ['owner__username', 'batch_name']
    ordering = ['-date_set']