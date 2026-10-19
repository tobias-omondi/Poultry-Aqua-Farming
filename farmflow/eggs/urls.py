from django.urls import path, include
from .eggsviews import EggCollectionViewSet, EggSalesViewSet, egg_summary

urlpatterns = [
  path('collections/', EggCollectionViewSet.as_view({'get': 'list', 'post': 'create'}), name='egg-collection-list-create'),
  path('collections/<int:pk>/', EggCollectionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='egg-collection-detail'),
  path('sales/', EggSalesViewSet.as_view({'get': 'list', 'post': 'create'}), name='egg-sales-list-create'),
  path('sales/<int:pk>/', EggSalesViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='egg-sales-detail'),
  path('summary/', egg_summary, name='egg-summary')
]

