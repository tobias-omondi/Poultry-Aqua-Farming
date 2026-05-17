from django.urls import path
from . import views

urlpatterns = [
    path('suppliers/', views.SupplierListCreateView.as_view(), name='supplier-list-create'),
    path('suppliers/<int:pk>/', views.SupplierDetailView.as_view(), name='supplier-detail'),
    path('feed/', views.FeedStockListCreateView.as_view(), name='feed-list-create'),
    path('feed/<int:pk>/', views.FeedStockDetailView.as_view(), name='feed-detail'),
    path('medications/', views.MedicationListCreateView.as_view(), name='medication-list-create'),
    path('medications/<int:pk>/', views.MedicationDetailView.as_view(), name='medication-detail'),
    path('purchase-orders/', views.PurchaseOrderListCreateView.as_view(), name='po-list-create'),
    path('purchase-orders/<int:pk>/', views.PurchaseOrderDetailView.as_view(), name='po-detail'),
    path('price-history/', views.PriceHistoryListView.as_view(), name='price-history'),
    path('alerts/', views.low_stock_alerts, name='low-stock-alerts'),
]