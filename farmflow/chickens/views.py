from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Batch, DailyLog, Harvest
from .serializers import BatchSerializer, BatchListSerializer, DailyLogSerializer, HarvestSerializer
from rest_framework.permissions import IsAuthenticated


class BatchListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Batch.objects.all().order_by('-start_date')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return BatchListSerializer
        return BatchSerializer


class BatchDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer


class DailyLogListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DailyLogSerializer

    def get_queryset(self):
        batch_id = self.kwargs['batch_id']
        return DailyLog.objects.filter(batch_id=batch_id).order_by('-date')


class DailyLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = DailyLog.objects.all()
    serializer_class = DailyLogSerializer


class HarvestCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Harvest.objects.all()
    serializer_class = HarvestSerializer


class HarvestDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Harvest.objects.all()
    serializer_class = HarvestSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def batch_summary(request, pk):
    """Returns full P&L summary for a single batch."""
    try:
        batch = Batch.objects.get(pk=pk)
    except Batch.DoesNotExist:
        return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)

    total_costs = sum(cost.amount for cost in batch.costs.all())

    total_revenue = 0
    if hasattr(batch, 'harvest'):
        total_revenue = batch.harvest.total_revenue() or 0
    total_revenue += sum(sale.amount for sale in batch.sales.all())

    total_feed_kg = sum(log.feed_consumed_kg for log in batch.daily_logs.all())

    profit = total_revenue - total_costs - batch.purchase_cost

    return Response({
        'batch': batch.name,
        'status': batch.status,
        'initial_count': batch.initial_count,
        'current_count': batch.current_count,
        'total_deaths': batch.total_deaths(),
        'mortality_percentage': batch.mortality_percentage(),
        'total_feed_consumed_kg': float(total_feed_kg),
        'purchase_cost': float(batch.purchase_cost),
        'total_costs': float(total_costs),
        'total_revenue': float(total_revenue),
        'profit': float(profit),
        'is_profitable': profit > 0,
    })