from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from decimal import Decimal
from ...accounts.models import VendorProfile
from ...products.models import Product
from ..models import Cart, CartItem

User = get_user_model()

class CartModelTests(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create test vendor
        self.vendor = VendorProfile.objects.create(
            user=self.user,
            business_name='Test Shop',
            business_address='123 Test St'
        )
        
        # Create test products
        self.product1 = Product.objects.create(
            name='Test Product 1',
            price=Decimal('10.00'),
            vendor=self.vendor
        )
        self.product2 = Product.objects.create(
            name='Test Product 2',
            price=Decimal('20.00'),
            vendor=self.vendor
        )

    def test_cart_creation(self):
        cart = Cart.objects.create(
            user=self.user,
            vendor=self.vendor
        )
        self.assertIsNotNone(cart.id)
        self.assertTrue(cart.is_active)
        self.assertIsNotNone(cart.created_at)
        self.assertIsNotNone(cart.updated_at)

    def test_cart_unique_constraint(self):
        # Create first cart
        Cart.objects.create(
            user=self.user,
            vendor=self.vendor
        )
        
        # Attempt to create second active cart for same user-vendor combination
        with self.assertRaises(IntegrityError):
            Cart.objects.create(
                user=self.user,
                vendor=self.vendor
            )

    def test_cart_str_representation(self):
        cart = Cart.objects.create(
            user=self.user,
            vendor=self.vendor
        )
        expected_str = f"Cart for {self.user.username} - Vendor: {self.vendor.business_name}"
        self.assertEqual(str(cart), expected_str)

    def test_cart_total_calculation(self):
        cart = Cart.objects.create(
            user=self.user,
            vendor=self.vendor
        )
        
        # Add items to cart
        CartItem.objects.create(
            cart=cart,
            product=self.product1,
            quantity=2
        )
        CartItem.objects.create(
            cart=cart,
            product=self.product2,
            quantity=1
        )
        
        # Test total calculation (2 * 10.00 + 1 * 20.00 = 40.00)
        expected_total = Decimal('40.00')
        self.assertEqual(cart.get_total(), expected_total)

class CartItemModelTests(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create test vendor
        self.vendor = VendorProfile.objects.create(
            user=self.user,
            business_name='Test Shop',
            business_address='123 Test St'
        )
        
        # Create test product
        self.product = Product.objects.create(
            name='Test Product',
            price=Decimal('10.00'),
            vendor=self.vendor
        )
        
        # Create test cart
        self.cart = Cart.objects.create(
            user=self.user,
            vendor=self.vendor
        )

    def test_cart_item_creation(self):
        cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2
        )
        self.assertIsNotNone(cart_item.id)
        self.assertEqual(cart_item.quantity, 2)
        self.assertIsNotNone(cart_item.created_at)
        self.assertIsNotNone(cart_item.updated_at)

    def test_cart_item_unique_constraint(self):
        # Create first cart item
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=1
        )
        
        # Attempt to create duplicate cart item
        with self.assertRaises(IntegrityError):
            CartItem.objects.create(
                cart=self.cart,
                product=self.product,
                quantity=2
            )

    def test_cart_item_subtotal_calculation(self):
        cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=3
        )
        expected_subtotal = Decimal('30.00')  # 3 * 10.00
        self.assertEqual(cart_item.get_subtotal(), expected_subtotal)

    def test_cart_item_str_representation(self):
        cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2
        )
        expected_str = f"2x {self.product.name} in Cart {self.cart.id}"
        self.assertEqual(str(cart_item), expected_str)

    def test_cart_item_quantity_must_be_positive(self):
        with self.assertRaises(IntegrityError):
            CartItem.objects.create(
                cart=self.cart,
                product=self.product,
                quantity=-1
            )