from django.contrib import admin
from django.utils.html import format_html

from .models import SalaryPayment


@admin.register(SalaryPayment)
class SalaryPaymentAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'staff',
        'salary_month',
        'year',
        'amount',
        'colored_status',
        'transaction_id',
        'paid_at',
    )

    list_filter = (
        'status',
        'month',
        'year',
        'paid_at',
    )

    search_fields = (
        'staff__name',
        'staff__email',
        'transaction_id',
    )

    ordering = ('-year', '-month')

    list_per_page = 25

    def salary_month(self, obj):
        months = {
            1: "January",
            2: "February",
            3: "March",
            4: "April",
            5: "May",
            6: "June",
            7: "July",
            8: "August",
            9: "September",
            10: "October",
            11: "November",
            12: "December",
        }
        return months.get(obj.month, obj.month)

    salary_month.short_description = "Month"

    def colored_status(self, obj):
        color = {
            'PENDING': 'orange',
            'SENT': 'blue',
            'RECEIVED': 'green',
        }.get(obj.status, 'black')

        return format_html(
            '<span style="color:{}; font-weight:bold;">{}</span>',
            color,
            obj.get_status_display(),
        )

    colored_status.short_description = "Status"