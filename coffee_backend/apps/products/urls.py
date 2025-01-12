from django.urls import path
from . import views

urlpatterns = [
    # Product URLs
    path('products/', views.ProductListCreateView.as_view(), name='product-list'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    
    # Review URLs
    path('products/<int:product_pk>/reviews/', views.ReviewListCreateView.as_view(), name='review-list'),
    path('products/<int:product_pk>/reviews/<int:review_pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
]