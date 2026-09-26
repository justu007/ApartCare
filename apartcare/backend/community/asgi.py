import os
import django
from django.core.asgi import get_asgi_application

# 1. Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'community.settings')

# 2. Initialize Django registry and HTTP ASGI application FIRST
django.setup()
django_asgi_app = get_asgi_application()

# 3. ONLY import Channels and your app's routing AFTER django.setup()
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from apps.notification.routing import websocket_urlpatterns

# 4. Define the ASGI application
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})