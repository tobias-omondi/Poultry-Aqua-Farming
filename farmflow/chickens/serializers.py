from rest_framework import serializers
from .models import Batch, DailyLog, Harvest


class DailyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLog
        fields = '__all__'


class HarvestSerializer(serializers.ModelSerializer):
    total_revenue = serializers.SerializerMethodField()

    class Meta:
        model = Harvest
        fields = '__all__'

    def get_total_revenue(self, obj):
        return obj.total_revenue()


class BatchSerializer(serializers.ModelSerializer):
    daily_logs = DailyLogSerializer(many=True, read_only=True)
    harvest = HarvestSerializer(read_only=True)
    mortality_percentage = serializers.SerializerMethodField()
    total_deaths = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = '__all__'

    def get_mortality_percentage(self, obj):
        return obj.mortality_percentage()

    def get_total_deaths(self, obj):
        return obj.total_deaths()


class BatchListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views — no nested data."""
    mortality_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = [
            'id', 'name', 'breed', 'initial_count',
            'current_count', 'status', 'start_date',
            'end_date', 'mortality_percentage'
        ]

    def get_mortality_percentage(self, obj):
        return obj.mortality_percentage()