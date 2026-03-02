from django.urls import path
from .views import *
urlpatterns = [
    path('create-community/', CreateCommunityAdminAPIView.as_view()),
    path('reactivate-community/<int:id>/', ReactivateCommunityView.as_view()),
    path('deactivate-community/<int:id>/', DeactivateCommunity.as_view()),
               
]