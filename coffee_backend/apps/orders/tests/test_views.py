from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from ..models import Order


User = get_user_model()

class OrderListCreateViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.regular_user = User.objects.create_user(
            username='regularuser', 
            password='testpass123'
        )
        self.staff_user = User.objects.create_user(
            username='staffuser', 
            password='testpass123', 
            is_staff=True
        )
        self.sample_order = Order.objects.create(
            customer=self.regular_user,
            status='pending',
            tracking_number='TEST123',
            shipping_address='123 Test St',
            total_amount=100.00
        )

    def test_unauthenticated_access_forbidden(self):
        url = reverse('order-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_user_sees_all_orders(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse('order-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

    def test_regular_user_sees_only_own_orders(self):
        self.client.force_authenticate(user=self.regular_user)
        url = reverse('order-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)
        for order in response.data:
            self.assertEqual(order['customer'], self.regular_user.id)


class OrderDetailViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.regular_user = User.objects.create_user(
            username='regularuser', 
            password='testpass123'
        )
        self.staff_user = User.objects.create_user(
            username='staffuser', 
            password='testpass123', 
            is_staff=True
        )
        self.sample_order = Order.objects.create(
            customer=self.regular_user,
            status='pending',
            tracking_number='TEST123',
            shipping_address='123 Test St',
            total_amount=100.00
        )

    def test_unauthenticated_access_forbidden(self):
        url = reverse('order-detail', kwargs={'pk': self.sample_order.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_regular_user_can_access_own_order(self):
        self.client.force_authenticate(user=self.regular_user)
        url = reverse('order-detail', kwargs={'pk': self.sample_order.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.sample_order.id)

    def test_regular_user_cannot_access_other_users_order(self):
        other_user = User.objects.create_user(
            username='otheruser', 
            password='testpass123'
        )
        self.client.force_authenticate(user=other_user)
        url = reverse('order-detail', kwargs={'pk': self.sample_order.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_staff_user_can_access_any_order(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse('order-detail', kwargs={'pk': self.sample_order.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.sample_order.id)
