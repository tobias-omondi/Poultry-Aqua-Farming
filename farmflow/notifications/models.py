from django.db import models
from django.conf import settings


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True,
    )
    KIND_CHOICES = [
        ('health', 'Health & Care'),
        ('market', 'Market & Finance'),
        ('alert', 'Alert'),
        ('infra', 'Infrastructure'),
    ]

    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)
    kind = models.CharField(max_length=20, choices=KIND_CHOICES, default='alert')
    is_read = models.BooleanField(default=False)
    link_url = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_kind_display()})"