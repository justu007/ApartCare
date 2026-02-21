from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny ,IsAuthenticated
from apps.apartment.models import Community
from .serializers import CreateCommunityAdmin
from apps.accounts.permissions import IsSuperAdmin

class CreateCommunityAdminAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self,request):
        
        serializer = CreateCommunityAdmin(data = request.data)

        if serializer.is_valid():
            data = serializer.save()
            return Response(
                { "message" : "Community created successfully",
                  "community" :data['community'].name,
                   "admin": data['admin'].email
                 },
                 status=status.HTTP_201_CREATED
                )

        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    

class ReactivateCommunityView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin] 

    def patch(self, request, community_id):
        community = get_object_or_404(Community, id=community_id)
        
        community.is_active = True
        community.save()
        
        admin_user = community.admin
        admin_user.is_active = True
        admin_user.save()

        return Response({"message": "Community and Admin reactivated successfully."})