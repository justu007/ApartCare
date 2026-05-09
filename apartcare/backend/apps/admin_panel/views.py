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
    
# class AdminDashboardAPIView(APIView):
#     permission_classes = [IsAuthenticated,IsAdmin] 

#     def get(self, request):
#         admin_community = request.user.community
        
#         if not admin_community:
#             return Response({"error": "You are not assigned to any community."}, status=400)

#         total_blocks = Block.objects.filter(community=admin_community).count()
#         total_flats = Flat.objects.filter(block__community=admin_community).count()
        
#         total_active_residents = User.objects.filter(
#             role='RESIDENT',
#             community=admin_community,
#             is_active=True
#         ).count()

#         total_active_staff = User.objects.filter(
#             role='STAFF',
#             community=admin_community,
#             is_active=True
#         ).count()

#         community_issues = Issue.objects.filter(creator__community=admin_community)

#         open_issues = community_issues.filter(status='Open').count()
#         assigned_issues = community_issues.filter(status='Assigned').count()
#         in_progress_issues = community_issues.filter(status='In-Progress').count()
#         resolved_issues = community_issues.filter(status='Resolved').count()


#         return Response({
#             "community_name": admin_community.name,
#             "statistics": {
#                 "total_blocks": total_blocks,
#                 "total_flats": total_flats,
#                 "total_active_residents": total_active_residents,
#                 "total_active_staff": total_active_staff
#             },
#             "issue_statistics": {
#                 "open": open_issues,
#                 "assigned": assigned_issues,
#                 "in_progress": in_progress_issues,
#                 "resolved": resolved_issues
#             }
#         })
    

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
            "upcoming_meetings": list(upcoming_meetings)
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