from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer
from django_filters.rest_framework import DjangoFilterBackend 

class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'created_at']
    search_fields = ['id', 'tracking_number', 'shipping_address']
    ordering_fields = ['created_at', 'updated_at', 'total_amount']
    ordering = ['-created_at']

    def get_queryset(self):
        #if user is staff show all orders otherwise only show user order
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(customer=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(customer=self.request.user)
    

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)
    
    def patch(self, request):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)