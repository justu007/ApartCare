from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework import status
from .serializers import AdminCreateUserSerializer,LoginSerializer
from .permissions import IsAdmin
from rest_framework.permissions import AllowAny ,IsAuthenticated
from apps.accounts.utils import set_auth_cookies
from apps.accounts.utils import clear_auth_cookies


class SomeProtectedAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "You are authorized",
            "user": request.user.email
        })

class AdminCreateUserAPIView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]

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

        data = serializer.validated_data

        access = data.get("access")
        refresh = data.get('refresh')

        response = Response(
            {
                "message" : "Login Success",
                "user_id" : data.get('id'),
                "email_id" : data.get('email'),
                "role" : data.get('role')
            },status=status.HTTP_200_OK
        )

        set_auth_cookies(response,access,refresh)

        return response
class LogoutView(APIView):

    def post(self, request):

        response = Response({"message": "Logged out"})

        clear_auth_cookies(response)

        return response

class ProfileViewAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        user = request.user

        data = {
            'id' :user.id,
            'name' : user.name,
            'email' : user.email,
            'role' : user.role
        }

        if user.role == 'admin':
            if user.community :
                data['community'] = {
                    'id' :user.community.id,
                    'name' : user.community.name,
               }
            else:
                data["community"] = None

        elif user.role =='resident':
            resident_profile = user.resident_profile

            data['block'] = {
                'id' : resident_profile.block.id,
                'name' :resident_profile.block.name,

            }if resident_profile.block else None

            data['flat'] = {
                'id' : resident_profile.flat.id,
                'name' :resident_profile.flat.name,

            }if resident_profile.flat else None

        elif user.role == 'staff':
            staff_profile = user.staff_profile

            data['designation'] = staff_profile.designation
            data['monthly_salary'] = staff_profile.monthly_salary

        return Response(data)
    

            