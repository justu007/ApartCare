from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsAdmin
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




class GenerateBillsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'ADMIN':
            return Response({"error": "Only Admins can generate community bills."}, status=status.HTTP_403_FORBIDDEN)

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


        is_variable = data.get('is_variable', False) 
        fixed_amount = data.get('amount') 
        flat_data = data.get('flat_data', []) 

        if not all([bill_type, due_date, billing_month, billing_year]):
            return Response({"error": "Missing required billing period fields."}, status=status.HTTP_400_BAD_REQUEST)

        bills_to_create = []
        skipped_count = 0

        if not is_variable:
            if not fixed_amount:
                return Response({"error": "Fixed amount is required for Maintenance bills."}, status=status.HTTP_400_BAD_REQUEST)
                
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

        if bills_to_create:
            with transaction.atomic():
                Bill.objects.bulk_create(bills_to_create)

        return Response({
            "message": f"Successfully generated {len(bills_to_create)} {bill_type.lower()} bills.",
            "skipped": skipped_count
        }, status=status.HTTP_201_CREATED)


class ResidentBillsListAPIView(generics.ListAPIView):
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated]

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
            bill = Bill.objects.get(id=bill_id, flat=request.user.resident_profile.flat, status='PENDING')
        except Bill.DoesNotExist:
            return Response({"error": "Valid pending bill not found."}, status=status.HTTP_404_NOT_FOUND)

        # Razorpay expects amount in PAISE (multiply by 100)
        amount_in_paise = int(bill.total_amount * 100)

        # Create the Order on Razorpay's servers
        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"bill_receipt_{bill.id}",
            "payment_capture": 1 # Auto-capture
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
            # 1. Verify the signature securely
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })

            # 2. Update the Database
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

            return Response({"message": "Payment verified and successful!"}, status=status.HTTP_200_OK)

        except razorpay.errors.SignatureVerificationError:
            return Response({"error": "Payment signature verification failed. Possible tampering."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class GeneratedBillsListAPIView(generics.ListAPIView):

    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated,IsAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'ADMIN':
            return Bill.objects.none()
        return Bill.objects.filter(
            flat__block__community=user.community
        ).order_by('-created_at')
    
    