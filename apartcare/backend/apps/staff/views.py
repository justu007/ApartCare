
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.issue.models import Issue
from apps.accounts.permissions import IsStaff
class StaffDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated,IsStaff]

    def get(self, request):
        user = request.user
        community_name = user.community.name if user.community else "Not Assigned"

        if hasattr(user, 'staff_profile'):
            profile = user.staff_profile
            designation = profile.designation
            salary = profile.monthly_salary
            joining_date = str(profile.joining_date) 
            status = profile.status
        else:
            designation = "Unassigned"
            salary = 0
            joining_date = "N/A"
            status = "PENDING"

        assigned_tasks = Issue.objects.filter(assigned_staff=user)

        assigned_count = assigned_tasks.filter(status='Assigned').count()
        in_progress_count = assigned_tasks.filter(status='In-Progress').count()
        resolved_count = assigned_tasks.filter(status='Resolved').count()

        return Response({
            "welcome_message": f"Hello, {user.name}!",
            "community": community_name,
            "job_details": {
                "designation": designation,
                "salary": salary,
                "joining_date": joining_date,
                "status": status
            },
            "issue_statistics": {
                "assigned": assigned_count,
                "in_progress": in_progress_count,
                "resolved": resolved_count
            }
        })