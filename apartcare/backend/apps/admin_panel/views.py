from django.shortcuts import render
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.response import Response
from apps.accounts.permissions import IsAdmin
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import User
from .models import StaffProfile,AdminResident_Profile
from .serializers import AdminResidentListSerializer,AdminStaffListSerializer,AdminUpdateUserInfo,AdminUpdateStaffProfile

# Create your views here.


class TestAdmin(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({
            "message": "Admin access working",
            "user": request.user.email,
            "role": request.user.role
        })

class AdminResidentListAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))

        start = (page - 1) * limit
        end = start + limit

        residents = User.objects.filter(
            role='RESIDENT'
        ).select_related(
            'resident_profile',
            'resident_profile__flat',
            'resident_profile__flat__block'
        )

        total_count = residents.count()

        paginated_residents = residents[start:end]

        serializer = AdminResidentListSerializer(
            paginated_residents,
            many=True
        )

        return Response({
            "total": total_count,
            "page": page,
            "limit": limit,
            "data": serializer.data
            
        })
    

class AdminStaffListAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))

        start = (page - 1) * limit
        end = start + limit

        staffs = User.objects.filter(
            role='STAFF'
        ).select_related(
            'staff_profile',
        )
        total_count = staffs.count()

        paginated_staff = staffs[start:end]

        serializer = AdminStaffListSerializer(
            paginated_staff,
            many=True
        )

        return Response({
            "total": total_count,
            "page": page,
            "limit": limit,
            "data": serializer.data
            
        })

class AdminUpdateUserAPIView(APIView):
    def put(self,request,user_id):
        try:
            user = User.objects.get(id = user_id)
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
            staffprofile = StaffProfile.objects.get(user__id=user_id)
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
        serializer = AdminStaffListSerializer(
            resident_profile,
            data = request.data,
            partial = True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message" : "resident profile updated successfully",
                 "data" : serializer.data}

            )
        return Response(serializer.errors,status=404)