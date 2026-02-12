from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from apps.admin_panel.models import StaffProfile,AdminResident_Profile
from apps.apartment.models import Flat,Block
from datetime import date


class AdminCreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True)
  
    class Meta:
        model = User
        fields = [
            'name',
            'email',
            'phone',
            'role',
            'password'
        ]
        
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        if user.role == 'STAFF':
            StaffProfile.objects.create(
                user=user,
                designation="Not Assigned",
                monthly_salary=0,
                joining_date=date.today(),
                status="ACTIVE"
            )
        elif user.role == 'RESIDENT':
            AdminResident_Profile.objects.create(
                user=user,
                created_date = date.today(),
                status="ACTIVE"
            )

        return user 
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(email=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        refresh = RefreshToken.for_user(user)

        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
        }