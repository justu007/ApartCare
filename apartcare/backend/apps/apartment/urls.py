from django.urls import path
from .views import AdminCreateBlockAPIView,AdminCreateFlatAPIView

urlpatterns = [
    path("create-block/",AdminCreateBlockAPIView.as_view()),
    path("create-flat/",AdminCreateFlatAPIView.as_view()),
    
]