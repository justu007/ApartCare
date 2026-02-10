from rest_framework import serializers
from apps.accounts.models import User
from django.contrib.auth import authenticate
from .models import AdminResident_Profile,StaffProfile

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
        source='staff_profile.status',
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
            'status'
        ]



class AdminResidentListSerializer(serializers.ModelSerializer):

    flat = serializers.CharField(
        source='resident_profile.flat.name',
        read_only=True,
        allow_null=True
    )

    block = serializers.CharField(
        source='resident_profile.block.name',
        read_only=True,
        allow_null=True
    )

    created_date = serializers.DateField(
        source='resident_profile.created_date',
        read_only=True
    )

    status = serializers.CharField(
        source='resident_profile.status',
        read_only=True
    )

    class Meta:
        model = User
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'flat',
            'block',
            'created_date',
            'status'
        ]


class AdminUpdateUserInfo(serializers.ModelSerializer):
    class Meta:
        model= User
        fields = [
            'name',
            'email',
            'phone',
            'is_active'
        ]


class AdminUpdateStaffProfile(serializers.ModelSerializer):
    class Meta:
        model= StaffProfile
        fields = [

            'designation',
            'monthly_salary',
            'status'
        ]
