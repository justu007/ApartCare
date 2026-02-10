from django.urls import path
from .views import AdminCreateCommunityAPIView,AdminCreateBlockAPIView,AdminCreateFlatAPIView

urlpatterns = [

    path("create-community",AdminCreateCommunityAPIView.as_view()),
    path("create-block",AdminCreateBlockAPIView.as_view()),
    path("create-flat",AdminCreateFlatAPIView.as_view()),
    
]