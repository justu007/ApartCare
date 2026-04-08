from django.db import models
from django.conf import settings
from apps.bills.models import Bill

# Create your models here.
class SalaryPayment(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),      
        ('RECEIVED', 'Received'),
    )

    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='salaries', limit_choices_to={'role': 'STAFF'})
    month = models.IntegerField()
    year = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    transaction_id = models.CharField(max_length=100, null=True, blank=True) 
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.staff.email} - Salary {self.month}/{self.year} ({self.status})"
    
class Transaction(models.Model):
    PURPOSE_CHOICES = (
        ('BILL_PAYMENT', 'Bill Payment'),
        ('SALARY_PAYMENT', 'Salary Payment'),
    )
    STATUS_CHOICES = (
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('PENDING', 'Pending'),
    )

    payer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='payments_made')
    payee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='payments_received')
    
    bill = models.ForeignKey(Bill, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    salary = models.ForeignKey(SalaryPayment, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    payment_gateway = models.CharField(max_length=50) 
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Txn {self.id} - {self.amount} - {self.status}"