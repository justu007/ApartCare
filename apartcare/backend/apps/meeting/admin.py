from django.contrib import admin
from django.utils.html import format_html

from .models import Meeting,MeetingAttendance


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'title',
        'community',
        'organizer',
        'formatted_meeting_time',
        'colored_target_audience',
        'attendee_count',
        'meeting_link',
        'created_at',
    )

    list_filter = (
        'community',
        'target_audience',
        'meeting_time',
        'created_at',
    )

    search_fields = (
        'title',
        'description',
        'community__name',
        'organizer__name',
    )

    ordering = ('-meeting_time',)

    list_per_page = 25

    def formatted_meeting_time(self, obj):
        return obj.meeting_time.strftime("%d-%m-%Y %I:%M %p")
    formatted_meeting_time.short_description = "Meeting Time"

    def attendee_count(self, obj):
        return obj.attendees.count()
    attendee_count.short_description = "Attendees"

    def colored_target_audience(self, obj):
        color = {
            'ALL': 'blue',
            'RESIDENT': 'green',
            'STAFF': 'purple',
        }.get(obj.target_audience, 'black')

        return format_html(
            '<span style="color:{}; font-weight:bold;">{}</span>',
            color,
            obj.get_target_audience_display(),
        )

    colored_target_audience.short_description = "Target Audience"


    from .models import MeetingAttendance


@admin.register(MeetingAttendance)
class MeetingAttendanceAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'meeting',
        'user',
        'join_time',
        'duration_minutes',
    )

    list_filter = (
        'meeting',
    )

    search_fields = (
        'meeting__title',
        'user__name',
    )

    ordering = (
        '-meeting',
    )

    list_per_page = 25