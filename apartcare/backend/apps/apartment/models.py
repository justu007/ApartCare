from django.db import models
from django.conf import settings

class Community(models.Model):
    name = models.CharField(max_length=100, unique=True)
    address = models.TextField()
    is_active = models.BooleanField(null=True, blank=True)
    created_at = models.DateField(auto_now_add=True)

    admin = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="managed_community",
        limit_choices_to={'role': 'ADMIN'}
    )

    def __str__(self):
        return self.name

class Block(models.Model):
    name = models.CharField(max_length=50) 
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="blocks")
    created_at = models.DateField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name', 'community'], name='unique_block_per_community')
        ]

    def __str__(self):
        return f"{self.community.name} - {self.name}"

class Flat(models.Model):
    name = models.CharField(max_length=20)
    block = models.ForeignKey(Block, on_delete=models.CASCADE, related_name="flats")
    created_at = models.DateField(auto_now_add=True)
    occupied = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name', 'block'], name='unique_flat_per_block')
        ]

    def __str__(self):
        return f"{self.block.name} - {self.name}"