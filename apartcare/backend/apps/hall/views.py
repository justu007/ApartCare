from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from  .models import CommunityHall, HallBooking,HallImage
from apps.accounts.permissions import IsResident, IsAdmin
from apps.notification.models import Notification
import razorpay
from django.conf import settings
from django.utils import timezone
from django.db import transaction as db_transaction

from .models import HallBooking
from apps.salary.models import Transaction

from .serializers import (
    CommunityHallSerializer, 
    HallBookingSerializer, 
    AdminHallUpdateSerializer
)


class ManageCommunityHallsAPIView(APIView):
    permission_classes = [IsAuthenticated]  
    parser_classes = [MultiPartParser, FormParser] 

    def get(self, request):
        if getattr(request.user, 'role', '') == 'ADMIN':
            halls = CommunityHall.objects.filter(community=request.user.community).order_by('-created_at')
        else:
            halls = CommunityHall.objects.filter(community=request.user.community, is_active=True).order_by('-created_at')
            
        serializer = CommunityHallSerializer(halls, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if getattr(request.user, 'role', '') != 'ADMIN':
            return Response({"error": "Only admins can add new halls."}, status=status.HTTP_403_FORBIDDEN)

        serializer = CommunityHallSerializer(data=request.data)
        
        if serializer.is_valid():
            hall = serializer.save(community=request.user.community, is_active=True)
            
            images_data = request.FILES.getlist('images') 
            for image_data in images_data:
                HallImage.objects.create(hall=hall, image=image_data)
                
            response_serializer = CommunityHallSerializer(hall)
            return Response({"message": "Hall added successfully!", "hall": response_serializer.data}, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class ManageCommunityHallDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request, hall_id):
        if getattr(request.user, 'role', '') != 'ADMIN':
            return Response({"error": "Only admins can edit halls."}, status=status.HTTP_403_FORBIDDEN)

        try:
            hall = CommunityHall.objects.get(id=hall_id, community=request.user.community)
        except CommunityHall.DoesNotExist:
            return Response({"error": "Hall not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CommunityHallSerializer(hall, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            updated_hall = serializer.save()
            
            images_data = request.FILES.getlist('images') 
            for image_data in images_data:
                HallImage.objects.create(hall=updated_hall, image=image_data)
                
            return Response({"message": "Hall updated successfully!", "hall": serializer.data}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HallAvailabilityAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        community = request.user.community
        hall_id = request.query_params.get('hall_id')
        month = request.query_params.get('month', datetime.now().month)
        year = request.query_params.get('year', datetime.now().year)

        if not hall_id:
            return Response({"error": "Please provide a hall_id in the URL."}, status=status.HTTP_400_BAD_REQUEST)

        approved_bookings = HallBooking.objects.filter(
            community=community,
            hall_id=hall_id,
            status='APPROVED',
            booking_date__month=month,
            booking_date__year=year
        )


        serializer = HallBookingSerializer(approved_bookings, many=True)
        return Response({"booked_slots": serializer.data}, status=status.HTTP_200_OK)



# class ResidentHallAPIView(APIView):
#     permission_classes = [IsAuthenticated, IsResident]

#     def get(self, request):
#         my_bookings = HallBooking.objects.filter(resident=request.user).order_by('-created_at')
#         serializer = HallBookingSerializer(my_bookings, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def post(self, request):
#         serializer = HallBookingSerializer(data=request.data, context={'request': request})
        
#         if serializer.is_valid():
#             serializer.save(
#                 resident=request.user, 
#                 community=request.user.community, 
#                 status='PENDING'
#             )

#             hall_name = request.data.get('hall_name', 'a hall')
#             booking_date = request.data.get('booking_date', 'a date')
#             Notification.objects.create(
#                 user = request.user.community.admin,
#                 notification_type='Hall Request',
#                 title="New Hall Booking Request",
#                 message=f"A new booking request has been submitted for {hall_name} on {booking_date}."
#             )
#             return Response({"message": "Booking request submitted successfully! Pending admin approval."}, status=status.HTTP_201_CREATED)
            

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResidentHallAPIView(APIView):
    permission_classes = [IsAuthenticated, IsResident]

    def get(self, request):
        my_bookings = HallBooking.objects.filter(resident=request.user).order_by('-created_at')
        
        serializer = HallBookingSerializer(my_bookings, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = HallBookingSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            
            booking = serializer.save(
                resident=request.user, 
                community=request.user.community, 
                status='PENDING'
            )

            Notification.objects.create(
                user=request.user.community.admin,
                notification_type='Hall Request',
                title="New Hall Booking Request",
                message=f"A new booking request has been submitted for {booking.hall.name} on {booking.booking_date}."
            )
            
            return Response({"message": "Booking request submitted successfully! Pending admin approval."}, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminHallAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        all_bookings = HallBooking.objects.filter(community=request.user.community).order_by('-created_at')
        serializer = HallBookingSerializer(all_bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        booking_id = request.data.get('booking_id')
        
        try:
            booking = HallBooking.objects.get(id=booking_id, community=request.user.community)
        except HallBooking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminHallUpdateSerializer(booking, data=request.data, partial=True)
        
        if serializer.is_valid():
            booking = serializer.save()

            Notification.objects.create(
                user=booking.resident,
                notification_type='BOOKING',
                title=f"Hall Booking {booking.status.title()}",
                message=f"Your booking request for {booking.hall.name} on {booking.booking_date} has been {booking.status.lower()} by the Admin."
            )
            return Response({"message": f"Booking {booking.status.lower()} successfully!"}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class InitiateHallPaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        try:
            booking = HallBooking.objects.get(
                id=booking_id, 
                resident=request.user, 
                status='APPROVED', 
                is_paid=False
            )
        except HallBooking.DoesNotExist:
            return Response({"error": "Valid unpaid booking not found."}, status=status.HTTP_404_NOT_FOUND)

        amount_in_paise = int(booking.total_amount * 100)

        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"hall_receipt_{booking.id}",
            "payment_capture": 1 
        })

        return Response({
            "razorpay_order_id": razorpay_order['id'],
            "amount": amount_in_paise,
            "currency": "INR",
            "key": settings.RAZORPAY_KEY_ID,
            "name": request.user.name,
            "email": getattr(request.user, 'email', ''),
        })

class VerifyHallPaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        booking_id = data.get('booking_id')
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
                booking = HallBooking.objects.get(id=booking_id)
                booking.is_paid = True
                booking.save()

                Transaction.objects.create(
                    payer=request.user,
                    payee=request.user.community.admin,
                    hall_booking=booking,         
                    amount=booking.total_amount,
                    purpose='HALL_BOOKING',       
                    payment_gateway='RAZORPAY',
                    status='SUCCESS'
                )

            return Response({"message": "Payment verified and successful!"}, status=status.HTTP_200_OK)

        except razorpay.errors.SignatureVerificationError:
            return Response({"error": "Payment signature verification failed."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)