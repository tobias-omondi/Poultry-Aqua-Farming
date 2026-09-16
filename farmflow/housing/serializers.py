from rest_framework import serializers
from .models import House


class HouseSerializer(serializers.ModelSerializer):
    is_available = serializers.SerializerMethodField()
    occupancy_percentage = serializers.SerializerMethodField()

    class Meta:
        model = House
        fields = '__all__'
        read_only_fields = ('user',)

    def to_internal_value(self, data):
        data = data.copy()
        for field in ['active_batch', 'last_cleaned']:
            if field in data and data[field] in ['', None]:
                data[field] = None
        return super().to_internal_value(data)

    def get_is_available(self, obj):
        return obj.is_available()

    def get_occupancy_percentage(self, obj):
        return obj.occupancy_percentage()