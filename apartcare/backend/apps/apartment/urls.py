from django.urls import path
from .views import *

urlpatterns = [
    path("create-block/",AdminCreateBlockAPIView.as_view()),
    path("create-flat/",AdminCreateFlatAPIView.as_view()),
    path("get-flats/",AvailableFlatsView.as_view(),),
    path('change-maintenance-fee/', CommunitySettingsAPIView.as_view())
   
    
]