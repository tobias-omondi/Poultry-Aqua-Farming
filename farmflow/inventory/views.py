from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Supplier, FeedStock, Medication, PurchaseOrder, PriceHistory
from .serializers import (
    SupplierSerializer, FeedStockSerializer, MedicationSerializer,
    PurchaseOrderSerializer, PriceHistorySerializer
)


class SupplierListCreateView(generics.ListCreateAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class FeedStockListCreateView(generics.ListCreateAPIView):
    queryset = FeedStock.objects.all()
    serializer_class = FeedStockSerializer


class FeedStockDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FeedStock.objects.all()
    serializer_class = FeedStockSerializer


class MedicationListCreateView(generics.ListCreateAPIView):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer


class MedicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer


class PurchaseOrderListCreateView(generics.ListCreateAPIView):
    queryset = PurchaseOrder.objects.all().order_by('-created_at')
    serializer_class = PurchaseOrderSerializer


class PurchaseOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer


class PriceHistoryListView(generics.ListAPIView):
    queryset = PriceHistory.objects.all().order_by('-date')
    serializer_class = PriceHistorySerializer


@api_view(['GET'])
def low_stock_alerts(request):
    """Returns all items that are at or below reorder level."""
    low_feed = FeedStock.objects.filter(quantity_bags__lte=5)
    low_meds = Medication.objects.filter(quantity__lte=2)

    return Response({
        'low_feed': FeedStockSerializer(low_feed, many=True).data,
        'low_medications': MedicationSerializer(low_meds, many=True).data,
        'total_alerts': low_feed.count() + low_meds.count(),
    })