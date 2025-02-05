from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from decimal import Decimal
from django.utils import timezone
from ...accounts.models import User, VendorProfile
from ..models import Category, Product, ProductReview

class CategoryModelTest(TestCase):
    def test_category_creation(self):
        category = Category.objects.create(
            name="Espresso Beans",
            description="Premium espresso coffee beans"
        )
        
        self.assertEqual(category.name, "Espresso Beans")
        self.assertEqual(category.description, "Premium espresso coffee beans")
        self.assertIsNotNone(category.created_at)
        self.assertIsNotNone(category.updated_at)

    def test_category_str_method(self):
        category = Category.objects.create(name="Light Roast")
        self.assertEqual(str(category), "Light Roast")

class ProductModelTest(TestCase):
    def setUp(self):
        # Create necessary related objects
        self.user = User.objects.create_user(username='testvendor', password='12345')
        self.vendor = VendorProfile.objects.create(user=self.user)
        self.category = Category.objects.create(name="Coffee Beans")

    def test_product_creation(self):
        product = Product.objects.create(
            vendor=self.vendor,
            category=self.category,
            name="Ethiopian Yirgacheffe",
            description="Bright and floral coffee",
            price=Decimal('19.99'),
            stock=50,
            roast_type='LIGHT',
            origin='Ethiopia',
            image='test_image.jpg'  # Note: You might need to mock Cloudinary field
        )
        
        self.assertEqual(product.name, "Ethiopian Yirgacheffe")
        self.assertEqual(product.price, Decimal('19.99'))
        self.assertEqual(product.stock, 50)
        self.assertEqual(product.roast_type, 'LIGHT')

    def test_product_str_method(self):
        product = Product.objects.create(
            vendor=self.vendor,
            category=self.category,
            name="Colombian Supremo",
            description="Rich and smooth",
            price=Decimal('15.50'),
            stock=30,
            roast_type='MEDIUM',
            origin='Colombia',
            image='test_image.jpg'
        )
        self.assertEqual(str(product), "Colombian Supremo")

class ProductReviewModelTest(TestCase):
    def setUp(self):
        # Create necessary related objects
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.vendor = VendorProfile.objects.create(user=self.user)
        self.category = Category.objects.create(name="Coffee Beans")
        self.product = Product.objects.create(
            vendor=self.vendor,
            category=self.category,
            name="Test Product",
            description="Test Description",
            price=Decimal('10.00'),
            stock=100,
            roast_type='DARK',
            origin='Test Origin',
            image='test_image.jpg'
        )

    def test_product_review_creation(self):
        review = ProductReview.objects.create(
            product=self.product,
            user=self.user,
            rating=4,
            comment="Great coffee!"
        )
        
        self.assertEqual(review.rating, 4)
        self.assertEqual(review.comment, "Great coffee!")
        self.assertIsNotNone(review.created_at)
        self.assertIsNotNone(review.updated_at)

    def test_unique_review_constraint(self):
        # Create first review
        ProductReview.objects.create(
            product=self.product,
            user=self.user,
            rating=4,
            comment="First review"
        )
        
        # Attempt to create a second review by the same user for the same product should fail
        with self.assertRaises(Exception):
            ProductReview.objects.create(
                product=self.product,
                user=self.user,
                rating=5,
                comment="Second review"
            )