from rest_framework import serializers
from .models import IncubationBatch


class IncubationBatchSerializer(serializers.ModelSerializer):
    hatcher_date = serializers.ReadOnlyField()
    expected_hatch_date = serializers.ReadOnlyField()
    hatch_rate = serializers.ReadOnlyField()

    class Meta:
        model = IncubationBatch
        fields = "__all__"
        read_only_fields = ["owner"]

