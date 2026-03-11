from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.response import Response
from apps.accounts.permissions import IsAdmin
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import User
from .serializers import AdminCreateBlock,AdminCreateFlat
from rest_framework.generics import ListAPIView
from .models import Flat
from .serializers import AvailableFlatSerializer


    
class AdminCreateBlockAPIView(APIView):

    permission_classes = [IsAdmin,IsAuthenticated]

    def post(self,request):
        serializer = AdminCreateBlock(data = request.data,context ={'request' :request})

        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message" :"Block created successfully",
                    "data":serializer.data
                },status = status.HTTP_201_CREATED
            )
        return Response(serializer.errors,status= status.HTTP_400_BAD_REQUEST)
    
class AdminCreateFlatAPIView(APIView):

    permission_classes = [IsAdmin,IsAuthenticated]

    def post(self,request):
        serializer = AdminCreateFlat(data = request.data,context ={'request' :request})

        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message" :"Flat created successfully",
                    "data":serializer.data
                },status = status.HTTP_201_CREATED
            )
        return Response(serializer.errors,status= status.HTTP_400_BAD_REQUEST)







class AvailableFlatsView(ListAPIView):

    serializer_class = AvailableFlatSerializer
    permission_classes = [IsAuthenticated,IsAdmin]

    def get_queryset(self):

        community = self.request.user.community

        return Flat.objects.filter(
            block__community=community,
            occupied=False
        ).select_related("block")