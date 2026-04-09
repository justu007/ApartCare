
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.issue.models import Issue
from apps.accounts.permissions import IsStaff
from django.db.models import Sum
from django.utils import timezone
from apps.salary.models import SalaryPayment, Transaction
class StaffDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request):
        user = request.user
        community_name = user.community.name if user.community else "Not Assigned"

        if hasattr(user, 'staff_profile'):
            profile = user.staff_profile
            designation = profile.designation
            salary = float(profile.monthly_salary) 
            joining_date = str(profile.joining_date) 
            status = profile.status
        else:
            designation = "Unassigned"
            salary = 0.00
            joining_date = "N/A"
            status = "PENDING"

        assigned_tasks = Issue.objects.filter(assigned_staff=user)
        assigned_count = assigned_tasks.filter(status='Assigned').count()
        in_progress_count = assigned_tasks.filter(status='In-Progress').count()
        resolved_count = assigned_tasks.filter(status='Resolved').count()

        now = timezone.now()
        
        paid_this_month = Transaction.objects.filter(
            payee=user,
            status='SUCCESS',
            created_at__year=now.year,
            created_at__month=now.month
        ).aggregate(Sum('amount'))['amount__sum'] or 0.00
        
        paid_this_month = float(paid_this_month)
        pending_salary = max(0.00, salary - paid_this_month)

        total_paid_all_time = Transaction.objects.filter(
            payee=user,
            status='SUCCESS'
        ).aggregate(Sum('amount'))['amount__sum'] or 0.00
        
        total_paid_all_time = float(total_paid_all_time)

        if salary == 0:
            salary_status = "UNPAID (NO SALARY SET)"
        elif pending_salary == 0:
            salary_status = "FULLY CREDITED"
        elif paid_this_month > 0:
            salary_status = "PARTIALLY CREDITED"
        else:
            salary_status = "PENDING"

        return Response({
            "welcome_message": f"Hello, {user.name}!",
            "community": community_name,
            "job_details": {
                "designation": designation,
                "joining_date": joining_date,
                "status": status
            },
            "salary_details": {
                "current_month_name": now.strftime("%B %Y"), 
                "base_salary": salary,
                "amount_credited": paid_this_month,
                "amount_pending": pending_salary,
                "total_earned_all_time": total_paid_all_time,
                "status": salary_status
            },
            "issue_statistics": {
                "assigned": assigned_count,
                "in_progress": in_progress_count,
                "resolved": resolved_count
            }
        })