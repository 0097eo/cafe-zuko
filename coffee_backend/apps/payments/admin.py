from django.contrib import admin
from .models import Payment, Refund

# Register your models here.
admin.site.register(Payment)
admin.site.register(Refund)


class PaymentAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'amount', 'payment_method', 'status', 'created_at', 'updated_at')
    search_fields = ('transaction_id', 'amount', 'payment_method', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at', 'updated_at')
