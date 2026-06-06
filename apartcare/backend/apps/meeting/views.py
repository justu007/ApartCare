import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Meeting ,MeetingAttendance
from .serializers import MeetingSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from apps.notification.models import Notification 
from rest_framework.parsers import MultiPartParser
import csv
from apps.accounts.permissions import IsAdmin

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

            for target_user in target_users:
                Notification.objects.create(
                    user=target_user,
                    message=notif_message,
                )

                async_to_sync(channel_layer.group_send)(
                    f"notifications_{target_user.id}", 
                    {
                        "type": "send_notification", 
                        "message": notif_message,
                        "notification_type": "MEETING" 
                    }
                )

            return Response({"message": "Meeting scheduled successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class UploadAttendanceCSVAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser] 

    def post(self, request, meeting_id):
        file_obj = request.FILES.get('attendance_file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=400)

        try:
            meeting = Meeting.objects.get(id=meeting_id, community=request.user.community)
        except Meeting.DoesNotExist:
            return Response({"error": "Meeting not found"}, status=404)

        raw_bytes = file_obj.read()
        decoded_text = raw_bytes.decode('utf-8-sig').replace('\r', '') 
        raw_lines = decoded_text.splitlines()

        clean_lines = []
        table_started = False
        
        for line in raw_lines:
            if "Full Name" in line or "Time in Call" in line:
                table_started = True
            
            if table_started:
                clean_lines.append(line)

        if not clean_lines:
            clean_lines = raw_lines

        reader = csv.DictReader(clean_lines)
        
        added_count = 0
        for row in reader:
            full_name = row.get('Full Name', '').strip()
            time_in_call = row.get('Time in Call', '').strip() 
            
            if not full_name:
                continue

            duration_numbers = re.findall(r'\d+', time_in_call)
            
            if '.' in time_in_call and len(duration_numbers) >= 3:
                duration_minutes = int(duration_numbers[1])
                
            elif '.' in time_in_call and len(duration_numbers) == 2:
                duration_minutes = int(duration_numbers[0])
                
            elif ',' in time_in_call and len(duration_numbers) >= 2:
                duration_minutes = int(duration_numbers[1])
                
            else:
                duration_minutes = int(duration_numbers[0]) if duration_numbers else 0
            user = None
            
            user = User.objects.filter(name__iexact=full_name).first()
            
            if not user:
                community_users = User.objects.filter(community=request.user.community)
                for potential_user in community_users:
                    if potential_user.name and potential_user.name.lower() in full_name.lower():
                        user = potential_user
                        break

            if not user:
                first_word = full_name.split()[0] if full_name.split() else full_name
                user = User.objects.filter(name__icontains=first_word).first()
            
            if user:
                MeetingAttendance.objects.update_or_create(
                    meeting=meeting,
                    user=user,
                    defaults={'duration_minutes': duration_minutes}
                )
                added_count += 1

        return Response({
            "status": "Success", 
            "message": f"Successfully recorded attendance for {added_count} residents."
        })