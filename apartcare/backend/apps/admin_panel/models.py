from django.db import models
from apps.accounts.models import User
from apps.apartment.models import Flat, Block

# Create your models here.
class AdminResident_Profile(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name = 'resident_profile')

    flat = models.ForeignKey(Flat,on_delete= models.SET_NULL,null=True,blank=True)

    block = models.ForeignKey(Block,on_delete=models.SET_NULL,null= True,blank=True)

    created_date = models.DateField(null=True, blank= True)

    status = models.CharField(
        max_length=20,
        default="ACTIVE"
    )

    def __str__(self):
        return f"{self.user.email} - Resident"
    



class StaffProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='staff_profile'
    )

    designation = models.CharField(max_length=150)

    monthly_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    joining_date = models.DateField()

    status = models.CharField(max_length=50,default="ACTIVE")

    def __str__(self):
        return self.user.email
    
    

