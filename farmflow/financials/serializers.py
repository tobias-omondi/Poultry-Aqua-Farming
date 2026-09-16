from rest_framework import serializers
from .models import Cost, Sale


class CostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cost
        fields = '__all__'
        read_only_fields = ('user',)

    def validate_batch(self, value):
        request = self.context.get('request')
        if value and request and value.user != request.user:
            raise serializers.ValidationError('This batch belongs to another user.')
        return value


class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ('user',)

    def validate_batch(self, value):
        request = self.context.get('request')
        if value and request and value.user != request.user:
            raise serializers.ValidationError('This batch belongs to another user.')
        return value