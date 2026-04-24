from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsAdmin, IsResident
from .models import  Bill
from .serializers import BillSerializer
from django.db import transaction
from apps.apartment.models import Flat
from .models import Bill
from django.utils import timezone
from django.db import transaction as db_transaction
import razorpay
from django.conf import settings
from rest_framework.views import APIView
from apps.salary.models import Transaction
from .serializers import OccupiedFlatSerializer
from apps.admin_panel.pagination import CustomPagination
from datetime import datetime
import calendar
from decimal import Decimal
from apps.notification.models import Notification
from django.contrib.auth import get_user_model

class GenerateBillsAPIView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]

    def post(self, request):
        user = request.user


        data = request.data
        bill_type = data.get('bill_type')
        due_date = data.get('due_date')
        billing_month = data.get('billing_month')
        billing_year = data.get('billing_year')
        
        current_date = timezone.now()
        if billing_year > current_date.year or (billing_year == current_date.year and billing_month > current_date.month):
            return Response(
                {"error": "Invalid timeline. You cannot generate bills for future months."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            due_date_obj = datetime.strptime(due_date, '%Y-%m-%d').date()
            
            last_day_of_month = calendar.monthrange(billing_year, billing_month)[1]
            billing_period_end = datetime(billing_year, billing_month, last_day_of_month).date()

            if due_date_obj <= billing_period_end:
                return Response(
                    {"error": "Invalid Due Date: The due date must be in the month following the billing period (or later)."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response({"error": "Invalid date format provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        is_variable = data.get('is_variable', False) 
        flat_data = data.get('flat_data', []) 

        if not all([bill_type, due_date, billing_month, billing_year]):
            return Response({"error": "Missing required billing period fields."}, status=status.HTTP_400_BAD_REQUEST)

        bills_to_create = []
        skipped_count = 0

        if not is_variable:
            if bill_type == 'MAINTENANCE':
                fixed_amount  = user.community.maintenance_fee
                if not fixed_amount or fixed_amount <= 0:
                    return Response({"error": "Fixed amount is required for Maintenance bills."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                fixed_amount = data.get('amount')
                if not fixed_amount :
                    return Response({"error": "Amount is required for variable bills."}, status=status.HTTP_400_BAD_REQUEST) 
                
            occupied_flats = Flat.objects.filter(block__community=user.community, occupied=True)
            
            for flat in occupied_flats:
                if Bill.objects.filter(flat=flat, bill_type=bill_type, billing_month=billing_month, billing_year=billing_year).exists():
                    skipped_count += 1
                else:
                    bills_to_create.append(Bill(
                        flat=flat, bill_type=bill_type, amount=fixed_amount, total_amount=fixed_amount,
                        due_date=due_date, billing_month=billing_month, billing_year=billing_year
                    ))

        else:
            if not flat_data:
                return Response({"error": "Meter readings/amounts required for variable bills."}, status=status.HTTP_400_BAD_REQUEST)
            
            for item in flat_data:
                flat_id = item.get('flat_id')
                amount = item.get('amount')
                
                if flat_id and amount and float(amount) > 0:
                    try:
                        flat = Flat.objects.get(id=flat_id, block__community=user.community)
                        if Bill.objects.filter(flat=flat, bill_type=bill_type, billing_month=billing_month, billing_year=billing_year).exists():
                            skipped_count += 1
                        else:
                            bills_to_create.append(Bill(
                                flat=flat, bill_type=bill_type, amount=amount, total_amount=amount,
                                due_date=due_date, billing_month=billing_month, billing_year=billing_year
                            ))
                    except Flat.DoesNotExist:
                        continue 

        if not bills_to_create:
            if skipped_count > 0:
                return Response(
                    {"error": f"Bills for {billing_month}/{billing_year} have already been generated for the selected flat(s)."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                return Response(
                    {"error": "No valid flats found to generate bills."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        
        with transaction.atomic():
            Bill.objects.bulk_create(bills_to_create)

        User = get_user_model()
        notifications_to_create = []

        billed_flat_ids = [bill.flat.id for bill in bills_to_create]

        residents_to_notify = User.objects.filter(
            role='RESIDENT', 
            resident_profile__flat_id__in=billed_flat_ids
        )

        for resident in residents_to_notify:
            notifications_to_create.append(
                Notification(
                    user=resident,
                    notification_type='BILL',
                    title="New Bill Generated 📄",
                    message=f"A new {bill_type.title()} bill for {billing_month}/{billing_year} has been generated for your flat. Please check your dashboard."
                )
            )

        admin_user = request.user.community.admin
        if admin_user:
            notifications_to_create.append(
                Notification(
                    user=admin_user, 
                    notification_type='SYSTEM',
                    title=f"{bill_type.title()} Bills Generated",
                    message=f"Successfully generated {len(bills_to_create)} {bill_type.lower()} bills for {billing_month}/{billing_year}."
                )
            )


        if notifications_to_create:
            Notification.objects.bulk_create(notifications_to_create)

        
        success_msg = f"Successfully generated {len(bills_to_create)} {bill_type.lower()} bills."
        if skipped_count > 0:
            success_msg += f" (Skipped {skipped_count} flats that already had bills for this month)."

        return Response({
            "message": success_msg,
            "skipped": skipped_count
        }, status=status.HTTP_201_CREATED)
    


class ResidentBillsListAPIView(generics.ListAPIView):
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated,IsResident]

    def get_queryset(self):
        user = self.request.user
        
        if hasattr(user, 'resident_profile') and user.resident_profile.flat:
            resident_flat = user.resident_profile.flat
            return Bill.objects.filter(flat=resident_flat).order_by('-created_at')
        
        return Bill.objects.none()
    


razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))



class CreateRazorpayOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        bill_id = request.data.get('bill_id')
        try:
            bill = Bill.objects.get(
                id=bill_id, 
                flat=request.user.resident_profile.flat, 
                status__in=['PENDING', 'OVERDUE']
            )
        except Bill.DoesNotExist:
            return Response({"error": "Valid unpaid bill not found."}, status=status.HTTP_404_NOT_FOUND)


        amount_in_paise = int(bill.total_amount * 100)

        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"bill_receipt_{bill.id}",
            "payment_capture": 1 
        })

        return Response({
            "razorpay_order_id": razorpay_order['id'],
            "amount": amount_in_paise,
            "currency": "INR",
            "key": settings.RAZORPAY_KEY_ID,
            "name": request.user.name,
            "email": request.user.email,
        })
class VerifyRazorpayPaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        bill_id = data.get('bill_id')
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_signature = data.get('razorpay_signature')

        try:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })

            with db_transaction.atomic():
                bill = Bill.objects.get(id=bill_id)
                bill.status = 'PAID'
                bill.paid_date = timezone.now()
                bill.save()

                Transaction.objects.create(
                    payer=request.user,
                    payee=request.user.community.admin,
                    bill=bill,
                    amount=bill.total_amount,
                    purpose='BILL_PAYMENT',
                    payment_gateway='RAZORPAY',
                    status='SUCCESS'
                )

                admin_user = request.user.community.admin
                if admin_user:
                    Notification.objects.create(
                        user=admin_user,
                        notification_type='SYSTEM',
                        title="Bill Paid ✅",
                        message=f"{request.user.name} has paid the {bill.bill_type.lower()} bill for {bill.billing_month}/{bill.billing_year}."
                    )   
                    

            return Response({"message": "Payment verified and successful!"}, status=status.HTTP_200_OK)

        except razorpay.errors.SignatureVerificationError:
            return Response({"error": "Payment signature verification failed. Possible tampering."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


class GeneratedBillsListAPIView(generics.ListAPIView):
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'ADMIN':
            return Bill.objects.none()


        current_date = timezone.now().date()
        
        expired_bills = Bill.objects.filter(
            flat__block__community=user.community,
            status='PENDING',
            due_date__lt=current_date
        )

        bills_to_update = []
        for bill in expired_bills:
            bill.status = 'OVERDUE'
            bill.fine_amount = Decimal('150.00') 
            bill.total_amount = bill.amount + bill.fine_amount
            bills_to_update.append(bill)

        if bills_to_update:
            Bill.objects.bulk_update(bills_to_update, ['status', 'fine_amount', 'total_amount'])


        return Bill.objects.filter(
            flat__block__community=user.community
        ).order_by('-created_at')
    

class OccupiedFlatsListView(generics.ListAPIView):
    serializer_class = OccupiedFlatSerializer
    permission_classes = [IsAuthenticated]
    
    pagination_class = CustomPagination 

    def get_queryset(self):
        user = self.request.user
        
        return Flat.objects.filter(
            block__community=user.community,
            adminresident_profile__status='ACTIVE'
        ).distinct().order_by('block__name', 'name')