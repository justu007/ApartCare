from django.urls import path
from .views import AdminCreateUserAPIView,LoginAPIView, SomeProtectedAPIView
urlpatterns = [
    path('admin/create-user/', AdminCreateUserAPIView.as_view()),
    path('login/', LoginAPIView.as_view()),
    path('protected/', SomeProtectedAPIView.as_view()),
    


]
