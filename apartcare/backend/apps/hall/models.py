from django.db import models
from django.conf import settings




class CommunityHall(models.Model):
    community = models.ForeignKey('apartment.Community', on_delete=models.CASCADE, related_name='halls')
    
    name = models.CharField(max_length=150) 
    description = models.TextField(blank=True, null=True)
    capacity = models.PositiveIntegerField(help_text="Maximum seating/standing capacity")
    

    rent_per_seat = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    
    is_active = models.BooleanField(default=True, help_text="Turn off if the hall is closed for maintenance")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.community.name})"
    

class HallImage(models.Model):
    hall = models.ForeignKey(CommunityHall, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='community_halls/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.hall.name}"


class HallBooking(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
    )

    community = models.ForeignKey('apartment.Community', on_delete=models.CASCADE, related_name='hall_bookings')

    hall = models.ForeignKey(CommunityHall, on_delete=models.CASCADE, related_name='bookings',blank=True)  
    resident = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    
    purpose = models.CharField(max_length=255)
    booking_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    attendees = models.PositiveIntegerField(default=1)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_paid = models.BooleanField(default=False)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    admin_remarks = models.TextField(blank=True, null=True) 
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.resident.name} - {self.booking_date} ({self.status})"

