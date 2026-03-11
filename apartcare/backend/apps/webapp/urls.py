from django.urls import path
from .views import *
urlpatterns = [
    path('create-community/', CreateCommunityAdminAPIView.as_view()),
    path('reactivate-community/<int:id>/', ReactivateCommunityView.as_view()),
    path('deactivate-community/<int:id>/', DeactivateCommunity.as_view()),
    path("get-communities/", CommunityListView.as_view()),
    path("update-community/<int:pk>/",CommunityUpdateView.as_view(),
)


               
]