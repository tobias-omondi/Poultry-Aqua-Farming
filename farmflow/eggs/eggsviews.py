from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth

from .models import EggCollections, EggSales
from .serializers import EggCollectionsSerializer, EggSalesSerializer


class EggCollectionViewSet(viewsets.ModelViewSet):
    queryset = EggCollections.objects.all()
    serializer_class = EggCollectionsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EggCollections.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class EggSalesViewSet(viewsets.ModelViewSet):
    queryset = EggSales.objects.all()
    serializer_class = EggSalesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EggSales.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def egg_summary(request):
    eggs = EggCollections.objects.filter(owner=request.user)

    def group(trunc):
        return list(
            eggs.annotate(period=trunc("date"))
                .values("period")
                .annotate(total=Sum("total_eggs_collected"))
                .order_by("-period")[:12]
        )

    return Response({
        "total_eggs_collected": eggs.aggregate(total=Sum("total_eggs_collected"))["total"] or 0,
        "daily": group(TruncDay),
        "weekly": group(TruncWeek),
        "monthly": group(TruncMonth),
    })