from rest_framework import serializers
from .models import Issue, IssueImage

class IssueImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueImage
        fields = ['id', 'image', 'uploaded_at']

class IssueSerializer(serializers.ModelSerializer):
    creator_name = serializers.ReadOnlyField(source='creator.name')
    creator_email = serializers.ReadOnlyField(source='creator.email')
    creator_phone = serializers.ReadOnlyField(source='creator.phone')
    
    creator_flat = serializers.ReadOnlyField(source='creator.resident_profile.flat.name')
    creator_block = serializers.ReadOnlyField(source='creator.resident_profile.block.name')
    
    assigned_staff_name = serializers.ReadOnlyField(source='assigned_staff.name')
    assigned_staff_phone = serializers.ReadOnlyField(source='assigned_staff.phone')
    assigned_staff_email = serializers.ReadOnlyField(source='assigned_staff.email')
    assigned_staff_designation = serializers.ReadOnlyField(source='assigned_staff.staff_profile.designation')
    
    uploaded_images = IssueImageSerializer(source='images', many=True, read_only=True)

    class Meta:
        model = Issue
        fields = [
            'id', 
            'creator', 'creator_name', 'creator_email', 'creator_phone', 
            'creator_flat', 'creator_block', 
            'assigned_staff', 'assigned_staff_name','assigned_staff_phone','assigned_staff_email','assigned_staff_designation',
            'title', 'description', 'category', 'priority', 
            'status', 'created_at', 'updated_at',
            'uploaded_images' 
        ]
        read_only_fields = ['creator', 'created_at', 'updated_at']