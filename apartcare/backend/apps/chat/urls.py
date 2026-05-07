from django.urls import path
from .views import IssueChatHistoryAPIView, ChatHistoryAPIView

urlpatterns = [
    path('history/', ChatHistoryAPIView.as_view(), name='global-chat-history'),
    
    path('issue/<int:issue_id>/history/', IssueChatHistoryAPIView.as_view(), name='issue-chat-history'),
]