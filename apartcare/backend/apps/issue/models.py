from django.db import models
from django.conf import settings 

class Issue(models.Model):
    CATEGORY_CHOICES = (
        ('Plumbing', 'Plumbing'),
        ('Electrical', 'Electrical'),
        ('Cleaning', 'Cleaning'),
        ('Security', 'Security'),
        ('Other', 'Other'),
    )

    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    )

    STATUS_CHOICES = (
        ('Open', 'Open'),                 
        ('Assigned', 'Assigned'),         
        ('In-Progress', 'In-Progress'),   
        ('Resolved', 'Resolved'),        
        ('Closed', 'Closed'),            
    )

    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='created_issues'
    )
    
    assigned_staff = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_issues'
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='Other')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Low')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.status} ({self.creator.name})"
    
    class Meta:
        ordering = ['-created_at'] 