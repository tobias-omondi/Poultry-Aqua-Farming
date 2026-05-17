from django.urls import path
from . import views

urlpatterns = [
    path('costs/', views.CostListCreateView.as_view(), name='cost-list-create'),
    path('costs/<int:pk>/', views.CostDetailView.as_view(), name='cost-detail'),
    path('sales/', views.SaleListCreateView.as_view(), name='sale-list-create'),
    path('sales/<int:pk>/', views.SaleDetailView.as_view(), name='sale-detail'),
    path('summary/', views.farm_pl_summary, name='farm-pl-summary'),
    path('costs/by-category/', views.costs_by_category, name='costs-by-category'),
]