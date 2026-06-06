from django.urls import path
from .views import MeetingAPIView ,UploadAttendanceCSVAPIView


urlpatterns = [

    path('meetings_list/', MeetingAPIView.as_view(), name='meeting-list-create'),
    path('<int:meeting_id>/upload-attendance/', UploadAttendanceCSVAPIView.as_view(), name='meeting-upload-attendance'),
]