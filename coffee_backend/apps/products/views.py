from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import Product, ProductReview
from .serializers import ProductSerializer, ProductReviewSerializer

class IsVendorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return hasattr(request.user, 'vendorprofile')

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.vendor == request.user.vendorprofile

class IsReviewOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user

# Product Views
class ProductListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsVendorOrReadOnly]

    def get(self, request):
        queryset = Product.objects.all()
        if not request.user.is_staff:
            queryset = queryset.filter(is_available=True)
        
        # Apply filters
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__id=category)
            
        vendor = request.query_params.get('vendor')
        if vendor:
            queryset = queryset.filter(vendor__id=vendor)
            
        roast = request.query_params.get('roast')
        if roast:
            queryset = queryset.filter(roast_type=roast)
        
        serializer = ProductSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(vendor=request.user.vendorprofile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsVendorOrReadOnly]

    def get_object(self, pk):
        return get_object_or_404(Product, pk=pk)

    def get(self, request, pk):
        product = self.get_object(pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    def put(self, request, pk):
        product = self.get_object(pk)
        self.check_object_permissions(request, product)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = self.get_object(pk)
        self.check_object_permissions(request, product)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Review Views
class ReviewListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, product_pk):
        reviews = ProductReview.objects.filter(product_id=product_pk)
        serializer = ProductReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, product_pk):
        product = get_object_or_404(Product, pk=product_pk)
        
        # Check if user already reviewed this product
        if ProductReview.objects.filter(product=product, user=request.user).exists():
            return Response(
                {"detail": "You have already reviewed this product."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = ProductReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReviewDetailView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsReviewOwnerOrReadOnly]

    def get_object(self, product_pk, review_pk):
        return get_object_or_404(ProductReview, product_id=product_pk, pk=review_pk)

    def get(self, request, product_pk, review_pk):
        review = self.get_object(product_pk, review_pk)
        serializer = ProductReviewSerializer(review)
        return Response(serializer.data)

    def put(self, request, product_pk, review_pk):
        review = self.get_object(product_pk, review_pk)
        self.check_object_permissions(request, review)
        serializer = ProductReviewSerializer(review, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, product_pk, review_pk):
        review = self.get_object(product_pk, review_pk)
        self.check_object_permissions(request, review)
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)