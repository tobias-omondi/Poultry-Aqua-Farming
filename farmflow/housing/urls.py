from django.urls import path
from . import views

urlpatterns = [
    path('', views.HouseListCreateView.as_view(), name='house-list-create'),
    path('<int:pk>/', views.HouseDetailView.as_view(), name='house-detail'),
    path('available/', views.available_houses, name='available-houses'),
]