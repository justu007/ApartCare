from django.shortcuts import render
from apps.accounts.models import *
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class ProfileViewAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        user = request.user

        data = [
            'id' : user.id,
            'email' : user.email,
            'name' : user.name,
            'role' : user.role

        ]

        if user.role == 'ADMIN':
            admin_profile = user.admin_profile



