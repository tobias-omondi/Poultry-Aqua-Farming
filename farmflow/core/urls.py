from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/chickens/', include('chickens.urls')),
    path('api/financials/', include('financials.urls')),
    path('api/housing/', include('housing.urls')),
    path('api/inventory/', include('inventory.urls')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)