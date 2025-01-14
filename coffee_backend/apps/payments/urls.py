# apps/payments/urls.py

from django.urls import path
from . import views



urlpatterns = [
    path('initiate/', views.InitiateMpesaPaymentView.as_view(), name='initiate-payment'),
    path('callback/', views.MpesaCallbackView.as_view(), name='mpesa-callback'),
    path('payments/<int:payment_id>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    path('payments/<int:payment_id>/refund/', views.RefundView.as_view(), name='refund-payment'),
]