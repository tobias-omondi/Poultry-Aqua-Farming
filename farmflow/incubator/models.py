from datetime import timedelta
from django.conf import settings
from django.db import models


class IncubationBatch(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    batch_name = models.CharField(max_length=100)
    date_set = models.DateField()
    eggs_set = models.PositiveIntegerField()
    infertile = models.PositiveIntegerField(default=0)
    hatched = models.PositiveIntegerField(default=0)
    notes = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["-date_set"]

    @property
    def hatcher_date(self):
        return self.date_set + timedelta(days=18)

    @property
    def expected_hatch_date(self):
        return self.date_set + timedelta(days=21)

    @property
    def hatch_rate(self):
        if self.eggs_set == 0:
            return 0
        return round(self.hatched / self.eggs_set * 100, 1)

    def __str__(self):
        return self.batch_name