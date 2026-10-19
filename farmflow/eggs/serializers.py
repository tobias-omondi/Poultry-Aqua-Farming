from .models import EggCollections, EggSales
from rest_framework import serializers

class EggCollectionsSerializer(serializers.ModelSerializer):
  class Meta:
    model = EggCollections
    fields = '__all__'
    read_only_fields = ['owner']

class EggSalesSerializer(serializers.ModelSerializer):
  class Meta:
    model = EggSales
    fields = '__all__'
    read_only_fields = ['owner']