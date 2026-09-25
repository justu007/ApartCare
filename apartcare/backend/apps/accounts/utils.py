from django.conf import settings
from rest_framework.response import Response
import re
from rest_framework import serializers

def set_auth_cookies(response: Response, access_token: str, refresh_token: str = None):
    access_max_age = int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
    response.set_cookie(
        key=settings.SIMPLE_JWT['AUTH_COOKIE'], 
        value=access_token,
        expires=access_max_age,
        secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
        httponly=True, 
        samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
    )

    refresh_max_age = int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
    if refresh_token:
        response.set_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
            value=refresh_token,
            expires=refresh_max_age,
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            httponly=True,
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
        )

def clear_auth_cookies(response: Response):

    response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
    response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])

def validate_phone_no(value):
    clean_phone = re.sub(r'[\s\-]','',str(value))
    if not clean_phone.isdigit():
        raise serializers.ValidationError("Phone number must contain only numbers.")
    if len(clean_phone) != 10:
        raise serializers.ValidationError("Phone number must be exactly 10 digits.")
    if clean_phone[0] not in ['6', '7', '8', '9']:
        raise serializers.ValidationError("Phone number must start with 6, 7, 8, or 9.")
        
    return clean_phone