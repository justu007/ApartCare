from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import UserManager

class User(AbstractUser):

    class Meta:
        ordering = ['-id']

        
    username = None  

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.BigIntegerField(unique=True,null=True,blank=True)

    ROLE_CHOICES = (
    ('SUPER_ADMIN', 'Super Admin'),
    ('ADMIN', 'Admin'),
    ('RESIDENT', 'Resident'),
    ('STAFF', 'Staff'),
    )
    role = models.CharField(max_length=25, choices=ROLE_CHOICES)
    community = models.ForeignKey(
        "apartment.Community",
        on_delete=models.CASCADE,
        null=True,  
        blank=True,
        related_name="users"
    )
    ACTIVE_CHOICES = (
        (True, 'Active'),
        (False, 'Inactive'),
    )
    
 
    is_active = models.BooleanField(choices=ACTIVE_CHOICES, default=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()  

    def __str__(self):
        return self.email
    

    

