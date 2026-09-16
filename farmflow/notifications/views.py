from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    serializer_class = NotificationSerializer


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    serializer_class = NotificationSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """Marks all of the user's unread notifications as read."""
    updated = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'updated': updated})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    """Returns the count of the user's unread notifications."""
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({'unread_count': count})