from django.urls import path
from .views import *
urlpatterns = [
    path('create-community/', CreateCommunityAdminAPIView.as_view()),
    path('reactivate-community/<int:id>/', ReactivateCommunityView.as_view()),
    path('deactivate-community/<int:id>/', DeactivateCommunity.as_view()),
    path("get-communities/", CommunityListView.as_view()),
    path("update-community/<int:pk>/",CommunityUpdateView.as_view()),
    path("superadmin-analytics/", SuperAdminDashboardAnalyticsAPIView.as_view(), name='superadmin-analytics'),
    path('saas-rates/', GlobalSaaSRateAPIView.as_view(), name='saas-rates'),
    path('superadmin-analytics/', SuperAdminDashboardAnalyticsAPIView.as_view(), name='superadmin-analytics'),
    path('community/create-saas-order/', CreateSaaSTransactionAPIView.as_view(), name='create-saas-order'),
    path('community/verify-saas-payment/', VerifySaaSCheckoutAPIView.as_view(), name='verify-saas-payment'),
    path('community/my-subscription/', MyCommunitySubscriptionAPIView.as_view(), name='my-community-subscription'),
    path('superadmin-announcements/', SuperAdminAnnouncementAPIView.as_view(), name='superadmin-announcements'),
    path('superadmin-notifications/', SuperAdminNotificationAPIView.as_view(), name='superadmin-notifications'),
             
]