from rest_framework import serializers
from .models import Issue,IssueImage

class IssueImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueImage
        fields = ['id', 'image', 'uploaded_at']

class IssueSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='creator.name', read_only=True)
    creator_flat = serializers.CharField(source='creator.flat', read_only=True)
    assigned_staff_name = serializers.CharField(source='assigned_staff.name', read_only=True)
    
    uploaded_images = IssueImageSerializer(source='images', many=True, read_only=True)

    class Meta:
        model = Issue
        fields = [
            'id', 'creator', 'creator_name', 'creator_flat', 
            'assigned_staff', 'assigned_staff_name',
            'title', 'description', 'category', 'priority', 
            'status', 'created_at', 'updated_at',
            'uploaded_images' 
        ]
        read_only_fields = ['creator', 'created_at', 'updated_at']