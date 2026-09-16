from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Cost, Sale
from .serializers import CostSerializer, SaleSerializer
from chickens.models import Batch
from rest_framework.permissions import IsAuthenticated


# The financial views provide endpoints for managing costs and sales, as well as summary endpoints for overall farm profitability and cost breakdowns. The ListCreateAPIView classes allow you to list all costs or sales and create new ones, while the RetrieveUpdateDestroyAPIView classes let you view, update, or delete individual records. The summary endpoints use custom logic to calculate total revenue, expenses, and profit, giving you insights into your farm's financial performance at a glance.

class CostListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CostSerializer

    def get_queryset(self):
        return Cost.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CostDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CostSerializer

    def get_queryset(self):
        return Cost.objects.filter(user=self.request.user)


class SaleListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SaleSerializer

    def get_queryset(self):
        return Sale.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SaleDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SaleSerializer

    def get_queryset(self):
        return Sale.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def farm_pl_summary(request):
    """Overall farm Profit&Loss — all batches combined."""
    user_batches = Batch.objects.filter(user=request.user)
    total_costs = sum(c.amount for c in Cost.objects.filter(user=request.user))
    total_sales = sum(s.amount for s in Sale.objects.filter(user=request.user))
    total_chick_costs = sum(
        b.purchase_cost for b in user_batches
    )

    total_expenses = total_costs + total_chick_costs
    profit = total_sales - total_expenses

    return Response({
        'total_revenue': float(total_sales),
        'total_costs': float(total_expenses),
        'profit': float(profit),
        'is_profitable': profit > 0,
        'active_batches': user_batches.filter(status='active').count(),
        'closed_batches': user_batches.filter(status='closed').count(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def costs_by_category(request):
    """Breakdown of costs by category."""
    from django.db.models import Sum
    breakdown = (
        Cost.objects
        .filter(user=request.user)
        .values('category')
        .annotate(total=Sum('amount'))
        .order_by('-total')
    )
    return Response(list(breakdown))