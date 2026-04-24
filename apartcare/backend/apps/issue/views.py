from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
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
        
        if user.role == 'ADMIN':
            return Issue.objects.all() 
            
        elif user.role == 'STAFF':
            return Issue.objects.filter(assigned_staff=user) 
            
        elif user.role == 'RESIDENT':
            return Issue.objects.filter(creator=user) 
            
        return Issue.objects.none()

    
    # def create(self, request, *args, **kwargs):

    #     if request.user.role != 'RESIDENT':
    #         raise PermissionDenied("Only residents can raise an issue")

    #     serializer = self.get_serializer(data=request.data)
    #     serializer.is_valid(raise_exception=True)
        
    #     issue = serializer.save(creator = request.user)
    #     Notification.objects.create(
    #         user=issue.creator,
    #         notification_type='ISSUE',  
    #         title="Issue Raised",
    #         message=f"You have successfully raised an issue: {issue.title}. Our staff will review it shortly."
    #     )   

    #     admin_user = request.user.community.admin 
    #     if admin_user:
    #         Notification.objects.create(
    #             user=admin_user,
    #             notification_type='ISSUE',
    #             title="New Issue Reported",
    #             message=f"Resident {request.user.name} raised a new issue: '{issue.title}'. Please assign a staff member."
    #         )

    #     images_data = request.FILES.getlist('images') 
        
    #     for image_data in images_data:
    #         IssueImage.objects.create(issue=issue, image=image_data)

    #     headers = self.get_success_headers(serializer.data)
    #     return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    
    # def update(self, request, *args, **kwargs):
    #     kwargs['partial'] = True 
    #     instance = self.get_object()
    #     user = request.user
        
    #     old_staff = instance.assigned_staff
    #     old_status = instance.status

    #     data = request.data.copy()
    #     if user.role == 'RESIDENT':
    #         if instance.status != 'Open':
    #              return Response({"error": "You cannot edit an issue once staff has been assigned."}, status=status.HTTP_403_FORBIDDEN)
            
    #         data.pop('status', None)
    #         data.pop('assigned_staff', None)
    #         data.pop('admin_notes', None)

        
    #     elif user.role == 'STAFF':
    #         allowed_statuses = ['In-Progress', 'Resolved']
    #         new_status = data.get('status')
            
    #         if new_status and new_status not in allowed_statuses:
    #             return Response({"error": f"Staff can only change status to: {allowed_statuses}"}, status=status.HTTP_400_BAD_REQUEST)
            
            
    #         data = {'status': new_status} if new_status else {}

        
    #     elif user.role == 'ADMIN':
            
    #         if 'assigned_staff' in data and instance.status == 'Open':
    #             data['status'] = 'Assigned'

        
    #     serializer = self.get_serializer(instance, data=data, partial=True)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_update(serializer)
    #     updated_issue = serializer.save()

    #     if user.role == 'ADMIN' and 'assigned_staff' in data:
    #         new_staff = updated_issue.assigned_staff
    #         if new_staff and old_staff != new_staff:
                
    #             Notification.objects.create(
    #                 user=new_staff,
    #                 notification_type='ISSUE',
    #                 title="New Issue Assigned",
    #                 message=f"You have been assigned to a new issue: '{updated_issue.title}'. Please check your dashboard."
    #             )
                
    #             Notification.objects.create(
    #                 user=updated_issue.creator,
    #                 notification_type='ISSUE',
    #                 title="Staff Assigned",
    #                 message=f"Admin has assigned {new_staff.name} to handle your issue: '{updated_issue.title}'."
    #             )

    #     if user.role == 'STAFF' and old_status != 'Resolved' and updated_issue.status == 'Resolved':
    #         Notification.objects.create(
    #             user=updated_issue.creator,
    #             notification_type='ISSUE',
    #             title="Issue Resolved! 🎉",
    #             message=f"Your issue '{updated_issue.title}' has been successfully resolved by {user.name}."
    #         )
    #         User = get_user_model()
    #         community_admins = User.objects.filter(community=request.user.community, role='ADMIN')
            
    #         for admin in community_admins:
    #             Notification.objects.create(
    #                 user=admin,
    #                 notification_type='ISSUE',  
    #                 title="Issue Resolved",
    #                 message=f"Staff {user.name} has resolved the issue: '{updated_issue.title}'."
    #             )      
        
    #     return Response(serializer.data)
    def create(self, request, *args, **kwargs):
        if request.user.role != 'RESIDENT':
            raise PermissionDenied("Only residents can raise an issue")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        issue = serializer.save(creator=request.user)
        
        # 1. Notify the Resident
        Notification.objects.create(
            user=issue.creator,
            notification_type='ISSUE',  
            title="Issue Raised",
            message=f"You have successfully raised an issue: {issue.title}. Our staff will review it shortly."
        )   

        # 2. 🎯 Correct Admin lookup using your specific OneToOneField
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

    
    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True 
        instance = self.get_object()
        user = request.user
        
        old_staff = instance.assigned_staff
        old_status = instance.status

        data = request.data.copy()
        if user.role == 'RESIDENT':
            if instance.status != 'Open':
                 return Response({"error": "You cannot edit an issue once staff has been assigned."}, status=status.HTTP_403_FORBIDDEN)
            
            data.pop('status', None)
            data.pop('assigned_staff', None)
            data.pop('admin_notes', None)

        elif user.role == 'STAFF':
            allowed_statuses = ['In-Progress', 'Resolved']
            new_status = data.get('status')
            
            if new_status and new_status not in allowed_statuses:
                return Response({"error": f"Staff can only change status to: {allowed_statuses}"}, status=status.HTTP_400_BAD_REQUEST)
            
            data = {'status': new_status} if new_status else {}

        elif user.role == 'ADMIN':
            if 'assigned_staff' in data and instance.status == 'Open':
                data['status'] = 'Assigned'

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        updated_issue = serializer.save()

        # --- ADMIN ASSIGNS STAFF ---
        if user.role == 'ADMIN' and 'assigned_staff' in data:
            new_staff = updated_issue.assigned_staff
            if new_staff and old_staff != new_staff:
                
                Notification.objects.create(
                    user=new_staff,
                    notification_type='ISSUE',
                    title="New Issue Assigned",
                    message=f"You have been assigned to a new issue: '{updated_issue.title}'. Please check your dashboard."
                )
                
                Notification.objects.create(
                    user=updated_issue.creator,
                    notification_type='ISSUE',
                    title="Staff Assigned",
                    message=f"Admin has assigned {new_staff.name} to handle your issue: '{updated_issue.title}'."
                )

        # --- STAFF RESOLVES ISSUE ---
        if user.role == 'STAFF' and old_status != 'Resolved' and updated_issue.status == 'Resolved':
            
            # Notify Resident
            Notification.objects.create(
                user=updated_issue.creator,
                notification_type='ISSUE',
                title="Issue Resolved! 🎉",
                message=f"Your issue '{updated_issue.title}' has been successfully resolved by {user.name}."
            )
            
            # 🎯 Correct Admin lookup using your specific OneToOneField
            admin_user = request.user.community.admin
            if admin_user:
                Notification.objects.create(
                    user=admin_user,
                    notification_type='ISSUE',  
                    title="Issue Resolved",
                    message=f"Staff {user.name} has resolved the issue: '{updated_issue.title}'."
                )   
        
        return Response(serializer.data)

