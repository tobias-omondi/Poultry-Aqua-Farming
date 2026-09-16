from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import House
from .serializers import HouseSerializer
from rest_framework.permissions import IsAuthenticated


class HouseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = HouseSerializer

    def get_queryset(self):
        return House.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class HouseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = HouseSerializer

    def get_queryset(self):
        return House.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_houses(request):
    """Returns only houses with no active batch."""
    houses = House.objects.filter(user=request.user, active_batch__isnull=True)
    return Response(HouseSerializer(houses, many=True).data)