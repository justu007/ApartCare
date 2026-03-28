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

from django.conf import settings

# Create your views here.
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
    
class AdminDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin] 

    def get(self, request):
        admin_community = request.user.community
        
        if not admin_community:
            return Response({"error": "You are not assigned to any community."}, status=400)

        total_blocks = Block.objects.filter(community=admin_community).count()
        total_flats = Flat.objects.filter(block__community=admin_community).count()
        
        total_active_residents = User.objects.filter(
            role='RESIDENT',
            community=admin_community,
            is_active=True
        ).count()

        total_active_staff = User.objects.filter(
            role='STAFF',
            community=admin_community,
            is_active=True
        ).count()

        community_issues = Issue.objects.filter(creator__community=admin_community)

        open_issues = community_issues.filter(status='Open').count()
        assigned_issues = community_issues.filter(status='Assigned').count()
        in_progress_issues = community_issues.filter(status='In-Progress').count()
        resolved_issues = community_issues.filter(status='Resolved').count()


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
            }
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


