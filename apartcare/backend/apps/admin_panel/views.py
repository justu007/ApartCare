from django.shortcuts import render
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.response import Response
from apps.accounts.permissions import IsAdmin
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import User
from .models import StaffProfile,AdminResident_Profile
from .serializers import *
from .pagination import CustomPagination


# Create your views here.


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
            role='RESIDENT'
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
            role='STAFF'
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

                {"error" : "User not found"},

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
            resident_profile = AdminResident_Profile.objects.get(user__id=user_id)
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