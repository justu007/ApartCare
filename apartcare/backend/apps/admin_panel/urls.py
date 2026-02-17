from django.urls import path
from .views import *

urlpatterns = [
    # path('admin/create-user/', AdminCreateUserAPIView.as_view()),
    path('testadmin/', TestAdmin.as_view()),
    path('residents/', AdminResidentListAPIView.as_view()),
    path('staffs/', AdminStaffListAPIView.as_view()),
    path("residents/<int:user_id>/",AdminUpdateUserAPIView.as_view()),
    path("user/<int:user_id>/update/",AdminUpdateUserAPIView.as_view()),
    path("staffs/<int:user_id>/update/",AdminUpdateStaffProfileAPIView.as_view()),
    path("residents/<int:user_id>/update/",AdminUpdateResidentProfileAPIView.as_view()),
    
]
