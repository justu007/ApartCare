from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework import status
from .serializers import AdminCreateUserSerializer,LoginSerializer
from .permissions import Isadmin
from rest_framework.permissions import AllowAny ,IsAuthenticated



class SomeProtectedAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "You are authorized",
            "user": request.user.email
        })

class AdminCreateUserAPIView(APIView):
    permission_classes = [Isadmin]

    def post(self,request):
        serializer  =  AdminCreateUserSerializer(data = request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message" : "User create successfully"},
                status = status.HTTP_201_CREATED
                )

        return Response(
            serializer.errors,
            status = status.HTTP_400_BAD_REQUEST 
        )
    
class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        return Response(
            {
                "message": "Login successful",
                **serializer.validated_data
            },
            status=status.HTTP_200_OK
        )

