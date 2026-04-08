from django.contrib import admin
from .models import Issue
from django.utils.html import format_html
@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):

    list_display = (
        'id', 'title', 'short_description',
        'category', 'priority', 'colored_status',
        'creator', 'assigned_staff', 'created_at'
    )

    list_filter = ('category', 'priority', 'status', 'created_at')

    search_fields = ('title', 'description', 'creator__name')

    ordering = ('-created_at',)

    list_per_page = 25

    def short_description(self, obj):
        return obj.description[:50] + "..." if len(obj.description) > 50 else obj.description

    def colored_status(self, obj):
        color = {
            'Open': 'blue',
            'Assigned': 'orange',
            'In-Progress': 'purple',
            'Resolved': 'green',
            'Closed': 'gray'
        }.get(obj.status, 'black')

        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.status
        )

    colored_status.short_description = 'Status'

