from django.urls import path
from .views import *
urlpatterns = [
    path('admin/create-user/', AdminCreateUserAPIView.as_view()),
    path('login/', LoginAPIView.as_view()), 
    path('delete/<int:user_id>/', DeleteView.as_view()),  
    path('logout/', LogoutView.as_view()),          
    path('refresh/', RefreshTokenAPIView.as_view()),      
    path('protected/', SomeProtectedAPIView.as_view()),
    path('profile/', ProfileViewAPIView.as_view()),    
]
