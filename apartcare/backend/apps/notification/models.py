from django.db import models
from django.shortcuts import render
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

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




class NotificationManager(models.Manager):
    def bulk_create(self, objs, **kwargs):
        result = super().bulk_create(objs, **kwargs)
        
        channel_layer = get_channel_layer()
        for notif in objs:
            async_to_sync(channel_layer.group_send)(
                f'user_{notif.user_id}', 
                {
                    'type': 'send_notification', 
                    'title': notif.title,
                    'message': notif.message
                }
            )
        return result

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
    objects = NotificationManager()

    def save(self, *args, **kwargs):
        is_new = self.pk is None 
        
        super().save(*args, **kwargs) 
        
        if is_new:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'user_{self.user_id}', 
                {
                    'type': 'send_notification', 
                    'title': self.title,
                    'message': self.message
                }
            )

    def __str__(self):
        return f"{self.user.name} - {self.notification_type} ({'Read' if self.is_read else 'Unread'})"