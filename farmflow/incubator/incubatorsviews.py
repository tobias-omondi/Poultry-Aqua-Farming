from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import IncubationBatch
from .serializers import IncubationBatchSerializer


class IncubationBatchViewSet(viewsets.ModelViewSet):
    queryset = IncubationBatch.objects.all()
    serializer_class = IncubationBatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return IncubationBatch.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)