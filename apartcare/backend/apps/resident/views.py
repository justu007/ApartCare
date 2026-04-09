from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.issue.models import Issue
from django.db.models import Sum
from apps.bills.models import Bill
from apps.accounts.permissions import IsResident
class ResidentDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated,IsResident]

    def get(self, request):
        user = request.user
        community_name = user.community.name if user.community else "Not Assigned"
        profile = None

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

        if profile and profile.flat:
            my_bills = Bill.objects.filter(flat=profile.flat)
            
            pending_amount = my_bills.filter(status='PENDING').aggregate(Sum('total_amount'))['total_amount__sum'] or 0.00
            overdue_amount = my_bills.filter(status='OVERDUE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0.00
            paid_amount = my_bills.filter(status='PAID').aggregate(Sum('total_amount'))['total_amount__sum'] or 0.00
            
            pending_count = my_bills.filter(status='PENDING').count()
            overdue_count = my_bills.filter(status='OVERDUE').count()
        else:
            pending_amount = overdue_amount = paid_amount = 0.00
            pending_count = overdue_count = 0

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
            },
            "bill_statistics": {
                "pending_amount": pending_amount,
                "overdue_amount": overdue_amount,
                "paid_amount": paid_amount,
                "pending_count": pending_count,
                "overdue_count": overdue_count
            }
        })