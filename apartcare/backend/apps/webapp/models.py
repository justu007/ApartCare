from django.db import models
from django.conf import settings
import datetime
from django.utils import timezone

class GlobalSaaSRate(models.Model):
    monthly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=490.00)
    yearly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=5999.00)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Monthly: ${self.monthly_rate} | Yearly: ${self.yearly_rate}"

class CommunitySubscription(models.Model):
    PLAN_CHOICES = (
        ('TRIAL', 'Trial Period'),
        ('MONTHLY', 'Monthly Subscription'),
        ('YEARLY', 'Yearly Subscription'),
    )
    STATUS_CHOICES = (
        ('ACTIVE', 'Active / Subscribed'),
        ('EXPIRED', 'Expired / Deactivated'),
    )

    community = models.OneToOneField('apartment.Community', on_delete=models.CASCADE, related_name='subscription')
    plan_type = models.CharField(max_length=20, choices=PLAN_CHOICES, default='TRIAL')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    created_at = models.DateField(default=timezone.now)
    next_billing_date = models.DateField()  
    total_amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    @property
    def days_remaining(self):
        today = datetime.date.today()
        if today > self.next_billing_date:
            return 0
        return (self.next_billing_date - today).days

class SaaSPaymentLedger(models.Model):
    community = models.ForeignKey('apartment.Community', on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=100, unique=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='SUCCESS')



from django.db import models
from django.conf import settings

class SuperAdminAnnouncement(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class SuperAdminNotification(models.Model):
    NOTIFICATION_TYPES = (
        ('SUBSCRIPTION_SUCCESS', 'New Paid Subscription'),
        ('EXPIRATION_WARNING', 'Community Expiration Closing'),
    )
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.notification_type}] - {self.message[:30]}"