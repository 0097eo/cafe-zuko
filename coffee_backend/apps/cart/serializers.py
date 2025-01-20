from rest_framework import serializers
from .models import Cart, CartItem
from ..products.serializers import ProductSerializer
from ..products.models import Product

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        write_only=True,
        source='product'
    )
    subtotal = serializers.DecimalField(
        source='get_subtotal',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal', 'created_at']
        read_only_fields = ['id', 'created_at']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    vendor_name = serializers.CharField(source='vendor.business_name', read_only=True)
    total = serializers.DecimalField(
        source='get_total',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Cart
        fields = ['id', 'vendor', 'vendor_name', 'items', 'total', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']