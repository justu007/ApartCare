from .models import SalaryPayment, Transaction
from rest_framework import serializers


class SalaryPaymentSerializer(serializers.ModelSerializer):
    staff_name = serializers.ReadOnlyField(source='staff.name')
    
    class Meta:
        model = SalaryPayment
        fields = ['id', 'staff_name', 'month', 'year', 'amount', 'status', 'transaction_id', 'paid_at']




class TransactionSerializer(serializers.ModelSerializer):
    payer_name = serializers.CharField(source='payer.name', read_only=True, default="System/Guest")
    payee_name = serializers.CharField(source='payee.name', read_only=True, default="Community/System")

    class Meta:
        model = Transaction
        fields = [
            'id', 'payer_name', 'payee_name', 'amount', 
            'purpose', 'payment_gateway', 'status', 'created_at'
        ]