from django.db import models
from django.conf import settings
from apps.apartment.models import Community
from apps.issue.models import Issue

class ChatMessage(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='chat_messages')
    
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='issue_chats', null=True, blank=True)
    
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.issue:
            return f"[Issue #{self.issue.id}] {self.sender.name}: {self.message[:20]}"
        return f"[Community] {self.sender.name}: {self.message[:20]}"