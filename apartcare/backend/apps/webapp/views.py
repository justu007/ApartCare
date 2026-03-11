from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny ,IsAuthenticated
from apps.apartment.models import Community
from .serializers import *
from apps.accounts.permissions import IsSuperAdmin
from apps.admin_panel.serializers import CommunityDetailsSerializer
from rest_framework.generics import RetrieveUpdateAPIView,UpdateAPIView
from apps.accounts.models import User




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
    
class DeactivateCommunity(APIView):
    permission_classes = [IsAuthenticated,IsSuperAdmin]

    def delete(self,request,id):
        community = get_object_or_404(Community,id = id)
        community.is_active = False
        community.save()

        admin_user = community.admin
        admin_user.is_active = False
        admin_user.save()

        return Response({"message": "Community and Admin deactivated successfully."})
    
class ReactivateCommunityView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin] 

    def patch(self, request, id):
        community = get_object_or_404(Community, id=id)
        
        community.is_active = True
        community.save()
        
        admin_user = community.admin
        admin_user.is_active = True
        admin_user.save()

        return Response({"message": "Community and Admin reactivated successfully."})
    
class CommunityListView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        communities = Community.objects.select_related("admin")
        serializer = CommunityListSerializer(communities, many=True)
        return Response(serializer.data)
    

class CommunityUpdateView(UpdateAPIView):

    permission_classes = [IsAuthenticated, IsSuperAdmin]
    serializer_class = CommunityUpdateSerializer
    queryset = Community.objects.select_related("admin")
  