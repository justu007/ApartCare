from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import Issue
from .models import Issue,IssueImage
from .serializers import IssueSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from apps.notification.models import Notification
from django.contrib.auth import get_user_model

class IssueViewSet(viewsets.ModelViewSet):
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        
        user_community = getattr(user, 'managed_community', None) if user.role == 'ADMIN' else getattr(user, 'community', None)
        
        print(f"User: {user.email}, Role: {user.role}, Community: {user_community.name if user_community else 'None'}")
        
        if not user_community:
            raise ValidationError({"detail": "No valid community configuration mapped to this profile node."})

        if user.role == 'ADMIN':
            return Issue.objects.filter(creator__community=user_community) 
            
        elif user.role == 'STAFF':
            return Issue.objects.filter(assigned_staff=user) 
            
        elif user.role == 'RESIDENT':
            return Issue.objects.filter(creator=user) 
            

        return Issue.objects.none()

    def create(self, request, *args, **kwargs):
        if request.user.role != 'RESIDENT':
            raise PermissionDenied("Only residents can raise an issue")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        issue = serializer.save(creator=request.user)
        
        Notification.objects.create(
            user=issue.creator,
            notification_type='ISSUE',  
            title="Issue Raised",
            message=f"You have successfully raised an issue: {issue.title}. Our staff will review it shortly."
        )   

        admin_user = request.user.community.admin 
        if admin_user:
            Notification.objects.create(
                user=admin_user,
                notification_type='ISSUE',
                title="New Issue Reported ⚠️",
                message=f"Resident {request.user.name} raised a new issue: '{issue.title}'. Please review and assign staff."
            )

        images_data = request.FILES.getlist('images') 
        for image_data in images_data:
            IssueImage.objects.create(issue=issue, image=image_data)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


    def update(self, request, pk=None, *args, **kwargs):
        kwargs['partial'] = True 
        
        try:
            issue = Issue.objects.get(id=pk)
        except Issue.DoesNotExist:
            return Response({"error": "Issue not found"}, status=404)

        user = request.user

        if user.role == 'STAFF' and issue.assigned_staff != user:
            return Response(
                {"detail": "You do not have permission to update an issue that is not assigned to you."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        elif user.role == 'RESIDENT' and issue.creator != user:
            return Response(
                {"detail": "You can only modify issues you created."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        if issue.status == 'Closed':
            return Response(
                {"error": "Management has closed this issue. It can no longer be edited."}, 
                status=403
            ) 

        old_staff = issue.assigned_staff
        old_status = issue.status

        new_status = request.data.get('status', '').strip()

        updated_data = {}

        if user.role == 'RESIDENT':
            if issue.status != 'Open':
                 return Response({"error": "You cannot edit an issue once staff has been assigned."}, status=status.HTTP_403_FORBIDDEN)
            
            for field in ['title', 'description']:
                if field in request.data:
                    updated_data[field] = request.data.get(field)

        elif user.role == 'STAFF':
            allowed_statuses = ['In-Progress', 'Resolved']
            
            if new_status and new_status not in allowed_statuses:
                return Response({"error": f"Staff can only change status to: {allowed_statuses}"}, status=status.HTTP_400_BAD_REQUEST)
            
            if new_status:
                updated_data['status'] = new_status

        elif user.role == 'ADMIN':
            if 'status' in request.data:
                updated_data['status'] = request.data.get('status')
            if 'assigned_staff' in request.data:
                updated_data['assigned_staff'] = request.data.get('assigned_staff')
                if issue.status == 'Open':
                    updated_data['status'] = 'Assigned'

        serializer = self.get_serializer(issue, data=updated_data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        updated_issue = serializer.save()

        if user.role == 'ADMIN' and 'assigned_staff' in updated_data:
            new_staff = updated_issue.assigned_staff
            if new_staff and old_staff != new_staff:
                Notification.objects.create(
                    user=new_staff,
                    notification_type='ISSUE',
                    title="New Issue Assigned",
                    message=f"You have been assigned to a new issue: '{updated_issue.title}'."
                )
                Notification.objects.create(
                    user=updated_issue.creator,
                    notification_type='ISSUE',
                    title="Staff Assigned",
                    message=f"Admin has assigned {new_staff.name} to handle your issue: '{updated_issue.title}'."
                )

        if user.role == 'STAFF' and old_status != 'Resolved' and updated_issue.status == 'Resolved':
            Notification.objects.create(
                user=updated_issue.creator,
                notification_type='ISSUE',
                title="Issue Resolved! 🎉",
                message=f"Your issue '{updated_issue.title}' has been successfully resolved by {user.name}."
            )
            admin_user = getattr(request.user.community, 'admin', None)
            if admin_user:
                Notification.objects.create(
                    user=admin_user,
                    notification_type='ISSUE',  
                    title="Issue Resolved",
                    message=f"Staff {user.name} has resolved the issue: '{updated_issue.title}'."
                )   
        
        return Response(serializer.data)

