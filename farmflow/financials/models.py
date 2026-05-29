from django.db import models
from chickens.models import Batch



# The costs and sales models are designed to be flexible and extensible, allowing you to track a wide range of financial transactions related to your poultry farming operations. Each cost or sale can be associated with a specific batch of chickens, or it can be recorded as a general farm expense or income if not tied to a particular batch. This structure provides a comprehensive view of your farm's financial health and helps you make informed decisions based on detailed financial data.
class Cost(models.Model):
    CATEGORY_CHOICES = [
        ('feed', 'Feed'),
        ('medication', 'Medication'),
        ('labour', 'Labour'),
        ('equipment', 'Equipment'),
        ('utilities', 'Utilities'),
        ('transport', 'Transport'),
        ('other', 'Other'),
    ]

    batch = models.ForeignKey(
        Batch, on_delete=models.CASCADE,
        related_name='costs', null=True, blank=True  # null = farm overhead not tied to a batch
    )
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    receipt_photo = models.ImageField(upload_to='receipts/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.get_category_display()} — KES {self.amount} ({self.date})"


class Sale(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='sales')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    buyer_name = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Sale — KES {self.amount} ({self.date})"