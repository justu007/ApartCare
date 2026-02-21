from django.urls import path
from .views import *
urlpatterns = [
    path('create-community/', CreateCommunityAdminAPIView.as_view()),
    path('reactivate-community/', ReactivateCommunityView.as_view()),
    
]