from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('refresh/', views.refresh_view, name='refresh'),
    path('me/', views.me_view, name='me'),
    path('verify/', TokenVerifyView.as_view(), name='verify'),
    path('cookies/consent/', views.cookie_consent_view, name='cookie-consent'),
    path('cookies/status/', views.cookie_consent_status, name='cookie-status'),
]