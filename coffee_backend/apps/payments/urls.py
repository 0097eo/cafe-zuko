# apps/payments/urls.py

from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Will be populated with views for:
    # - Create payment
    # - Payment webhook
    # - Payment status
]