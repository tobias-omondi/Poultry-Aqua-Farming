from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Farm Owner'),
        ('worker', 'Farm Worker'),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='profile'
    )
    full_name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='owner')
    farm_name = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} — {self.role}"
    

from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()


class CookieConsent(models.Model):
    CONSENT_CHOICES = [
        ('accepted', 'Accepted All'),
        ('essential', 'Essential Only'),
        ('declined', 'Declined'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='cookie_consent',
        null=True,
        blank=True,
    )
    session_key = models.CharField(max_length=100, blank=True)
    consent = models.CharField(max_length=20, choices=CONSENT_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cookie Consent'
        verbose_name_plural = 'Cookie Consents'

    def __str__(self):
        identifier = self.user.username if self.user else f'anon-{self.session_key[:8]}'
        return f"{identifier} — {self.consent} ({self.created_at.date()})"
