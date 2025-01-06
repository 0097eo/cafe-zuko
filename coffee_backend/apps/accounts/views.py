from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import VendorProfile
from .serializers import UserSerializer, VendorProfileSerializer

class SignupView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user.user_type == 'VENDOR':
                VendorProfile.objects.create(
                    user=user,
                    business_name=request.data.get('business_name', ''),
                    business_description=request.data.get('business_description', ''),
                    business_address=request.data.get('business_address', '')
                )
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            serializer = UserSerializer(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': serializer.data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        user_serializer = UserSerializer(user)
        data = user_serializer.data
        
        if user.user_type == 'VENDOR':
            vendor_profile = user.vendor_profile
            vendor_serializer = VendorProfileSerializer(vendor_profile)
            data['vendor_profile'] = vendor_serializer.data
            
        return Response(data)

    def put(self, request):
        user = request.user
        user_serializer = UserSerializer(user, data=request.data, partial=True)
        
        if user_serializer.is_valid():
            user_serializer.save()
            
            if user.user_type == 'VENDOR' and 'vendor_profile' in request.data:
                vendor_serializer = VendorProfileSerializer(
                    user.vendor_profile,
                    data=request.data['vendor_profile'],
                    partial=True
                )
                if vendor_serializer.is_valid():
                    vendor_serializer.save()
                    
            return Response(user_serializer.data)
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
