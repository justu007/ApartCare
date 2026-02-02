from django.db import models
class Community(models.Model):
    name = models.CharField(max_length=100,unique=True)
    address = models.TextField()
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name
    

class Block(models.Model):
    name = models.CharField(max_length=50,unique=True)
    community = models.ForeignKey(Community,on_delete=models.CASCADE,related_name = "blocks")
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.community.name} - {self.name}"

    
class Flat(models.Model):
    name = models.CharField(max_length=20,unique=True)
    block = models.ForeignKey(Block,on_delete=models.CASCADE,related_name = "flats")
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name
