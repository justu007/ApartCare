from django.urls import path
from .views import MeetingAPIView 

urlpatterns = [

    path('meetings_list/', MeetingAPIView.as_view(), name='meeting-list-create'),
]