from rest_framework import serializers
from .models import Supplier, FeedStock, Medication, PurchaseOrder, PriceHistory


# Serializers for inventory app — these convert model instances to JSON and validate incoming data for API endpoints. Each serializer corresponds to a model and defines which fields should be included in the API responses. The Feed
class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ('user',)


class FeedStockSerializer(serializers.ModelSerializer):
    is_low = serializers.SerializerMethodField()
    total_kg = serializers.SerializerMethodField()

    class Meta:
        model = FeedStock
        fields = '__all__'
        read_only_fields = ('user',)

    def get_is_low(self, obj):
        return obj.is_low()

    def get_total_kg(self, obj):
        return float(obj.total_kg())


class MedicationSerializer(serializers.ModelSerializer):
    is_low = serializers.SerializerMethodField()

    class Meta:
        model = Medication
        fields = '__all__'
        read_only_fields = ('user',)

    def get_is_low(self, obj):
        return obj.is_low()


class PurchaseOrderSerializer(serializers.ModelSerializer):
    cost_variance = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = '__all__'
        read_only_fields = ('user',)

    def get_cost_variance(self, obj):
        return obj.cost_variance()


class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = '__all__'
        read_only_fields = ('user',)