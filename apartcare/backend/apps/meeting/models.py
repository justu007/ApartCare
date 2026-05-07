from django.db import models
from django.conf import settings

class Meeting(models.Model):
    TARGET_CHOICES = (
        ('ALL', 'Everyone (Staff & Residents)'),
        ('RESIDENT', 'Residents Only'),
        ('STAFF', 'Staff Only'),
    )

    community = models.ForeignKey('apartment.Community', on_delete=models.CASCADE, related_name='meetings')
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    meeting_time = models.DateTimeField() # Stores both Date and Time
    meeting_link = models.URLField(max_length=500) # Validates that it's an actual URL
    
    target_audience = models.CharField(max_length=20, choices=TARGET_CHOICES, default='ALL')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Meeting: {self.title} on {self.meeting_time.strftime('%Y-%m-%d')}"
