from django.db import models
from django.conf import settings
from django.utils import timezone

# Create your models here.
class EggCollections(models.Model):
  owner = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete = models.CASCADE,
  )
  collection_date = models.DateField(default=timezone.now) 
  total_eggs_collected = models.PositiveIntegerField()
  broken = models.PositiveIntegerField(default=0)
  rotten = models.PositiveIntegerField(default=0)
  notes = models.TextField(blank=True, max_length=500)
  
  class Meta:
    verbose_name_plural = "Egg Collections"
    ordering = ['-collection_date']

class EggSales(models.Model):
  owner = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete = models.CASCADE,
  )
  status_choices = [
    ('pending', 'Pending'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
  ]
  sale_date = models.DateField(default=timezone.now)
  customer_name = models.CharField(max_length=100)
  eggs = models.PositiveIntegerField()
  total_eggs_sold = models.PositiveIntegerField()
  price_per_egg = models.DecimalField(max_digits=10, decimal_places=2)
  total_sale_amount = models.DecimalField(max_digits=10, decimal_places=2)
  status = models.CharField(max_length=10, choices=status_choices, default='pending')
  notes = models.TextField(blank=True, max_length=500)

  class Meta:
    verbose_name_plural = "Egg Sales"
    ordering = ['-sale_date']

  @property
  def total_sale_value(self):
    return self.total_sale_amount * self.eggs
