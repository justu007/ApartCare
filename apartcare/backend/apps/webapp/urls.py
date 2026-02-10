from django.urls import path
from .views import CreateCommunityAdminAPIView

urlpatterns = [
    path('create-community/', CreateCommunityAdminAPIView.as_view()),
    
]