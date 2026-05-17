from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import House
from .serializers import HouseSerializer


class HouseListCreateView(generics.ListCreateAPIView):
    queryset = House.objects.all()
    serializer_class = HouseSerializer


class HouseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = House.objects.all()
    serializer_class = HouseSerializer


@api_view(['GET'])
def available_houses(request):
    """Returns only houses with no active batch."""
    houses = House.objects.filter(active_batch__isnull=True)
    return Response(HouseSerializer(houses, many=True).data)