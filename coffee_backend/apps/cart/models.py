from django.db import models
from django.conf import settings


class Cart(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='carts'
    )
    vendor = models.ForeignKey(
        'accounts.VendorProfile',
        on_delete=models.CASCADE,
        related_name='vendor_carts'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def get_total(self):
        return sum(item.get_subtotal() for item in self.items.all())

    class Meta:
        unique_together = ('user', 'vendor', 'is_active')

    def __str__(self):
        return f"Cart for {self.user.username} - Vendor: {self.vendor.business_name}"

class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_subtotal(self):
        return self.product.price * self.quantity

    class Meta:
        unique_together = ('cart', 'product')

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in Cart {self.cart.id}"