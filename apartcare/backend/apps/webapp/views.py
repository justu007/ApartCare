from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
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