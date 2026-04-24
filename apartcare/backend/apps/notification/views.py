from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Announcement, Notification
from .serializers import AnnouncementSerializer, NotificationSerializer
from django.contrib.auth import get_user_model
from django.db import transaction

# class AnnouncementAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user
        
#         queryset = Announcement.objects.filter(community=user.community)
        
#         if user.role == 'RESIDENT':
#             queryset = queryset.filter(Q(target_audience='ALL') | Q(target_audience='RESIDENT'))
            
#         elif user.role == 'STAFF':
#             queryset = queryset.filter(Q(target_audience='ALL') | Q(target_audience='STAFF'))
            

#         announcements = queryset.order_by('-created_at')
#         serializer = AnnouncementSerializer(announcements, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

# def post(self, request):
#         if getattr(request.user, 'role', '') != 'ADMIN':
#             return Response({"error": "Only admins can make announcements."}, status=status.HTTP_403_FORBIDDEN)

#         serializer = AnnouncementSerializer(data=request.data)
#         if serializer.is_valid():
#             with transaction.atomic():
#                 announcement = serializer.save(community=request.user.community)

#                 User = get_user_model()
#                 target = announcement.target_audience
                
#                 audience_users = User.objects.filter(
#                     community=request.user.community
#                 ).exclude(id=request.user.id)

#                 if target == 'RESIDENT':
#                     audience_users = audience_users.filter(role='RESIDENT')
#                 elif target == 'STAFF':
#                     audience_users = audience_users.filter(role='STAFF')

#                 notifications_to_create = []
#                 prefix = "🚨 URGENT: " if announcement.is_urgent else "📢 "
                
#                 for usr in audience_users:
#                     notifications_to_create.append(
#                         Notification(
#                             user=usr,
#                             notification_type='SYSTEM', 
#                             title=f"{prefix}{announcement.title}",
#                             message=announcement.message
#                         )
#                     )
                
#                 if notifications_to_create:
#                     Notification.objects.bulk_create(notifications_to_create)

#             return Response({"message": "Announcement broadcasted successfully!"}, status=status.HTTP_201_CREATED)
            
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AnnouncementAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        if user.role == 'ADMIN':
            user_community = getattr(user, 'managed_community', None)
        else:
            user_community = user.community

        if not user_community:
            return Response({"error": "No community assigned to this user."}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = Announcement.objects.filter(community=user_community)
        
        if user.role == 'RESIDENT':
            queryset = queryset.filter(Q(target_audience='ALL') | Q(target_audience='RESIDENT'))
        elif user.role == 'STAFF':
            queryset = queryset.filter(Q(target_audience='ALL') | Q(target_audience='STAFF'))

        announcements = queryset.order_by('-created_at')
        serializer = AnnouncementSerializer(announcements, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        if getattr(user, 'role', '') != 'ADMIN':
            return Response({"error": "Only admins can make announcements."}, status=status.HTTP_403_FORBIDDEN)

        # 🎯 FIX 2: Admins must use 'managed_community'
        admin_community = getattr(user, 'managed_community', None)
        if not admin_community:
             return Response({"error": "Admin is not assigned to a community."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = AnnouncementSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                # 1. Save the announcement properly
                announcement = serializer.save(community=admin_community)

                # 2. Find the Target Audience using the correct community reference
                User = get_user_model()
                target = announcement.target_audience
                
                audience_users = User.objects.filter(
                    community=admin_community
                ).exclude(id=user.id)

                if target == 'RESIDENT':
                    audience_users = audience_users.filter(role='RESIDENT')
                elif target == 'STAFF':
                    audience_users = audience_users.filter(role='STAFF')

                # 3. Create the Notifications
                notifications_to_create = []
                prefix = "🚨 URGENT: " if announcement.is_urgent else "📢 "
                
                for u in audience_users:
                    notifications_to_create.append(
                        Notification(
                            user=u,
                            notification_type='SYSTEM', 
                            title=f"{prefix}{announcement.title}",
                            message=announcement.message
                        )
                    )
                
                if notifications_to_create:
                    Notification.objects.bulk_create(notifications_to_create)

            return Response({"message": "Announcement broadcasted successfully!"}, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificationListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('is_read', '-created_at')[:20]
        
        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
        
        serializer = NotificationSerializer(notifications, many=True)
        return Response({
            "unread_count": unread_count,
            "notifications": serializer.data
        }, status=status.HTTP_200_OK)

class MarkNotificationReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        notification_id = request.data.get('notification_id')

        if notification_id == 'ALL':
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
            return Response({"message": "All notifications marked as read."}, status=status.HTTP_200_OK)
        
        try:
            notif = Notification.objects.get(id=notification_id, user=request.user)
            notif.is_read = True
            notif.save()
            return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)