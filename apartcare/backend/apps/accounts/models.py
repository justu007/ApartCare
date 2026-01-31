from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    username = None

    name  = models.CharField(max_length=100)
    email = models.EmailField(unique=True,max_length=100)
    phone = models.IntegerField(unique=True)

    ROLE_CHOICES = (
        ('ADMIN','admin'),
        ('RESIDENT','resident'),
        ('STAFF','staff'),
    )

    role = models.CharField(choices=ROLE_CHOICES,max_length=25)

    flat = models.ForeignKey('apartment.Flat',on_delete=models.SET_NULL,null=True, blank= True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS =[]

    def __str__(self):
        return self.email


