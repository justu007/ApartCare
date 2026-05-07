from rest_framework import serializers
from .models import Meeting

class MeetingSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.name', read_only=True)

    class Meta:
        model = Meeting
        fields = ['id', 'title', 'description', 'meeting_time', 'meeting_link', 'target_audience', 'organizer_name', 'created_at']
        read_only_fields = ['community', 'organizer']