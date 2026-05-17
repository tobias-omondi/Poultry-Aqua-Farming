from rest_framework import serializers
from .models import Cost, Sale


class CostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cost
        fields = '__all__'


class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'