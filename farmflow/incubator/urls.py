from django.urls import path, include
from .incubatorsviews import IncubationBatchViewSet

urlpatterns = [
    path('incubation-batches/', IncubationBatchViewSet.as_view({'get': 'list', 'post': 'create'}), name='incubation-batch-list-create'),
    path('incubation-batches/<int:pk>/', IncubationBatchViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy', 'patch': 'partial_update'}), name='incubation-batch-detail')
]