from django.contrib import admin
from django.utils.html import format_html
from .models import CommunityHall, HallImage, HallBooking


class HallImageInline(admin.TabularInline):
    model = HallImage
    extra = 1


@admin.register(CommunityHall)
class CommunityHallAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'name',
        'community',
        'capacity',
        'rent_per_seat',
        'is_active_colored',
        'created_at'
    )

    list_filter = (
        'community',
        'is_active',
        'created_at'
    )

    search_fields = (
        'name',
        'community__name'
    )

    ordering = ('-created_at',)

    list_per_page = 25

    readonly_fields = ('created_at',)

    inlines = [HallImageInline]

    def is_active_colored(self, obj):
        color = 'green' if obj.is_active else 'red'
        text = 'Active' if obj.is_active else 'Inactive'

        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            text
        )

    is_active_colored.short_description = 'Status'

@admin.register(HallImage)
class HallImageAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'hall',
        'image_preview',
        'uploaded_at'
    )

    search_fields = (
        'hall__name',
    )

    list_filter = (
        'uploaded_at',
    )

    readonly_fields = ('uploaded_at',)

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="60" height="60" style="object-fit: cover;" />',
                obj.image.url
            )
        return "No Image"

    image_preview.short_description = 'Preview'


@admin.register(HallBooking)
class HallBookingAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'hall',
        'resident',
        'booking_date',
        'start_time',
        'end_time',
        'status_colored',
        'created_at'
    )

    list_filter = (
        'status',
        'booking_date',
        'community'
    )

    search_fields = (
        'resident__name',
        'hall__name',
    )

    ordering = ('-created_at',)

    list_per_page = 25

    readonly_fields = ('created_at', 'updated_at')

    def status_colored(self, obj):
        color = {
            'PENDING': 'orange',
            'APPROVED': 'green',
            'REJECTED': 'red',
            'CANCELLED': 'gray'
        }.get(obj.status, 'black')

        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.status
        )

    status_colored.short_description = 'Status'