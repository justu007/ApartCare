from rest_framework import serializers
from apps.accounts.models import User
from .models import Community,Block,Flat
from django.contrib.auth import authenticate
from apps.admin_panel.models import AdminResident_Profile,StaffProfile

class AdminCreateCommunity(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = [
            'id',
            'name',
            'address',
            'created_at'
        ]
        read_only_fields = ["id", "created_at"]

class AdminCreateBlock(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = [
            'id',
            'name',
            'community',
            'created_at'
        ]

class AdminCreateFlat(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = [
            'id',
            'name',
            'block',
            'created_at'
        ]
