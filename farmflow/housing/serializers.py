from rest_framework import serializers
from .models import House


class HouseSerializer(serializers.ModelSerializer):
    is_available = serializers.SerializerMethodField()
    occupancy_percentage = serializers.SerializerMethodField()

    class Meta:
        model = House
        fields = '__all__'

    def get_is_available(self, obj):
        return obj.is_available()

    def get_occupancy_percentage(self, obj):
        return obj.occupancy_percentage()