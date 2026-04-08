from django.urls import path
from .views import *
urlpatterns = [
    path('create-bills/', GenerateBillsAPIView.as_view()),
    path('resident/bills/', ResidentBillsListAPIView.as_view(), name='resident_bills_list'),
    path('resident/bills/create-order/', CreateRazorpayOrderAPIView.as_view(), name='create_razorpay_order'),
    path('resident/bills/verify-payment/', VerifyRazorpayPaymentAPIView.as_view(), name='verify_razorpay_payment'),
    path('gen_bills/', GeneratedBillsListAPIView.as_view(), name='admin_bills_list'),
 ]