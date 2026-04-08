from .models import Bill
from rest_framework import serializers

class BillSerializer(serializers.ModelSerializer):
    flat_name = serializers.CharField(source='flat.name', read_only=True)
    block_name = serializers.CharField(source = 'flat.block.name',read_only=True)

    class Meta:
        model = Bill
        fields = [
            'id',
            'flat',
            'flat_name',
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