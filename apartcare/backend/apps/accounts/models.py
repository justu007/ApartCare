from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import UserManager

class User(AbstractUser):
    username = None  

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.BigIntegerField(unique=True,null=True,blank=True)

    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('RESIDENT', 'Resident'),
        ('STAFF', 'Staff'),
    )
    role = models.CharField(max_length=25, choices=ROLE_CHOICES)

    flat = models.ForeignKey(
        'apartment.Flat',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()  

    def __str__(self):
        return self.email
