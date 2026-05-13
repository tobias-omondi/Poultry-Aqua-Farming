from django.db import models
from chickens.models import Batch


class House(models.Model):
    name = models.CharField(max_length=100)  # e.g. "House A"
    capacity = models.PositiveIntegerField()  # max birds
    active_batch = models.OneToOneField(
        Batch, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='house'
    )
    last_cleaned = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def is_available(self):
        return self.active_batch is None

    def occupancy_percentage(self):
        if self.active_batch:
            return round((self.active_batch.current_count / self.capacity) * 100, 2)
        return 0

    def __str__(self):
        status = "available" if self.is_available() else f"occupied — {self.active_batch.name}"
        return f"{self.name} ({status})"