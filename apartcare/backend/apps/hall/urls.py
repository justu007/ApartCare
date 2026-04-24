from django.urls import path

from .views import *

urlpatterns = [

    path('manage-venues/', ManageCommunityHallsAPIView.as_view(), name='manage-venues'),
    path('manage-venues/<int:hall_id>/', ManageCommunityHallDetailAPIView.as_view(), name='manage-venue-detail'),
    path('availability/', HallAvailabilityAPIView.as_view(), name='hall-availability'),
    path('resident/bookings/', ResidentHallAPIView.as_view(), name='resident-hall-booking'),
    path('bookings/manage/', AdminHallAPIView.as_view(), name='admin-hall-booking'),
    path('payment/initiate/', InitiateHallPaymentAPIView.as_view(), name='hall-payment-initiate'),
    path('payment/verify/', VerifyHallPaymentAPIView.as_view(), name='hall-payment-verify'),
]