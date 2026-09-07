from django.db import models
from django.contrib.auth.models import User


class Batch(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='batches',
        null=True,
        blank=True,
    )
    BREED_CHOICES = [
        ('kienyeji', 'Kienyeji'), # main  local breed
        ('broiler', 'Broiler'),
        ('layer', 'Layer'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('harvested', 'Harvested'),
        ('closed', 'Closed'),
    ]

    name = models.CharField(max_length=100)  # e.g. "Batch #3"
    breed = models.CharField(max_length=50, choices=BREED_CHOICES)
    initial_count = models.PositiveIntegerField()  # chicks bought
    current_count = models.PositiveIntegerField()  # updates as deaths logged
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2)  # cost of chicks
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # set at harvest
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.name} ({self.breed}) — {self.status}"
    
    def mortality_percentage(self):
        if self.initial_count is None or self.current_count is None:
            return 0
        deaths = self.initial_count - self.current_count
        return round((deaths / self.initial_count) * 100, 2)

    def total_deaths(self):
        if self.initial_count is None or self.current_count is None:
            return 0
        return self.initial_count - self.current_count


class DailyLog(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='daily_logs')
    date = models.DateField()
    feed_consumed_kg = models.DecimalField(max_digits=8, decimal_places=2)
    deaths = models.PositiveIntegerField(default=0)
    average_weight_kg = models.DecimalField(max_digits=5, decimal_places=3, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        unique_together = ['batch', 'date']  # one log per batch per day

    def __str__(self):
        return f"{self.batch.name} — {self.date}"


class Harvest(models.Model):
    batch = models.OneToOneField(Batch, on_delete=models.CASCADE, related_name='harvest')
    date = models.DateField()
    birds_sold = models.PositiveIntegerField()
    total_weight_kg = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_kg = models.DecimalField(max_digits=8, decimal_places=2)
    buyer_name = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def total_revenue(self):
        if self.total_weight_kg and self.price_per_kg:
            return round(self.total_weight_kg * self.price_per_kg, 2)
        return 0

    def __str__(self):
        return f"Harvest — {self.batch.name} on {self.date}"