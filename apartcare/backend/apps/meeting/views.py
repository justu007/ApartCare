from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Meeting
from .serializers import MeetingSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from apps.notification.models import Notification 


User = get_user_model()
class MeetingAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_community = getattr(user, 'managed_community', None) if user.role == 'ADMIN' else user.community
        if not user_community:
            return Response({"error": "No community assigned."}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = Meeting.objects.filter(community=user_community).order_by('meeting_time')
        
        if user.role == 'RESIDENT':
            queryset = queryset.filter(Q(target_audience='ALL') | Q(target_audience='RESIDENT'))
        elif user.role == 'STAFF':
            queryset = queryset.filter(Q(target_audience='ALL') | Q(target_audience='STAFF'))

        serializer = MeetingSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def post(self, request):
        user = request.user
        if getattr(user, 'role', '') != 'ADMIN':
            return Response({"error": "Only admins can schedule meetings."}, status=status.HTTP_403_FORBIDDEN)

        admin_community = getattr(user, 'managed_community', None)
        
        serializer = MeetingSerializer(data=request.data)
        if serializer.is_valid():
            meeting = serializer.save(community=admin_community, organizer=user)
            
            # 🎯 NEW: LIVE NOTIFICATION LOGIC
            
            # 1. Find the target users based on the audience choice
            target_users = User.objects.filter(community=admin_community)
            if meeting.target_audience == 'RESIDENT':
                target_users = target_users.filter(role='RESIDENT')
            elif meeting.target_audience == 'STAFF':
                target_users = target_users.filter(role='STAFF')
            else:
                target_users = target_users.filter(role__in=['RESIDENT', 'STAFF'])

            channel_layer = get_channel_layer()
            formatted_time = meeting.meeting_time.strftime("%b %d at %I:%M %p")
            notif_message = f"New Meeting Scheduled: {meeting.title} on {formatted_time}"

            # 2. Loop through users, save to DB, and broadcast via WebSockets
            for target_user in target_users:
                # Save to database so they see it even if they are offline
                Notification.objects.create(
                    user=target_user,
                    message=notif_message,
                    # Add a type field if your model has one, e.g., type='MEETING'
                )

                # Instantly push to the user's active WebSocket connection
                # NOTE: Ensure "notifications_{target_user.id}" matches the exact group name defined in your NotificationConsumer!
                async_to_sync(channel_layer.group_send)(
                    f"notifications_{target_user.id}", 
                    {
                        "type": "send_notification", # Matches the consumer method
                        "message": notif_message,
                        "notification_type": "MEETING" 
                    }
                )

            return Response({"message": "Meeting scheduled successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)