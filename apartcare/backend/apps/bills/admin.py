from django.contrib import admin
from .models import Bill
from django.utils.html import format_html


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'flat',
        'bill_type',
        'amount',
        'fine_amount',
        'total_amount',
        'status_colored',
        'due_date',
        'billing_month',
        'billing_year',
        'created_at'
    )

    list_filter = (
        'bill_type',
        'status',
        'billing_month',
        'billing_year',
        'due_date'
    )

    search_fields = (
        'flat__flat_number',   
    )

    ordering = ('-created_at',)

    list_per_page = 25

    readonly_fields = ('total_amount', 'created_at')

    def status_colored(self, obj):
        color = {
            'PENDING': 'orange',
            'PAID': 'green',
            'OVERDUE': 'red'
        }.get(obj.status, 'black')

        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.status
        )

    status_colored.short_description = 'Status'