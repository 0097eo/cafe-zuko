from django.contrib import admin
from.models import Category, Product, ProductReview

# Register your models here.
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(ProductReview)

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'vendor', 'category', 'price', 'stock', 'roast_type', 'origin', 'is_available', 'created_at', 'updated_at')
    search_fields = ('name', 'vendor', 'category', 'price', 'stock', 'roast_type', 'origin', 'is_available', 'created_at', 'updated_at')
    list_filter = ('vendor', 'category', 'roast_type', 'is_available', 'created_at', 'updated_at')

