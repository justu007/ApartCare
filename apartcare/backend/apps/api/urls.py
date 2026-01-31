
from django.urls import path
from .views import testapi

urlpatterns = [
    path('test/', testapi),
]
