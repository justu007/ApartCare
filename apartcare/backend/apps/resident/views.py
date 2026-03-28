from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.issue.models import Issue

class ResidentDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        community_name = user.community.name if user.community else "Not Assigned"

        try:
            profile = user.resident_profile
            block_name = profile.flat.block.name if profile.flat else "N/A"
            flat_name = profile.flat.name if profile.flat else "N/A"
            status = profile.status
        except Exception:
            block_name = "N/A"
            flat_name = "N/A"
            status = "INACTIVE"


        my_issues = Issue.objects.filter(creator=user)

        open_count = my_issues.filter(status='Open').count()
        assigned_count = my_issues.filter(status='Assigned').count()
        in_progress_count = my_issues.filter(status='In-Progress').count()
        resolved_count = my_issues.filter(status='Resolved').count()

        return Response({
            "welcome_message": f"Welcome back, {user.name}!",
            "community": community_name,
            "residence_details": {
                "block": block_name,
                "flat": flat_name
            },
            "status": status,
            "issue_statistics": {
                "open": open_count,
                "assigned": assigned_count,
                "in_progress": in_progress_count,
                "resolved": resolved_count
            }
        })



