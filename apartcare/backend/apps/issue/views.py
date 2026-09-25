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
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from apps.webapp.models import CommunitySubscription
import logging


logger = logging.getLogger(__name__)
class IssueViewSet(viewsets.ModelViewSet):
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'ADMIN':
            user_community = getattr(user, 'community', None) or getattr(user, 'managed_community', None)
            if user_community:
                return Issue.objects.filter(creator__community=user_community).order_by('-created_at')
            return Issue.objects.all().order_by('-created_at')

        elif user.role == 'STAFF':
            return Issue.objects.filter(assigned_staff=user).order_by('-created_at')

        elif user.role == 'RESIDENT':
            return Issue.objects.filter(creator=user).order_by('-created_at')

        return Issue.objects.none()

    def create(self, request, *args, **kwargs):

        if request.user.role != 'RESIDENT':
            raise PermissionDenied("Only residents can raise an issue")
        subscription = request.user.community.subscription
        if subscription.plan_type == 'TRIAL' and subscription.status == 'ACTIVE':
            issue_count = Issue.objects.filter(creator__community = request.user.community).count()

            if issue_count >=5:
                return Response( 
                    {"detail": "community subscription is in Trial...contact the community admin"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        issue = serializer.save(creator=request.user)
        Notification.objects.create(
            user = issue.creator,
            notification_type = 'ISSUE',  
            title = "Issue Raised",
            message = f"You have successfully raised an issue: {issue.title}. Our staff will review it shortly."
        )   

        admin_user = request.user.community.admin 
        if admin_user:
            Notification.objects.create(
                user = admin_user,
                notification_type='ISSUE',
                title="New Issue Reported ⚠️",
                message=f"Resident {request.user.name} raised a new issue: '{issue.title}'. Please review and assign staff."
            )
            
            if issue.creator:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"user_admin_community_{issue.creator.id}",
                    {
                    
                        'type' : 'send_notification',  
                        'title' : "Issue Raised",
                        'message' : f"You have successfully raised an issue: {issue.title}. Our staff will review it shortly."
                    } 
                )
            if admin_user:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"user_admin_community_{admin_user.id}",
                    {
                    
                        'type':'send_notification',
                        'title':"New Issue Reported ⚠️",
                        'message':f"Resident {request.user.name} raised a new issue: '{issue.title}'. Please review and assign staff."
                    }
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
            return Response({"error": "Issue not found"}, status=status.HTTP_404_NOT_FOUND)

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
                status=status.HTTP_403_FORBIDDEN
            ) 

        old_staff = issue.assigned_staff
        old_status = issue.status
        new_status = request.data.get('status', '').strip()
        updated_data = {}

        if user.role == 'RESIDENT':
            if issue.status != 'Open':
                return Response(
                    {"error": "You cannot edit an issue once staff has been assigned."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            for field in ['title', 'description']:
                if field in request.data:
                    updated_data[field] = request.data.get(field)

        elif user.role == 'STAFF':
            allowed_statuses = ['In-Progress', 'Resolved']
            if new_status and new_status not in allowed_statuses:
                return Response(
                    {"error": f"Staff can only change status to: {allowed_statuses}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            if new_status:
                updated_data['status'] = new_status

        elif user.role == 'ADMIN':
            if 'status' in request.data:
                updated_data['status'] = request.data.get('status')
            if 'priority' in request.data:
                updated_data['priority'] = request.data.get('priority')
            if 'assigned_staff' in request.data:
                updated_data['assigned_staff'] = request.data.get('assigned_staff') or None
                if issue.status == 'Open' and updated_data['assigned_staff']:
                    updated_data['status'] = 'Assigned'

        serializer = self.get_serializer(issue, data=updated_data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_issue = serializer.save()

        channel_layer = get_channel_layer()

        table_sync_event = {
            "type": "send_issue_update",
            "event_type": "ISSUE_STATUS_UPDATED",
            "issue": {
                "id": updated_issue.id,
                "title": updated_issue.title,
                "status": updated_issue.status,
                "priority": updated_issue.priority,
                "assigned_staff": updated_issue.assigned_staff.id if updated_issue.assigned_staff else None,
                "assigned_staff_name": getattr(updated_issue.assigned_staff, 'name', 'Unassigned')
            }
        }

        admin_user = (
            getattr(getattr(user, 'community', None), 'admin', None) or 
            getattr(getattr(updated_issue.creator, 'community', None), 'admin', None)
        )

        if user.role == 'ADMIN' and 'assigned_staff' in updated_data:
            new_staff = updated_issue.assigned_staff
            if new_staff and old_staff != new_staff:
                Notification.objects.create(
                    user=new_staff,
                    notification_type='ISSUE',
                    title="New Issue Assigned",
                    message=f"You have been assigned to: '{updated_issue.title}'."
                )
            if new_staff:
                async_to_sync(channel_layer.group_send)(
                    f"user_admin_community_{new_staff.id}",
                    {
                        'type': 'send_notification',
                        'title': "Issue Assigned ⚠️",
                        'message': f"Admin assigned you to '{updated_issue.title}'."
                    }
                )

                if updated_issue.creator:
                    Notification.objects.create(
                        user=updated_issue.creator,
                        notification_type='ISSUE',
                        title="Staff Assigned",
                        message=f"Admin assigned {new_staff.name} to handle '{updated_issue.title}'."
                    )
                if updated_issue.creator:
                    async_to_sync(channel_layer.group_send)(
                        f"user_admin_community_{updated_issue.creator.id}",
                        {
                            'type': 'send_notification',
                            'title': "Staff Assigned ⚠️",
                            'message': f"Admin assigned {new_staff.name} to handle '{updated_issue.title}'."
                        }
                    )

        if old_status != updated_issue.status:
            if user.role == 'STAFF':
                if updated_issue.creator:
                    Notification.objects.create(
                        user=updated_issue.creator,
                        notification_type='ISSUE',
                        title=f"Issue {updated_issue.status}!",
                        message=f"Staff {user.name} updated '{updated_issue.title}' to {updated_issue.status}."
                    )
                if updated_issue.creator:
                    async_to_sync(channel_layer.group_send)(
                        f"user_admin_community_{updated_issue.creator.id}",
                        {
                            'type': 'send_notification',
                            'title': f"Issue {updated_issue.status}! ⚠️",
                            'message': f"Staff {user.name} updated '{updated_issue.title}' to {updated_issue.status}."
                        }
                    )

                if admin_user:
                    Notification.objects.create(
                        user=admin_user,
                        notification_type='ISSUE',
                        title=f"Issue {updated_issue.status}",
                        message=f"Staff {user.name} updated '{updated_issue.title}' to {updated_issue.status}."
                    )
                if admin_user:
                    async_to_sync(channel_layer.group_send)(
                        f"user_admin_community_{admin_user.id}",
                        {
                            'type': 'send_notification',
                            'title': f"Issue {updated_issue.status} ⚠️",
                            'message': f"Staff {user.name} updated '{updated_issue.title}' to {updated_issue.status}."
                        }
                    )

            elif user.role == 'ADMIN':
                if updated_issue.creator:
                    Notification.objects.create(
                        user=updated_issue.creator,
                        notification_type='ISSUE',
                        title=f"Issue {updated_issue.status}!",
                        message=f"Admin {user.name} updated '{updated_issue.title}' to {updated_issue.status}."
                    )
                if updated_issue.creator:
                    async_to_sync(channel_layer.group_send)(
                        f"user_admin_community_{updated_issue.creator.id}",
                        {
                            'type': 'send_notification',
                            'title': f"Issue {updated_issue.status}! ⚠️",
                            'message': f"Admin {user.name} updated '{updated_issue.title}' to {updated_issue.status}."
                        }
                    )

                if updated_issue.assigned_staff:
                    Notification.objects.create(
                        user=updated_issue.assigned_staff,
                        notification_type='ISSUE',
                        title=f"Issue {updated_issue.status}!",
                        message=f"Admin {user.name} updated '{updated_issue.title}' to {updated_issue.status}."
                    )
                if updated_issue.assigned_staff:
                    async_to_sync(channel_layer.group_send)(
                        f"user_admin_community_{updated_issue.assigned_staff.id}",
                        {
                            'type': 'send_notification',
                            'title': f"Issue {updated_issue.status}! ⚠️",
                            'message': f"Admin {user.name} updated '{updated_issue.title}' to {updated_issue.status}."
                        }
                    )

            target_ids = {
                updated_issue.creator.id if updated_issue.creator else None,
                updated_issue.assigned_staff.id if updated_issue.assigned_staff else None,
                admin_user.id if admin_user else None
            }
            for uid in target_ids:
                if uid:
                    async_to_sync(channel_layer.group_send)(
                        f"user_admin_community_{uid}",
                        table_sync_event
                    )

        return Response(serializer.data, status=status.HTTP_200_OK)

