from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Supplier, FeedStock, Medication, PurchaseOrder, PriceHistory
from .serializers import (
    SupplierSerializer, FeedStockSerializer, MedicationSerializer,
    PurchaseOrderSerializer, PriceHistorySerializer
)
from rest_framework.permissions import IsAuthenticated


class SupplierListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Supplier.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    serializer_class = SupplierSerializer


class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Supplier.objects.filter(user=self.request.user)

    serializer_class = SupplierSerializer


class FeedStockListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FeedStock.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    serializer_class = FeedStockSerializer


class FeedStockDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FeedStock.objects.filter(user=self.request.user)

    serializer_class = FeedStockSerializer


class MedicationListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Medication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    serializer_class = MedicationSerializer


class MedicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Medication.objects.filter(user=self.request.user)

    serializer_class = MedicationSerializer


class PurchaseOrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PurchaseOrder.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    serializer_class = PurchaseOrderSerializer


class PurchaseOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PurchaseOrder.objects.filter(user=self.request.user)

    serializer_class = PurchaseOrderSerializer


class PriceHistoryListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PriceHistory.objects.filter(user=self.request.user).order_by('-date')

    serializer_class = PriceHistorySerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_alerts(request):
    """Returns all items that are at or below reorder level."""
    low_feed = FeedStock.objects.filter(user=request.user, quantity_bags__lte=5)
    low_meds = Medication.objects.filter(user=request.user, quantity__lte=2)

    return Response({
        'low_feed': FeedStockSerializer(low_feed, many=True).data,
        'low_medications': MedicationSerializer(low_meds, many=True).data,
        'total_alerts': low_feed.count() + low_meds.count(),
    })