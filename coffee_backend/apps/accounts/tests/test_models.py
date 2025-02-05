from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from ..models import User, VendorProfile
from decimal import Decimal
import os

class UserModelTest(TestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'user_type': 'CUSTOMER',
            'phone_number': '+1234567890',
            'address': '123 Test St, Test City'
        }

    def test_create_user(self):
        user = User.objects.create_user(**self.user_data)
        self.assertIsInstance(user, User)
        self.assertEqual(user.username, self.user_data['username'])
        self.assertEqual(user.email, self.user_data['email'])
        self.assertEqual(user.user_type, 'CUSTOMER')
        self.assertTrue(user.check_password('testpass123'))

    def test_user_type_choices(self):
        # Test valid user types
        user1 = User.objects.create_user(**self.user_data)
        user2 = User.objects.create_user(
            username='vendor1',
            password='testpass123',
            email='vendor@example.com',
            user_type='VENDOR'
        )
        
        self.assertEqual(user1.user_type, 'CUSTOMER')
        self.assertEqual(user2.user_type, 'VENDOR')

        # Test invalid user type
        invalid_user = User(
            username='invalid',
            password='testpass123',
            email='invalid@example.com',
            user_type='INVALID'
        )
        with self.assertRaises(ValidationError):
            invalid_user.full_clean()

    def test_phone_number_validation(self):
        # Test valid phone numbers
        valid_numbers = ['+1234567890', '1234567890', '+911234567890']
        for number in valid_numbers:
            user = User(
                username=f'user_{number}',
                password='testpass123',
                email=f'user_{number}@example.com',
                user_type='CUSTOMER',
                phone_number=number
            )
            user.full_clean()  # Should not raise ValidationError

        # Test invalid phone numbers
        invalid_numbers = ['123', 'abc1234567', '+123abc4567']
        for number in invalid_numbers:
            user = User(
                username=f'user_{number}',
                password='testpass123',
                email=f'user_{number}@example.com',
                user_type='CUSTOMER',
                phone_number=number
            )
            with self.assertRaises(ValidationError):
                user.full_clean()

    def test_timestamps(self):
        user = User.objects.create_user(**self.user_data)
        self.assertIsNotNone(user.created_at)
        self.assertIsNotNone(user.updated_at)
        
        # Test updated_at changes on save
        original_updated_at = user.updated_at
        user.address = 'New Address'
        user.save()
        self.assertGreater(user.updated_at, original_updated_at)

class VendorProfileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='vendoruser',
            password='testpass123',
            email='vendor@example.com',
            user_type='VENDOR'
        )
        self.profile_data = {
            'user': self.user,
            'business_name': 'Test Business',
            'business_description': 'A test business description',
            'business_address': '123 Business St, Business City',
            'is_verified': False,
            'rating': Decimal('0.00')
        }

    def test_create_vendor_profile(self):
        profile = VendorProfile.objects.create(**self.profile_data)
        self.assertIsInstance(profile, VendorProfile)
        self.assertEqual(profile.business_name, self.profile_data['business_name'])
        self.assertEqual(profile.user, self.user)

    def test_vendor_profile_string_representation(self):
        profile = VendorProfile.objects.create(**self.profile_data)
        self.assertEqual(str(profile), self.profile_data['business_name'])

    def test_business_logo_upload(self):
        # Create a test image file
        logo_content = b'fake-image-content'
        logo = SimpleUploadedFile(
            name='test_logo.jpg',
            content=logo_content,
            content_type='image/jpeg'
        )
        
        profile = VendorProfile.objects.create(
            **self.profile_data,
            business_logo=logo
        )
        
        self.assertTrue(profile.business_logo.name.startswith('vendor_logos/'))
        self.assertTrue(profile.business_logo.name.endswith('.jpg'))
        
        # Cleanup uploaded file
        if profile.business_logo:
            profile.business_logo.delete()

    def test_timestamps(self):
        profile = VendorProfile.objects.create(**self.profile_data)
        self.assertIsNotNone(profile.created_at)
        self.assertIsNotNone(profile.updated_at)
        
        # Test updated_at changes on save
        original_updated_at = profile.updated_at
        profile.business_description = 'Updated description'
        profile.save()
        self.assertGreater(profile.updated_at, original_updated_at)

    def tearDown(self):
        # Clean up any files created during tests
        for profile in VendorProfile.objects.all():
            if profile.business_logo:
                profile.business_logo.delete()