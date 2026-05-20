from django.shortcuts import render
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.response import Response
from apps.accounts.permissions import IsAdmin
from rest_framework.permissions import IsAuthenticated,AllowAny
from .models import StaffProfile,AdminResident_Profile
from .serializers import *
from .pagination import CustomPagination
from rest_framework import status
from apps.issue.models import Issue,IssueImage
from rest_framework import generics
from .models import Flat
from rest_framework.pagination import PageNumberPagination
from django.conf import settings
from django.db.models import Sum
from apps.bills.models import Bill
from apps.salary.models import SalaryPayment,Transaction
from apps.notification.models import Announcement 
from apps.meeting.models import Meeting  
from apps.apartment.models import Block
from .serializers import CommunityDetailsSerializer
from django.utils.timezone import now
from dateutil.relativedelta import relativedelta
from apps.hall.models import HallBooking 
from django.db.models import Count, Q, Sum
from apps.accounts.models import User
from django.contrib.auth import get_user_model


User = get_user_model()

class TestAdmin(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({
            "message": "Admin access working",
            "user": request.user.email,
            "role": request.user.role,
            "community": request.user.community.id if request.user.community else None
        })

class AdminResidentListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        residents = User.objects.filter(
            role='RESIDENT',
            community=request.user.community 
        ).select_related(
            'resident_profile',
            'resident_profile__flat',
            'resident_profile__flat__block'
        )

        paginator = CustomPagination()
        
        paginated_residents = paginator.paginate_queryset(residents, request)

        serializer = AdminResidentListSerializer(
            paginated_residents,
            many=True
        )

        return paginator.get_paginated_response(serializer.data)


class AdminStaffListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        staffs = User.objects.filter(
            role='STAFF',
            community=request.user.community
        ).select_related(
            'staff_profile',
        )

        paginator = CustomPagination()
        
        paginated_staff = paginator.paginate_queryset(staffs, request)

        serializer = AdminStaffListSerializer(
            paginated_staff,
            many=True
        )

        return paginator.get_paginated_response(serializer.data)
    


class AdminUpdateUserAPIView(APIView):

    def put(self,request,user_id):

        try:

            user = User.objects.get(id=user_id, community=request.user.community)

        except User.DoesNotExist:

            return Response(

                {"error" : "NOt authorised to update this User or the User is not exists"},

                status=404

            )

        serializer = AdminUpdateUserInfo(

            user,

            data=request.data,

            partial = True

        )

        if serializer.is_valid():

            serializer.save()

            return Response({

                "message" : "user details updated successfully",

                "data" : serializer.data

            })

        return Response(serializer.errors,status=400)

    

class AdminUpdateStaffProfileAPIView(APIView):
    def put(self,request,user_id):
        try:
            staffprofile = StaffProfile.objects.get(user__id=user_id, 
            user__community=request.user.community)
        except StaffProfile.DoesNotExist:
            return Response(
                {
                "error":"staff profile doesnt exists"
                },status=404
            )
        serializer = AdminUpdateStaffProfile(
            staffprofile,
            data = request.data,
            partial = True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                
                {"message":"staff details updated successfully",
                 "data" : serializer.data
                }
            )
        return Response(serializer.errors,status=400)
    

class AdminUpdateResidentProfileAPIView(APIView):
    def put (self,request,user_id):
        try:
            resident_profile = AdminResident_Profile.objects.get(user__id=user_id,user__community=request.user.community)
        except AdminResident_Profile.DoesNotExist:
            return Response(
                {"error" : "REsidnt profile doesnt exists"},status=404
            )
        serializer = AdminUpdateResidentProfile(
            resident_profile,
            data = request.data,
            partial = True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message" : "flat assigned successfully",
                 "data" : serializer.data}

            )
        return Response(serializer.errors,status=404)


class StaffPerformanceAPIView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]

    def get(self, request):

        community = request.user.managed_community 


        return Response(performance_data)

class AdminPaymentReportAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin] 

    def get(self, request):
        community = request.user.community

        queryset = Bill.objects.filter(
            flat__block__community=community
        ).select_related('flat', 'flat__block')

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        payment_status = request.query_params.get('status')

        if start_date and end_date:
            queryset = queryset.filter(created_at__date__range=[start_date, end_date])

        if payment_status and payment_status != 'ALL':
            queryset = queryset.filter(status=payment_status)

        total_amount = queryset.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_paid = queryset.filter(status='PAID').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_pending = queryset.filter(status='PENDING').aggregate(Sum('total_amount'))['total_amount__sum'] or 0

        transactions = []
        for bill in queryset.order_by('-created_at'):
            flat_name = f"{bill.flat.block.name} - {bill.flat.name}" if bill.flat and bill.flat.block else "N/A"

            active_profile = bill.flat.adminresident_profile_set.filter(status="ACTIVE").first()
            if active_profile and active_profile.user:
                active_resident = active_profile.user.name
            else:
                active_resident = "Unoccupied"

            transactions.append({
                "id": bill.id,
                "resident_name": active_resident,
                "flat_number": flat_name,
                "amount": bill.total_amount,
                "status": bill.status,
                "bill_type": bill.get_bill_type_display(),
                "date": bill.created_at.strftime('%Y-%m-%d'),
            })

        return Response({
            "summary": {
                "total_queried": total_amount,
                "total_paid": total_paid,
                "total_pending": total_pending,
                "transaction_count": queryset.count()
            },
            "transactions": transactions
        })




class AdminDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin] 

    def get(self, request):
        admin_community = request.user.community
        

        community_bookings = HallBooking.objects.filter(hall__community=admin_community)
        pending_bookings = community_bookings.filter(status__iexact='PENDING').count()
        confirmed_bookings = community_bookings.filter(status__in=['APPROVED', 'Approved']).count()

        if not admin_community:
            return Response({"error": "You are not assigned to any community."}, status=400)

        total_blocks = Block.objects.filter(community=admin_community).count()
        total_flats = Flat.objects.filter(block__community=admin_community).count()
        
        total_active_residents = User.objects.filter(
            role='RESIDENT', community=admin_community, is_active=True
        ).count()

        total_active_staff = User.objects.filter(
            role='STAFF', community=admin_community, is_active=True
        ).count()

        community_issues = Issue.objects.filter(creator__community=admin_community)
        open_issues = community_issues.filter(status='Open').count()
        assigned_issues = community_issues.filter(status='Assigned').count()
        in_progress_issues = community_issues.filter(status='In-Progress').count()
        resolved_issues = community_issues.filter(status='Resolved').count()

        community_bills = Bill.objects.filter(flat__block__community=admin_community)
        # community_bills = Bill.objects.filter(
        #     flat__block__community=community
        # ).select_related(
        #     'flat', 'flat__block'
        # ).prefetch_related(
        #     'flat__adminresident_profile_set', 'flat__adminresident_profile_set__user'
        # )
        
        total_revenue = community_bills.filter(status='PAID').aggregate(Sum('total_amount'))['total_amount__sum'] or 0.00
        
        pending_revenue = community_bills.exclude(status='PAID').aggregate(Sum('total_amount'))['total_amount__sum'] or 0.00
        
        overdue_bills_count = community_bills.filter(status='OVERDUE').count()

        total_expenses = Transaction.objects.filter(
            payer=request.user, 
            status='SUCCESS'
        ).aggregate(Sum('amount'))['amount__sum'] or 0.00


        chart_data_finance = []
        for i in range(5, -1, -1):
            target_month = now() - relativedelta(months=i)
            month_revenue = community_bills.filter(
                status='PAID', 
                created_at__month=target_month.month, 
                created_at__year=target_month.year
            ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            
            month_expenses = Transaction.objects.filter(
                payer=request.user, 
                status='SUCCESS', 
                created_at__month=target_month.month, 
                created_at__year=target_month.year
            ).aggregate(Sum('amount'))['amount__sum'] or 0


            chart_data_finance.append({
                "month": target_month.strftime("%b"),
                "revenue": month_revenue,
                "expenses": month_expenses
            })

        recent_announcements = Announcement.objects.filter(community=admin_community).order_by('-created_at')[:3].values('id', 'title', 'created_at')
        upcoming_meetings = Meeting.objects.filter(community=admin_community, meeting_time__gte=now()).order_by('meeting_time')[:3].values('id', 'title', 'meeting_time')
        
        staff_members = User.objects.filter(
            role='STAFF', 
            community=admin_community
        ).annotate(
            total_assigned=Count('assigned_issues'),
            resolved_count=Count('assigned_issues', filter=Q(assigned_issues__status='Closed')),
            in_progress_count=Count('assigned_issues', filter=Q(assigned_issues__status='In-Progress'))
        )

        performance_data = []
        for staff in staff_members:
            completion_rate = 0
            if staff.total_assigned > 0:
                completion_rate = round((staff.resolved_count / staff.total_assigned) * 100)

            performance_data.append({
                "id": staff.id,
                "name": staff.name, 
                "total_issues": staff.total_assigned,
                "resolved": staff.resolved_count,
                "in_progress": staff.in_progress_count,
                "completion_rate": completion_rate
            })
   

        return Response({
            "community_name": admin_community.name,
            "statistics": {
                "total_blocks": total_blocks,
                "total_flats": total_flats,
                "total_active_residents": total_active_residents,
                "total_active_staff": total_active_staff
            },
            "issue_statistics": {
                "open": open_issues,
                "assigned": assigned_issues,
                "in_progress": in_progress_issues,
                "resolved": resolved_issues
            },
            "finance_statistics": {
                "total_revenue": total_revenue,
                "pending_revenue": pending_revenue,
                "total_expenses": total_expenses,
                "overdue_bills": overdue_bills_count
            },
            "booking_statistics": {
                "pending": pending_bookings,
                "confirmed": confirmed_bookings
            },

            "chart_data_finance": chart_data_finance,
            "recent_announcements": list(recent_announcements),
            "upcoming_meetings": list(upcoming_meetings),
            "performance_data": performance_data,

        })


class AdminCommunityDetailsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        admin_community = request.user.community
        
        if not admin_community:
            return Response(
                {"error": "You are not assigned to any community."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CommunityDetailsSerializer(admin_community)
        return Response(serializer.data, status=status.HTTP_200_OK)



class AdminForceResetPasswordAPIView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]

    def post(self, request, pk):
        if request.user.role != 'ADMIN':
            return Response({"error": "Only admins can perform this action."}, status=status.HTTP_403_FORBIDDEN)

        try:
            user_to_reset = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminForceResetSerializer(data=request.data)
        if serializer.is_valid():
            user_to_reset.set_password(serializer.validated_data['new_password'])
            user_to_reset.save()
            return Response({"message": f"Password for {user_to_reset.email} has been reset."}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class FlatPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class OccupiedFlatsListAPIView(generics.ListAPIView):
    serializer_class = OccupiedFlatSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = FlatPagination 
    def get_queryset(self):
        return Flat.objects.filter(
            block__community = self.request.user.community, 
            occupied=True
        ).order_by('block__name', 'name')