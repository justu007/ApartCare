from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


# Create your views here.
class ResidentDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        user = request.user
        profile = user.resident_profile
        
       
        return Response({
            "welcome_message": f"Welcome back, {user.name}!",
            "community": user.community.name if user.community else "Not Assigned",
            "residence_details": {
                "block": profile.flat.block.name if profile.flat else "N/A",
                "flat": profile.flat.name if profile.flat else "N/A",
            },
            "status": profile.status,
        })



