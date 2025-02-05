from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from ..models import VendorProfile
import json

User = get_user_model()

class AuthViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.signup_url = reverse('signup')
        self.login_url = reverse('login')
        self.profile_url = reverse('profile')
        
        # Test user data
        self.user_data = {
            'username': 'testuser',
            'password': 'testpass123',
            'email': 'test@example.com',
            'user_type': 'CUSTOMER'
        }
        
        self.vendor_data = {
            'username': 'vendoruser',
            'password': 'vendorpass123',
            'email': 'vendor@example.com',
            'user_type': 'VENDOR',
            'business_name': 'Test Business',
            'business_description': 'Test Description',
            'business_address': 'Test Address'
        }

    def test_customer_signup(self):
        response = self.client.post(self.signup_url, self.user_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], self.user_data['username'])
        self.assertEqual(response.data['user']['user_type'], 'CUSTOMER')
        
        # Verify user was created in database
        self.assertTrue(User.objects.filter(username=self.user_data['username']).exists())

    def test_vendor_signup(self):
        response = self.client.post(self.signup_url, self.vendor_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
        # Verify vendor profile was created
        user = User.objects.get(username=self.vendor_data['username'])
        vendor_profile = VendorProfile.objects.get(user=user)
        self.assertEqual(vendor_profile.business_name, self.vendor_data['business_name'])
        self.assertEqual(vendor_profile.business_description, self.vendor_data['business_description'])
        self.assertEqual(vendor_profile.business_address, self.vendor_data['business_address'])

    def test_signup_invalid_data(self):
        # Test missing required field
        invalid_data = self.user_data.copy()
        del invalid_data['username']
        response = self.client.post(self.signup_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        # Create user first
        User.objects.create_user(
            username=self.user_data['username'],
            password=self.user_data['password'],
            email=self.user_data['email']
        )
        
        # Attempt login
        response = self.client.post(self.login_url, {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], self.user_data['username'])

    def test_login_invalid_credentials(self):
        response = self.client.post(self.login_url, {
            'username': 'wronguser',
            'password': 'wrongpass'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class ProfileViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.profile_url = reverse('profile')
        
        # Create a regular user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com',
            user_type='CUSTOMER'
        )
        
        # Create a vendor user
        self.vendor = User.objects.create_user(
            username='vendoruser',
            password='vendorpass123',
            email='vendor@example.com',
            user_type='VENDOR'
        )
        
        # Create vendor profile
        self.vendor_profile = VendorProfile.objects.create(
            user=self.vendor,
            business_name='Test Business',
            business_description='Test Description',
            business_address='Test Address'
        )

    def test_get_customer_profile(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['user_type'], 'CUSTOMER')
        self.assertNotIn('vendor_profile', response.data)

    def test_get_vendor_profile(self):
        self.client.force_authenticate(user=self.vendor)
        response = self.client.get(self.profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.vendor.username)
        self.assertEqual(response.data['user_type'], 'VENDOR')
        self.assertIn('vendor_profile', response.data)
        self.assertEqual(response.data['vendor_profile']['business_name'], 'Test Business')

    def test_update_customer_profile(self):
        self.client.force_authenticate(user=self.user)
        update_data = {
            'email': 'newemail@example.com'
        }
        response = self.client.put(self.profile_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'newemail@example.com')
        
        # Verify database was updated
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'newemail@example.com')

    def test_update_vendor_profile(self):
        self.client.force_authenticate(user=self.vendor)
        update_data = {
            'email': 'newvendor@example.com',
            'vendor_profile': {
                'business_name': 'Updated Business Name',
                'business_description': 'Updated Description'
            }
        }
        response = self.client.put(self.profile_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'newvendor@example.com')
        
        # Verify vendor profile was updated
        self.vendor_profile.refresh_from_db()
        self.assertEqual(self.vendor_profile.business_name, 'Updated Business Name')
        self.assertEqual(self.vendor_profile.business_description, 'Updated Description')

    def test_unauthorized_access(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)