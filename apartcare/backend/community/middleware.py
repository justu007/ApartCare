from urllib.parse import parse_qs
from http.cookies import SimpleCookie
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_key):
    try:
        access_token = AccessToken(token_key)
        user_id = access_token['user_id']
        return User.objects.get(id=user_id)
    except Exception as e:
        print(f"⚠️ Token Decoding Error: {e}") 
        return AnonymousUser()

class JWTAuthCookieMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        headers = dict(scope['headers'])
        scope['user'] = AnonymousUser()

        print("\n🚨 --- WEBSOCKET CONNECTION ATTEMPT --- 🚨")

        if b'cookie' in headers:
            cookies_str = headers[b'cookie'].decode()
            print(f"🍪 Cookies received: {cookies_str}")

            cookie_parser = SimpleCookie()
            cookie_parser.load(cookies_str)

            cookie_name = 'access_token' 

            if cookie_name in cookie_parser:
                token = cookie_parser[cookie_name].value
                user = await get_user_from_token(token)
                print(f"👤 User Authenticated: {user}")
                scope['user'] = user
            else:
                print(f"❌ '{cookie_name}' cookie NOT found in the list!")
        else:
            print("❌ NO COOKIES WERE SENT BY THE BROWSER!")

        return await self.inner(scope, receive, send)