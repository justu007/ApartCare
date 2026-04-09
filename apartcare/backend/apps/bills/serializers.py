from .models import Bill
from rest_framework import serializers
from apps.apartment.models import Flat
class BillSerializer(serializers.ModelSerializer):
    flat_name = serializers.CharField(source='flat.name', read_only=True)
    block_name = serializers.CharField(source = 'flat.block.name',read_only=True)
    user_name = serializers.SerializerMethodField()
    class Meta:
        model = Bill
        fields = [
            'id',
            'flat',
            'flat_name',
            'user_name',
            'block_name',
            'bill_type',
            'amount',
            'fine_amount',
            'total_amount',
            'due_date',
            'billing_month',
            'billing_year',
            'status',
            'created_at'
        ]
        read_only_fields = ['total_amount', 'created_at']

    def get_user_name(self, obj):
        if not obj.flat:
            return "Unoccupied"

        try:
            
            profiles = obj.flat.adminresident_profile_set.all()
            
            if profiles.exists():
                active_profile = profiles.filter(status='ACTIVE').first() or profiles.first()
                if active_profile and active_profile.user:
                    return active_profile.user.name

        except Exception as e:
            print(f"DEBUG: Error finding resident for Flat {obj.flat.id}: {e}")
            
        return "Unoccupied"
    
class OccupiedFlatSerializer(serializers.ModelSerializer):
    block_name = serializers.CharField(source='block.name', read_only=True)
    
    resident_name = serializers.SerializerMethodField()

    class Meta:
        model = Flat
        fields = ['id', 'name', 'block_name', 'resident_name']

    def get_resident_name(self, obj):
        active_profile = obj.adminresident_profile_set.filter(status='ACTIVE').first()
        if active_profile and active_profile.user:
            return active_profile.user.name
        return "Unknown"