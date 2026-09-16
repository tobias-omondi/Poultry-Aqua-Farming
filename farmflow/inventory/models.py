from django.db import models
from django.conf import settings


class Supplier(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='suppliers',
        null=True,
        blank=True,
    )
    SUPPLY_CATEGORY_CHOICES = [
        ('feed', 'Feed'),
        ('medication', 'Medication'),
        ('equipment', 'Equipment'),
        ('chicks', 'Day-old Chicks'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=50, choices=SUPPLY_CATEGORY_CHOICES)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class FeedStock(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feed_stocks',
        null=True,
        blank=True,
    )
    FEED_TYPE_CHOICES = [
        ('starter', 'Starter'),
        ('grower', 'Grower'),
        ('finisher', 'Finisher'),
        ('layer_mash', 'Layer Mash'),
    ]

    feed_type = models.CharField(max_length=50, choices=FEED_TYPE_CHOICES)
    brand = models.CharField(max_length=100, blank=True)
    quantity_bags = models.PositiveIntegerField()
    kg_per_bag = models.DecimalField(max_digits=6, decimal_places=2, default=50)
    reorder_level = models.PositiveIntegerField(default=5)
    last_restocked = models.DateField(null=True, blank=True)
    preferred_supplier = models.ForeignKey(
        Supplier, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='feed_stocks'
    )

    def is_low(self):
        return self.quantity_bags <= self.reorder_level

    def total_kg(self):
        return self.quantity_bags * self.kg_per_bag

    def __str__(self):
        return f"{self.get_feed_type_display()} — {self.quantity_bags} bags"


class Medication(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='medications',
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField()
    unit = models.CharField(max_length=50)
    reorder_level = models.PositiveIntegerField(default=2)
    expiry_date = models.DateField(null=True, blank=True)
    preferred_supplier = models.ForeignKey(
        Supplier, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='medications'
    )
    notes = models.TextField(blank=True)

    def is_low(self):
        return self.quantity <= self.reorder_level

    def __str__(self):
        return f"{self.name} — {self.quantity} {self.unit}"


class PurchaseOrder(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='purchase_orders',
        null=True,
        blank=True,
    )
    ITEM_TYPE_CHOICES = [
        ('feed', 'Feed'),
        ('medication', 'Medication'),
        ('equipment', 'Equipment'),
        ('chicks', 'Day-old Chicks'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('purchased', 'Purchased'),
        ('cancelled', 'Cancelled'),
    ]

    item_type = models.CharField(max_length=50, choices=ITEM_TYPE_CHOICES)
    item_name = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)  # bags, vials, kg, etc.
    supplier = models.ForeignKey(
        Supplier, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='purchase_orders'
    )
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    date_needed = models.DateField(null=True, blank=True)
    date_purchased = models.DateField(null=True, blank=True)
    receipt_photo = models.ImageField(upload_to='receipts/purchases/', null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def cost_variance(self):
        """Shows difference between estimated and actual cost."""
        if self.estimated_cost and self.actual_cost:
            return round(self.actual_cost - self.estimated_cost, 2)
        return None

    def __str__(self):
        return f"{self.item_name} — {self.status} ({self.created_at.date()})"


class PriceHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='price_history',
        null=True,
        blank=True,
    )
    """
    Every time a purchase is completed, a price record is saved here.
    Over time this builds a supplier price comparison per item.
    """
    supplier = models.ForeignKey(
        Supplier, on_delete=models.CASCADE, related_name='price_history'
    )
    item_name = models.CharField(max_length=200)
    item_type = models.CharField(max_length=50)
    unit = models.CharField(max_length=50)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='price_records'
    )

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.supplier.name} — {self.item_name} @ KES {self.price_per_unit} ({self.date})"