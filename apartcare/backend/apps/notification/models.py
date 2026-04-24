from django.db import models
from django.shortcuts import render
from django.conf import settings

class Announcement(models.Model):
    TARGET_CHOICES = (
        ('ALL', 'Everyone (Staff & Residents)'),
        ('RESIDENT', 'Residents Only'),
        ('STAFF', 'Staff Only'),
    )

    community = models.ForeignKey('apartment.Community', on_delete=models.CASCADE, related_name='announcements')
    
    target_audience = models.CharField(max_length=20, choices=TARGET_CHOICES, default='ALL')
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_urgent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_target_audience_display()})"



class Notification(models.Model):
    TYPE_CHOICES = (
        ('BILL', 'Bill Reminder'),
        ('ISSUE', 'Issue Alert'),
        ('SALARY', 'Salary Notification'),
        ('BOOKING', 'Hall Booking'),
        ('SYSTEM', 'System Alert'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} - {self.notification_type} ({'Read' if self.is_read else 'Unread'})"