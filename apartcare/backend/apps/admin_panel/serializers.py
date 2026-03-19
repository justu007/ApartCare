from rest_framework import serializers
from apps.accounts.models import User
from django.contrib.auth import authenticate
from .models import AdminResident_Profile,StaffProfile
from apps.apartment.models import Flat, Block
from apps.apartment.models import Community
from django.contrib.auth import get_user_model

User = get_user_model()
class AdminStaffListSerializer(serializers.ModelSerializer):

    designation = serializers.CharField(
        source='staff_profile.designation',
        read_only=True
    )

    monthly_salary = serializers.DecimalField(
        source='staff_profile.monthly_salary',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    joining_date = serializers.DateField(
        source='staff_profile.joining_date',
        read_only=True
    )

    status = serializers.CharField(
        source='get_is_active_display',
        read_only=True
    )

    class Meta:
        model = User
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'designation',
            'monthly_salary',
            'joining_date',
            'status',
            'is_active'
            
        ]



class AdminResidentListSerializer(serializers.ModelSerializer):
    flat = serializers.CharField(source='resident_profile.flat.name', read_only=True)
    block = serializers.CharField(source='resident_profile.flat.block.name', read_only=True)
    created_date = serializers.DateField(source='resident_profile.created_date', read_only=True)
    status = serializers.CharField(source='get_is_active_display', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'flat', 'block', 'created_date','is_active', 'status']
        

class AdminUpdateUserInfo(serializers.ModelSerializer):
    class Meta:
        model= User
        fields = [
            'name',
            'email',
            'phone',
            'is_active',
            'community'
        ]


class AdminUpdateStaffProfile(serializers.ModelSerializer):
    status = serializers.CharField(source='get_is_active_display', read_only=True)
    class Meta:
        model= StaffProfile
        fields = [

            'designation',
            'monthly_salary',
            'status'
   
        ]
class AdminUpdateResidentProfile(serializers.ModelSerializer):
    class Meta:
        model = AdminResident_Profile
        fields = ['flat', 'block', 'status']

    def validate(self, data):
        flat = data.get("flat")
        if flat and flat.occupied and flat.resident != self.instance.user:
            raise serializers.ValidationError({'flat': "This flat is already occupied."})
        return data

    def update(self, instance, validated_data):
        old_flat = instance.flat
        new_flat = validated_data.get('flat', old_flat)

        if new_flat:
            instance.block = new_flat.block
        elif 'flat' in validated_data and new_flat is None:
            instance.block = None

        instance = super().update(instance, validated_data)

        if old_flat and old_flat != new_flat:
            old_flat.occupied = False
            old_flat.resident = None  
            old_flat.save()


        if new_flat:
            new_flat.occupied = True
            new_flat.resident = instance.user  
            new_flat.save()

        return instance

class NestedFlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flat
        fields = ['id', 'name']

class NestedBlockSerializer(serializers.ModelSerializer):

    flats = NestedFlatSerializer(many=True, read_only=True) 

    class Meta:
        model = Block
        fields = ['id', 'name', 'flats']

class CommunityDetailsSerializer(serializers.ModelSerializer):
    blocks = NestedBlockSerializer(many=True, read_only=True)

    class Meta:
        model = Community
        fields = ['id', 'name', 'address', 'blocks']






class AdminForceResetSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, min_length=8)

