from rest_framework import serializers
from apps.apartment.models import Community
from apps.accounts.models import User
from django.db import transaction
from .models import CommunitySubscription, SaaSPaymentLedger
import datetime

class CreateCommunityAdmin(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    address = serializers.CharField(max_length=255)
    admin_name = serializers.CharField(max_length=255)
    admin_email = serializers.EmailField()
    admin_password = serializers.CharField(write_only=True)

    class Meta:
        model = Community
        fields = [
            'name',
            'address',
            'admin_name',
            'admin_email',
            'admin_password'
        ]
        
    @transaction.atomic
    def create(self, validated_data):
        raw_password = validated_data['admin_password']


        community_admin = User.objects.create_admin_user(
            email=validated_data['admin_email'],
            password=raw_password,
            name=validated_data['admin_name']
        )

        community = Community.objects.create(
            name=validated_data['name'],
            address=validated_data['address'],
            admin=community_admin,
            is_active=True
        )

        community_admin.community = community
        community_admin.save()

        return {
            "community": community,
            "admin": community_admin,
            "clear_text_password": raw_password
        }


class CommunityAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "phone"]



class CommunityListSerializer(serializers.ModelSerializer):
    admin = CommunityAdminSerializer(read_only=True)

    class Meta:
        model = Community
        fields = ["id", "name", "address", "admin", "is_active"]



class CommunityUpdateSerializer(serializers.ModelSerializer):

    admin = CommunityAdminSerializer()

    class Meta:
        model = Community
        fields = ["name", "address", "admin"]

    def update(self, instance, validated_data):

        admin_data = validated_data.pop("admin", None)
        with transaction.atomic():
            if admin_data:
                admin = instance.admin

                for attr, value in admin_data.items():
                    setattr(admin, attr, value)

                admin.save()

            return super().update(instance, validated_data)


class SaasPaymentLedgerSerializer(serializers.ModelSerializer):
    invoice_number = serializers.SerializerMethodField()

    class Meta:
        model = SaaSPaymentLedger
        fields = [
                 'id',
                 'invoice_number',
                 'amount_paid',
                 'transaction_id',
                 'payment_date',
                 'status'
        ]

    def get_invoice_number(self, obj):
        if obj.payment_date:
            year = obj.payment_date.strftime('%Y')
        else:
            year = datetime.date.today().year
        return f"INV-{year}-{obj.id:05d}"
    
class CommunitySubscriptionDetailSerializer(serializers.ModelSerializer):
    community_name = serializers.CharField(source = 'community.name' , read_only=True)
    invoices = serializers.SerializerMethodField()
    days_remaining = serializers.IntegerField(read_only = True)

    class Meta:
        model = CommunitySubscription
        fields = [
                'id',
                'community_name',
                'plan_type',
                'status',
                'created_at',
                'next_billing_date',
                'days_remaining',
                'total_amount_paid',
                'invoices'       
        ]

    def get_invoices(self,obj):
        payments = SaaSPaymentLedger.objects.filter(
            community = obj.community
        ).order_by('-payment_date')

        return SaasPaymentLedgerSerializer(payments,many=True).data 