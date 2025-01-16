from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from .models import Payment, Refund
from ..orders.models import Order
from ..products.models import Product
from .serializers import PaymentSerializer, RefundSerializer
import base64
from datetime import datetime
import requests

from django.core.exceptions import ObjectDoesNotExist



class InitiateMpesaPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def generate_access_token(self):
        consumer_key = settings.MPESA_CONSUMER_KEY
        consumer_secret = settings.MPESA_CONSUMER_SECRET
        auth_string = f"{consumer_key}:{consumer_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_base64 = base64.b64encode(auth_bytes)
        headers = {
            'Authorization': f'Basic {auth_base64.decode("utf-8")}'
        }

        response = requests.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', headers=headers)

        return response.json()['access_token']
    
    def post(self, request):
        order_id = request.data.get('order_id')
        amount = request.data.get('amount')
        phone_number = request.data.get('phone_number')

        if not all(order_id, amount, phone_number):
            return Response({'message': 'Please provide all required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        access_token = self.generate_access_token()

        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        business_short_code = settings.MPESA_SHORTCODE
        password = base64.b64encode(
            f"{business_short_code}{settings.MPESA_PASSKEY}{timestamp}".encode()
        ).decode('ascii')
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }
        
        payload = {
            'BusinessShortCode': business_short_code,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': amount,
            'PartyA': phone_number,
            'PartyB': business_short_code,
            'PhoneNumber': phone_number,
            'CallBackURL': f"{settings.BASE_URL}/api/payments/callback/",
            'AccountReference': f"Order_{order_id}",
            'TransactionDesc': f"Payment for order {order_id}"
        }
        
        response = requests.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            json=payload,
            headers=headers
        )
        
        if response.status_code == 200:
            payment = Payment.objects.create(
                order_id=order_id,
                amount=amount,
                payment_method='MPESA',
                status='PENDING',
                transaction_id=response.json().get('CheckoutRequestID')
            )
            
            return Response({
                'message': 'Payment initiated successfully',
                'payment_id': payment.id,
                'checkout_request_id': response.json().get('CheckoutRequestID')
            })
            
        return Response({
            'error': 'Failed to initiate payment',
            'details': response.json()
        }, status=status.HTTP_400_BAD_REQUEST)
    
class MpesaCallbackView(APIView):
    def post(self, request):
        callback_data = request.data.get('Body', {}).get('stkCallback', {})
        checkout_request_id = callback_data.get('CheckoutRequestID')
        
        try:
            payment = Payment.objects.get(transaction_id=checkout_request_id)
            
            if callback_data.get('ResultCode') == 0:
                payment.status = 'COMPLETED'
                payment.save()
                
                return Response({
                    'message': 'Payment completed successfully'
                })
            else:
                payment.status = 'FAILED'
                payment.save()
                
                return Response({
                    'message': 'Payment failed',
                    'reason': callback_data.get('ResultDesc')
                })
                
        except Payment.DoesNotExist:
            return Response({
                'error': 'Payment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
class PaymentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):

        if request.user.user_type == 'VENDOR':
            try:
                # Get the vendor profile
                vendor_profile = request.user.vendor_profile
                
                # Get products
                vendor_products = Product.objects.filter(vendor=vendor_profile)

                
                # Get orders
                vendor_orders = Order.objects.filter(
                    items__product__in=vendor_products
                ).distinct()
                
                # Get payments
                payments = Payment.objects.filter(order__in=vendor_orders)

                
                serializer = PaymentSerializer(payments, many=True)
                return Response(serializer.data)
                
            except ObjectDoesNotExist as e:
                return Response({
                    'error': 'Vendor profile or related data not found',
                    'detail': str(e)
                }, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({
                    'error': 'An unexpected error occurred',
                    'detail': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            try:
                payments = Payment.objects.filter(order__customer=request.user)
                serializer = PaymentSerializer(payments, many=True)
                return Response(serializer.data)
            except Exception as e:

                return Response({
                    'error': 'Error retrieving customer payments',
                    'detail': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaymentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id)
            serializer = PaymentSerializer(payment)
            return Response(serializer.data)
        except Payment.DoesNotExist:
            return Response({
                'error': 'Payment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        

class RefundView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id)
            
            if payment.status != 'COMPLETED':
                return Response({
                    'error': 'Cannot refund incomplete payment'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            amount = request.data.get('amount')
            reason = request.data.get('reason')
            
            if not all([amount, reason]):
                return Response({
                    'error': 'Missing required parameters'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            refund = Refund.objects.create(
                payment=payment,
                amount=amount,
                reason=reason,
                refund_id=f"REF_{payment.transaction_id}"
            )
            
            payment.status = 'REFUNDED'
            payment.save()
            
            serializer = RefundSerializer(refund)
            return Response(serializer.data)
            
        except Payment.DoesNotExist:
            return Response({
                'error': 'Payment not found'
            }, status=status.HTTP_404_NOT_FOUND)