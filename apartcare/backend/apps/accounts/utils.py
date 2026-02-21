from django.conf import settings
from rest_framework.response import Response

def set_auth_cookies(response: Response, access_token: str, refresh_token: str = None):

    response.set_cookie(
        key=settings.SIMPLE_JWT['AUTH_COOKIE'], 
        value=access_token,
        expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
        secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
        httponly=True, 
        samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
    )

   
    if refresh_token:
        response.set_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
            value=refresh_token,
            expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            httponly=True,
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
        )

def clear_auth_cookies(response: Response):

    response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
    response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
