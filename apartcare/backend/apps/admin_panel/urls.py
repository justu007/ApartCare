from django.urls import path
from .views import TestAdmin,AdminResidentListAPIView,AdminStaffListAPIView,AdminUpdateUserAPIView,AdminUpdateStaffProfileAPIView

urlpatterns = [
    # path('admin/create-user/', AdminCreateUserAPIView.as_view()),
    path('testadmin/', TestAdmin.as_view()),
    path('residentList/', AdminResidentListAPIView.as_view()),
    path('staffList/', AdminStaffListAPIView.as_view()),
    path("update-user-contact/<int:user_id>/",AdminUpdateUserAPIView.as_view()),
    path("update-staff-profile/<int:user_id>/",AdminUpdateStaffProfileAPIView.as_view())
    
]
