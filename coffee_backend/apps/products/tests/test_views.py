from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from ...accounts.models import User
from ..models import Product, ProductReview, Category
from ...accounts.models import VendorProfile
from decimal import Decimal

class ProductViewsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create users
        self.vendor_user = User.objects.create_user(email='vendor@test.com', username='vendor', password='testpass')
        
        # Create vendor profile
        self.vendor_profile = VendorProfile.objects.create(user=self.vendor_user)
        
        # Create category
        self.category = Category.objects.create(name='Test Category')
        
        # Create product
        self.product = Product.objects.create(
            vendor=self.vendor_profile,
            category=self.category,
            name='Test Product',
            description='Test Description',
            price=Decimal('19.99'),
            stock=10,
            roast_type='LIGHT',
            origin='Test Origin',
            image='test_image.jpg',
            is_available=True
        )

    def test_product_list_view(self):
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class ProductReviewViewsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create users
        self.review_user = User.objects.create_user(email='reviewer@test.com', username='reviewer', password='testpass')
        
        # Create vendor and product
        vendor_user = User.objects.create_user(email='vendor@test.com', username='vendor', password='testpass')
        vendor_profile = VendorProfile.objects.create(user=vendor_user)
        category = Category.objects.create(name='Test Category')
        
        self.product = Product.objects.create(
            vendor=vendor_profile,
            category=category,
            name='Test Product',
            description='Test Description',
            price=Decimal('19.99'),
            stock=10,
            roast_type='LIGHT',
            origin='Test Origin',
            image='test_image.jpg'
        )

    def test_review_create(self):
        url = reverse('review-list', kwargs={'product_pk': self.product.id})
        self.client.force_authenticate(user=self.review_user)
        
        review_data = {
            'rating': 4,
            'comment': 'Great product!'
        }
        
        response = self.client.post(url, review_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_duplicate_review_prevention(self):
        # Create first review
        ProductReview.objects.create(
            product=self.product,
            user=self.review_user,
            rating=4,
            comment='First review'
        )
        
        # Attempt second review
        url = reverse('review-list', kwargs={'product_pk': self.product.id})
        self.client.force_authenticate(user=self.review_user)
        
        review_data = {
            'rating': 5,
            'comment': 'Second review attempt'
        }
        
        response = self.client.post(url, review_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

