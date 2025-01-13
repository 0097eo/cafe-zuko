from django.contrib import admin
from .models import User, VendorProfile

# Register your models here.
admin.site.register(User)
admin.site.register(VendorProfile)
