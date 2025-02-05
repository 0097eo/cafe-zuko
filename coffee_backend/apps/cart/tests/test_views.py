from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from ...accounts.models import VendorProfile
from ...products.models import Product
from ..models import Cart, CartItem

User = get_user_model()

class CartViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.vendor = VendorProfile.objects.create(
            user=User.objects.create_user(
                username='vendoruser',
                email='vendor@example.com',
                password='vendorpass123'
            ),
            business_name='Test Shop'
        )
        self.product = Product.objects.create(
            name='Test Product',
            price=Decimal('10.00'),
            vendor=self.vendor
        )
        self.client.force_authenticate(user=self.user)

    def test_get_carts_empty(self):
        response = self.client.get(reverse('cart'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_get_carts_with_items(self):
        cart = Cart.objects.create(user=self.user, vendor=self.vendor)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)
        
        response = self.client.get(reverse('cart'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(len(response.data[0]['items']), 1)

    def test_add_item_to_cart_new_cart(self):
        response = self.client.post(reverse('cart'), {
            'vendor_id': self.vendor.id,
            'product_id': self.product.id,
            'quantity': 2
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Cart.objects.count(), 1)
        self.assertEqual(CartItem.objects.count(), 1)

    def test_add_item_to_existing_cart(self):
        self.client.post(reverse('cart'), {
            'vendor_id': self.vendor.id,
            'product_id': self.product.id,
            'quantity': 2
        })
        
        response = self.client.post(reverse('cart'), {
            'vendor_id': self.vendor.id,
            'product_id': self.product.id,
            'quantity': 3
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Cart.objects.count(), 1)
        self.assertEqual(CartItem.objects.first().quantity, 5)

    def test_add_item_invalid_vendor(self):
        other_vendor = VendorProfile.objects.create(
            user=User.objects.create_user(
                username='othervendor',
                email='other@example.com',
                password='otherpass123'
            ),
            business_name='Other Shop'
        )
        
        response = self.client.post(reverse('cart'), {
            'vendor_id': other_vendor.id,
            'product_id': self.product.id,
            'quantity': 1
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_item_invalid_quantity(self):
        response = self.client.post(reverse('cart'), {
            'vendor_id': self.vendor.id,
            'product_id': self.product.id,
            'quantity': 0
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class CartItemViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.vendor = VendorProfile.objects.create(
            user=User.objects.create_user(
                username='vendoruser',
                email='vendor@example.com',
                password='vendorpass123'
            ),
            business_name='Test Shop'
        )
        self.product = Product.objects.create(
            name='Test Product',
            price=Decimal('10.00'),
            vendor=self.vendor
        )
        self.cart = Cart.objects.create(user=self.user, vendor=self.vendor)
        self.cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2
        )
        self.client.force_authenticate(user=self.user)

    def test_update_cart_item_quantity(self):
        response = self.client.put(
            reverse('cart-item', args=[self.cart_item.id]),
            {'quantity': 5}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cart_item.refresh_from_db()
        self.assertEqual(self.cart_item.quantity, 5)

    def test_update_cart_item_quantity_zero(self):
        response = self.client.put(
            reverse('cart-item', args=[self.cart_item.id]),
            {'quantity': 0}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CartItem.objects.filter(id=self.cart_item.id).exists(), False)

    def test_update_cart_item_negative_quantity(self):
        response = self.client.put(
            reverse('cart-item', args=[self.cart_item.id]),
            {'quantity': -1}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_cart_item(self):
        response = self.client.delete(
            reverse('cart-item', args=[self.cart_item.id])
        )
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CartItem.objects.filter(id=self.cart_item.id).exists(), False)
        self.assertEqual(Cart.objects.filter(id=self.cart.id).exists(), False)

    def test_delete_cart_item_with_other_items(self):
        CartItem.objects.create(
            cart=self.cart,
            product=Product.objects.create(
                name='Other Product',
                price=Decimal('20.00'),
                vendor=self.vendor
            ),
            quantity=1
        )
        
        response = self.client.delete(
            reverse('cart-item', args=[self.cart_item.id])
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CartItem.objects.filter(id=self.cart_item.id).exists(), False)
        self.assertEqual(Cart.objects.filter(id=self.cart.id).exists(), True)