from django.db import models
from django.conf import settings

class Bill(models.Model):
    BILL_TYPES = (
        ('RENT', 'Rent'),
        ('WATER', 'Water'),
        ('ELECTRICITY', 'Electricity'),
        ('MAINTENANCE', 'Maintenance'),
    )
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
    )

    flat = models.ForeignKey('apartment.Flat', on_delete=models.CASCADE, related_name='bills')
    bill_type = models.CharField(max_length=20, choices=BILL_TYPES)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True)
    
    due_date = models.DateField()
    billing_month = models.IntegerField()  
    billing_year = models.IntegerField()  
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.total_amount = self.amount + self.fine_amount
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Flat {self.flat.name} - {self.bill_type} - {self.billing_month}/{self.billing_year}"




