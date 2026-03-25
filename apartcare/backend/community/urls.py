
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/admin/', include('apps.admin_panel.urls')),
    path('api/apartment/', include('apps.apartment.urls')),
    path('api/webapp/', include('apps.webapp.urls')),
    path('api/resident/', include('apps.resident.urls')),
    path('api/staff/', include('apps.staff.urls')),
    path('api/', include('apps.issue.urls'))

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)