# cart/views.py
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Cart, CartItem
from ..products.models import Product
from ..accounts.models import VendorProfile
from .serializers import CartSerializer, CartItemSerializer

class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_cart(self, user, vendor_id):
        vendor = get_object_or_404(VendorProfile, id=vendor_id)
        cart, created = Cart.objects.get_or_create(
            user=user,
            vendor=vendor,
            is_active=True
        )
        return cart

    def get(self, request):
        # Get all active carts for the user
        carts = Cart.objects.filter(
            user=request.user,
            is_active=True
        )
        serializer = CartSerializer(carts, many=True)
        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        vendor_id = request.data.get('vendor_id')
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        # Validate vendor and product
        product = get_object_or_404(Product, id=product_id)
        if str(product.vendor.id) != str(vendor_id):
            return Response(
                {'error': 'Product does not belong to this vendor'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity < 1:
            return Response(
                {'error': 'Quantity must be positive'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cart = self.get_cart(request.user, vendor_id)
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity}
            )

            if not created:
                cart_item.quantity += quantity
                cart_item.save()

            serializer = CartSerializer(cart)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class CartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, item_id):
        cart_item = get_object_or_404(
            CartItem,
            id=item_id,
            cart__user=request.user,
            cart__is_active=True
        )
        
        quantity = int(request.data.get('quantity', 0))
        
        if quantity > 0:
            cart_item.quantity = quantity
            cart_item.save()
            serializer = CartSerializer(cart_item.cart)
            return Response(serializer.data)
        elif quantity == 0:
            cart_item.delete()
            serializer = CartSerializer(cart_item.cart)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'Quantity must be non-negative'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, item_id):
        cart_item = get_object_or_404(
            CartItem,
            id=item_id,
            cart__user=request.user,
            cart__is_active=True
        )
        cart = cart_item.cart
        cart_item.delete()
        
        # If this was the last item, delete the cart
        if cart.items.count() == 0:
            cart.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        serializer = CartSerializer(cart)
        return Response(serializer.data)