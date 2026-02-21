from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from apps.apartment.models import Community

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)
        else:
            raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)

            if not user or not user.is_active:
                raise AuthenticationFailed("User account is inactive.")

            if user.role != 'SUPER_ADMIN':
                if not user.community:
                    raise AuthenticationFailed("User is not assigned to any community.")
                
                if not user.community.is_active:
                    raise AuthenticationFailed("This community is deactivated. Access denied.")

        except AuthenticationFailed as e:
            raise e
        except Exception:
            return None

        return user, validated_token