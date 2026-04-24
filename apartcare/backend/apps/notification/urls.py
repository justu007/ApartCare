from django.urls import path
from .views import *

urlpatterns = [
    path('announcements/', AnnouncementAPIView.as_view(), name='announcements'),
    path('my-alerts/', NotificationListAPIView.as_view(), name='my-notifications'),
    path('my-alerts/mark-read/', MarkNotificationReadAPIView.as_view(), name='mark-notification-read'),
]