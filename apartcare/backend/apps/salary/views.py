from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction as db_transaction
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import SalaryPayment, Transaction
from .serializers import SalaryPaymentSerializer
from apps.accounts.permissions import IsAdmin, IsStaff 
from django.db.models import Q
from .serializers import TransactionSerializer

User = get_user_model()

class AdminPaySalaryAPIView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]

    def post(self, request):
        if request.user.role != 'ADMIN':
            return Response({"error": "Only Admins can process salaries."}, status=status.HTTP_403_FORBIDDEN)

        staff_id = request.data.get('staff_id')
        month = request.data.get('month')
        year = request.data.get('year')
        transaction_ref = request.data.get('transaction_id', 'MANUAL_CASH/UPI')

        if not all([staff_id, month, year]):
            return Response({"error": "Missing required fields: staff, month, or year."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            staff = User.objects.get(id=staff_id, role='STAFF', community=request.user.community)
        except User.DoesNotExist:
            return Response({"error": "Valid staff member not found in your community."}, status=status.HTTP_404_NOT_FOUND)

        if not hasattr(staff, 'staff_profile'):
            return Response({"error": "Staff profile missing. Cannot determine salary amount."}, status=status.HTTP_400_BAD_REQUEST)
        
        amount = staff.staff_profile.monthly_salary

        if SalaryPayment.objects.filter(staff=staff, month=month, year=year).exists():
            return Response({"error": f"Salary for {month}/{year} is already logged for {staff.name}."}, status=status.HTTP_400_BAD_REQUEST)

        with db_transaction.atomic():
            salary_payment = SalaryPayment.objects.create(
                staff= staff,
                month=month,
                year=year,
                amount=amount,
                status='RECEIVED', 
                transaction_id=transaction_ref,
                paid_at=timezone.now()
            )

            Transaction.objects.create(
                payer=request.user,
                payee=staff,
                salary=salary_payment,
                amount=amount,
                purpose='SALARY_PAYMENT',
                payment_gateway='MANUAL_LOG',
                status='SUCCESS'
            )

        return Response({"message": f"Successfully processed ₹{amount} salary for {staff.name}."}, status=status.HTTP_201_CREATED)


class StaffSalaryListAPIView(generics.ListAPIView):
    serializer_class = SalaryPaymentSerializer
    permission_classes = [IsAuthenticated,IsStaff]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'STAFF':
            return SalaryPayment.objects.none()
        
        return SalaryPayment.objects.filter(staff=user).order_by('-year', '-month')
    



class TransactionLedgerAPIView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated,IsAdmin]

    def get_queryset(self):
        user = self.request.user
        
        if user.role != 'ADMIN':
            return Transaction.objects.none()

        return Transaction.objects.filter(
            Q(payer__community=user.community) | Q(payee__community=user.community)
        ).order_by('-created_at')