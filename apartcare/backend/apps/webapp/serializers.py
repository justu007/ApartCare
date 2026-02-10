from rest_framework import serializers
from apps.apartment.models import Community
from apps.accounts.models import User

class CreateCommunityAdmin(serializers.ModelSerializer):

    name = serializers.CharField()
    address = serializers.CharField()

    admin_name  = serializers.CharField()
    admin_email = serializers.EmailField()
    admin_password = serializers.CharField(write_only= True)

    class Meta:
        model = Community
        fields = [
            'name',
            'address',
            'admin_name',
            'admin_email',
            'admin_password'
        ]

    def create(self,validated_data):
        community = Community.objects.create(
            name = validated_data['name'],
            address = validated_data['address']

        )

        community_admin = User.objects.create_admin_user(
            name = validated_data['admin_name'],
            email = validated_data['admin_email'],
            password = validated_data['admin_password'],
            role = 'ADMIN'
        )
    

        return {
            "community" : community,
            "admin" : community_admin
        }