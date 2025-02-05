from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from decimal import Decimal
from datetime import datetime
from ..models import Order, OrderItem
from ...products.models import Product
from ...accounts.models import VendorProfile

class OrderTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.vendor = VendorProfile.objects.create(
            user=self.user,
            business_name='Test Vendor'
        )
        
        self.order = Order.objects.create(
            customer=self.user,
            total_amount=Decimal('99.99'),
            shipping_address='123 Test St',
            phone_number='1234567890'
        )
        
        self.product = Product.objects.create(
            name='Test Product',
            price=Decimal('49.99'),
            vendor=self.vendor
        )
        
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=2,
            price=Decimal('49.99')
        )

    def test_order_creation(self):
        self.assertEqual(self.order.status, 'PENDING')
        self.assertEqual(self.order.customer, self.user)
        self.assertEqual(self.order.total_amount, Decimal('99.99'))
        self.assertEqual(self.order.shipping_address, '123 Test St')
        self.assertEqual(self.order.phone_number, '1234567890')
        self.assertTrue(isinstance(self.order.created_at, datetime))
        self.assertTrue(isinstance(self.order.updated_at, datetime))

    def test_order_str_representation(self):
        expected_str = f"Order {self.order.id} by {self.user.username}"
        self.assertEqual(str(self.order), expected_str)

    def test_order_status_choices(self):
        self.order.status = 'PROCESSING'
        self.order.full_clean()
        self.assertEqual(self.order.status, 'PROCESSING')

        with self.assertRaises(ValidationError):
            self.order.status = 'INVALID_STATUS'
            self.order.full_clean()

class OrderItemTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.vendor = VendorProfile.objects.create(
            user=self.user,
            business_name='Test Vendor'
        )
        
        self.order = Order.objects.create(
            customer=self.user,
            total_amount=Decimal('99.99'),
            shipping_address='123 Test St',
            phone_number='1234567890'
        )
        
        self.product = Product.objects.create(
            name='Test Product',
            price=Decimal('49.99'),
            vendor=self.vendor
        )
        
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=2,
            price=Decimal('49.99')
        )

    def test_order_item_creation(self):
        self.assertEqual(self.order_item.order, self.order)
        self.assertEqual(self.order_item.product, self.product)
        self.assertEqual(self.order_item.quantity, 2)
        self.assertEqual(self.order_item.price, Decimal('49.99'))
        self.assertTrue(isinstance(self.order_item.created_at, datetime))
        self.assertTrue(isinstance(self.order_item.updated_at, datetime))

    def test_order_item_str_representation(self):
        expected_str = f"2 x {self.product.name}"
        self.assertEqual(str(self.order_item), expected_str)

    def test_order_item_related_name(self):
        self.assertEqual(self.order.items.first(), self.order_item)

    def test_cascade_deletion(self):
        order_id = self.order.id
        self.order.delete()
        with self.assertRaises(OrderItem.DoesNotExist):
            OrderItem.objects.get(id=self.order_item.id)