from django.urls import path
from . import views

urlpatterns = [
    path('batches/', views.BatchListCreateView.as_view(), name='batch-list-create'),
    path('batches/<int:pk>/', views.BatchDetailView.as_view(), name='batch-detail'),
    path('batches/<int:pk>/summary/', views.batch_summary, name='batch-summary'),
    path('batches/<int:batch_id>/logs/', views.DailyLogListCreateView.as_view(), name='dailylog-list-create'),
    path('logs/<int:pk>/', views.DailyLogDetailView.as_view(), name='dailylog-detail'),
    path('harvests/', views.HarvestCreateView.as_view(), name='harvest-create'),
    path('harvests/<int:pk>/', views.HarvestDetailView.as_view(), name='harvest-detail'),
]