from rest_framework import serializers
from .models import  ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender_name', 'sender_role', 'message', 'timestamp']
        read_only_fields = ['community', 'sender']