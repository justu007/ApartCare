from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework import status
from apps.admin_panel.models import AdminResident_Profile
from apps.accounts.backends import User
from .serializers import *
from .permissions import IsAdmin
from rest_framework.permissions import AllowAny ,IsAuthenticated
from apps.accounts.utils import set_auth_cookies
from apps.accounts.utils import clear_auth_cookies
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_str
from django.core.mail import EmailMessage 

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
        serializer  =  AdminCreateUserSerializer(data = request.data,context = {'request' :request})

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message" : "User create successfully",
                },
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
                "user_id" : data.get('user_id'),
                "email_id" : data.get('email'),
                "role" : data.get('role')
            },status=status.HTTP_200_OK
        )

        set_auth_cookies(response,access,refresh)

        return response
    




class RefreshTokenAPIView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response({"error": "No refresh token found in cookies"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
            serializer.is_valid(raise_exception=True)
            
            access_token = serializer.validated_data.get('access')
            new_refresh = serializer.validated_data.get('refresh', refresh_token) 

            response = Response({'message': "Token refreshed successfully"})

            set_auth_cookies(response, access_token, new_refresh)

            return response
            
        except InvalidToken:
            return Response({"error": "Invalid or expired refresh token. Please log in again."}, status=status.HTTP_401_UNAUTHORIZED)
        
class LogoutView(APIView):

    def post(self, request):

        refresh_token = request.COOKIES.get("refresh_token")

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
            response = Response({"message": "Logged out"}) 
        clear_auth_cookies(response)

        return response

class  ProfileViewAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        data = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'role': user.role,
            'status': user.get_is_active_display(),
            'community': {
                'id': user.community.id,
                'name': user.community.name,
                'address': user.community.address
            } if user.community else None
        }

        if user.role == 'RESIDENT':
            profile = getattr(user, 'resident_profile', None)
            if profile:
                data['block'] = {'id': profile.block.id, 'name': profile.block.name} if profile.block else None
                data['flat'] = {'id': profile.flat.id, 'name': profile.flat.name} if profile.flat else None

        elif user.role == 'STAFF':
            profile = getattr(user, 'staff_profile', None)
            if profile:
                data['designation'] = profile.designation
                data['monthly_salary'] = profile.monthly_salary

        return Response(data)
    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=True 
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Profile updated successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, user_id):
        user = get_object_or_404(User, id=user_id ,community = request.user.community)

        if not user.is_active:
            return Response({"error": "User is already inactive"}, status=status.HTTP_400_BAD_REQUEST)
            
        if user.role == "SUPER_ADMIN":
            return Response({"error": "Cannot delete super admin"}, status=status.HTTP_403_FORBIDDEN)

        if user.role == "STAFF":
            staff_profile = getattr(user, 'staff_profile', None)
            if staff_profile:
                staff_profile.status = "INACTIVE"
                staff_profile.save()

        elif user.role == "RESIDENT":
            resident_profile = getattr(user, 'resident_profile', None)
            if resident_profile:
                resident_profile.status = "INACTIVE"
                resident_profile.save()

                if resident_profile.flat:
                    flat = resident_profile.flat
                    flat.occupied = False
                    flat.resident = None
                    flat.save()

 

        user.is_active = False
        user.save()

        return Response(
            {"message": f"User {user.name} and their {user.role} profile have been deactivated."},
            status=status.HTTP_200_OK
        )
    
class ReactivateUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, user_id):
        user = get_object_or_404(User, id=user_id)

        if user.is_active:
            return Response({"message": "User is already active"}, status=status.HTTP_400_BAD_REQUEST)

        if user.community and not user.community.is_active:
            return Response({
                "error": "Cannot reactivate user because their community is inactive. Reactivate the community first."
            }, status=status.HTTP_400_BAD_REQUEST)

        if user.role == "STAFF":
            profile = getattr(user, 'staff_profile', None)
            if profile:
                profile.status = "ACTIVE"
                profile.save()

        elif user.role == "RESIDENT":
            profile = getattr(user, 'resident_profile', None)
            if profile:
                profile.status = "ACTIVE"
                profile.save()


        user.is_active = True
        user.save()

        return Response(
            {"message": f"User {user.name}-{user.email} reactivated successfully."},
            status=status.HTTP_200_OK
        )
    
class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ForgotPasswordAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            

            if user:
                token_generator = PasswordResetTokenGenerator()
                token = token_generator.make_token(user)
                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                reset_link = f"{settings.FRONTEND_URL}/reset-password-confirm/{uidb64}/{token}/"

                
                try:
                    community = user.community
                    community_name = community.name
                    
                    community_admin = User.objects.filter(community=community, role='ADMIN').first()
                    admin_email = community_admin.email if community_admin else settings.DEFAULT_FROM_EMAIL
                    
                except AttributeError:
                    community_name = "ApartCare"
                    admin_email = settings.DEFAULT_FROM_EMAIL


                dynamic_from_email = f"{community_name} Admin <{settings.DEFAULT_FROM_EMAIL}>"

                email_message = EmailMessage(
                    subject=f"{community_name} - Password Reset Requested",
                    body=f"Hello {user.name},\n\nClick the link below to reset your password for {community_name}:\n\n{reset_link}\n\nIf you have any issues, reply to this email to contact your community admin.",
                    from_email=dynamic_from_email,     
                    to=[user.email],                   
                    reply_to=[admin_email]             
                )
                
                email_message.send(fail_silently=False)

            return Response({"message": "If an account with that email exists, a reset link has been sent."}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class ResetPasswordConfirmAPIView(APIView):
    permission_classes = [AllowAny] 
    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and PasswordResetTokenGenerator().check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
        
        return Response({"error": "This reset link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)