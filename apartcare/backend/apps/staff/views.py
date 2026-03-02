from django.shortcuts import render
from apps.accounts.models import *
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class StaffDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        user = request.user
        profile = user.staff_profile

        return Response({
            "welcome_message": f"Hello, {user.name}",
            "community": user.community.name if user.community else "Not Assigned",
            "job_details": {
                "designation": profile.designation,
                "joining_date": profile.joining_date,
                "salary" : profile.monthly_salary,
                "status": profile.status
            },
            "assigned_tasks_today": 0
        })



