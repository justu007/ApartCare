from django.contrib import admin
from .models import Announcement, Notification


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'community',
        'target_audience',
        'is_urgent',
        'created_at'
    )

    list_filter = (
        'target_audience',
        'is_urgent',
        'created_at',
        'community'
    )

    search_fields = (
        'title',
        'message',
        'community__name'
    )

    ordering = ('-created_at',)

    readonly_fields = ('created_at',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'notification_type',
        'title',
        'is_read',
        'created_at'
    )

    list_filter = (
        'notification_type',
        'is_read',
        'created_at'
    )

    search_fields = (
        'user__name',
        'title',
        'message'
    )

    ordering = ('-created_at',)

    readonly_fields = ('created_at',)