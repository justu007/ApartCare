from rest_framework import serializers
from .models import Meeting,MeetingAttendance
from django.contrib.auth import get_user_model

    
User = get_user_model()

class AttendeeSerializer(serializers.ModelSerializer):
    duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'duration_minutes']

    def get_duration_minutes(self, obj):
        meeting_id = self.context.get('meeting_id')
        attendance = MeetingAttendance.objects.filter(meeting_id=meeting_id, user=obj).first()
        return attendance.duration_minutes if attendance else 0

class MeetingSerializer(serializers.ModelSerializer):
    attendees = serializers.SerializerMethodField()
    organizer_name = serializers.CharField(source='organizer.name', read_only=True)

    class Meta:
        model = Meeting
        fields = '__all__'
        read_only_fields = ['community', 'organizer']

    def get_attendees(self, obj):
        attendance_records = MeetingAttendance.objects.filter(meeting=obj).select_related('user')
        
        attendees_list = []
        for record in attendance_records:
            if record.user:
                attendees_list.append({
                    'id': record.user.id,
                    'name': record.user.name,
                    'email': record.user.email,
                    'duration_minutes': record.duration_minutes
                })
        return attendees_list