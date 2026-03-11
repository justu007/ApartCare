from rest_framework import serializers
from apps.accounts.models import User
from .models import Community,Block,Flat
from django.contrib.auth import authenticate
from apps.admin_panel.models import AdminResident_Profile,StaffProfile

# class AdminCreateCommunity(serializers.ModelSerializer):
#     class Meta:
#         model = Community
#         fields = [
#             'id',
#             'name',
#             'address',
#             'created_at'
#         ]
#         read_only_fields = ["id", "created_at"]

class AdminCreateBlock(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = [
            'id',
            'name',
            'community',
            'created_at'
        ]
        read_only_fields = ['id', 'community', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        admin_community = request.user.community
        if not admin_community:
            raise serializers.ValidationError("You do not belong to a community.")
        
        block = Block.objects.create(community = admin_community,**validated_data)
        return block
    
class AdminCreateFlat(serializers.ModelSerializer):
    class Meta:
        model = Flat
        fields = [
            'id',
            'name',
            'block',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self,validated_data):
        request = self.context.get("request")
        admin_community = request.user.community
        tar_block = validated_data.get('block')
        if tar_block.community  != admin_community:
            raise serializers.ValidationError(
                {"block": "You cannot create a flat in a block that belongs to another community."}
            )

        flat = Flat.objects.create(
            **validated_data
        )
        return flat



class AvailableFlatSerializer(serializers.ModelSerializer):

    block = serializers.CharField(source="block.name")

    class Meta:
        model = Flat
        fields = [
            "id",
            "name",
            "block",
            "occupied"
        ]