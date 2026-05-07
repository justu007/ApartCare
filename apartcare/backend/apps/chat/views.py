from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from apps.issue.models import Issue






class ChatHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_community = getattr(user, 'managed_community', None) if user.role == 'ADMIN' else user.community
        
        messages = ChatMessage.objects.filter(community=user_community).order_by('-timestamp')[:50]
        messages = list(messages) 
        messages = reversed(messages) 
        
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class IssueChatHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, issue_id):
        user = request.user
        issue = get_object_or_404(Issue, id=issue_id)

        is_admin = (user.role == 'ADMIN' and getattr(user, 'managed_community', None) == issue.community)
        is_creator = (user.role == 'RESIDENT' and issue.creator == user)
        is_assigned_staff = (user.role == 'STAFF' and issue.assigned_staff == user)

        if not (is_admin or is_creator or is_assigned_staff):
            return Response({"error": "You do not have permission to view this chat."}, status=status.HTTP_403_FORBIDDEN)

        messages = ChatMessage.objects.filter(issue=issue).order_by('-timestamp')[:50]
        messages = reversed(messages) 
        
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
