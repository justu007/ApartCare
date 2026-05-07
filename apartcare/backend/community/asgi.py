"""
ASGI config for community project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from apps.notification.routing import websocket_urlpatterns 


from apps.notification.routing import websocket_urlpatterns 
from .middleware import JWTAuthCookieMiddleware 

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'community.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthCookieMiddleware(  
        URLRouter(
            websocket_urlpatterns
        )
    ),
})