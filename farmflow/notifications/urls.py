from django.urls import path
from .views import (
    NotificationListCreateView,
    NotificationDetailView,
    mark_all_read,
    unread_count,
)

urlpatterns = [
    path('', NotificationListCreateView.as_view(), name='notification-list-create'),
    path('<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('mark-all-read/', mark_all_read, name='notification-mark-all-read'),
    path('unread-count/', unread_count, name='notification-unread-count'),
]