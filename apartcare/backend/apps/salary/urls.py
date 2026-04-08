from django.urls import path
from .views import *
urlpatterns = [
    path('salaries/pay/', AdminPaySalaryAPIView.as_view(), name='admin_pay_salary'),
    path('view_salaries/', StaffSalaryListAPIView.as_view(), name='staff_salaries_list'),
    path('admin/ledger/', TransactionLedgerAPIView.as_view(), name='admin_transaction_ledger'),

]