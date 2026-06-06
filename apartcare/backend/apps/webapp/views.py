import razorpay
import datetime
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny ,IsAuthenticated
from apps.apartment.models import Community
from .serializers import *
from apps.accounts.permissions import IsSuperAdmin
from apps.admin_panel.serializers import CommunityDetailsSerializer
from rest_framework.generics import RetrieveUpdateAPIView,UpdateAPIView
from apps.accounts.models import User
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count
from .models import *

User = get_user_model()


class CreateCommunityAdminAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        serializer = CreateCommunityAdmin(data=request.data)

        if serializer.is_valid():
            data = serializer.save()
            
            community_obj = data['community']
            admin_obj = data['admin']
            clear_text_password = data['clear_text_password']

            email_subject = "Welcome to ApartCare! Your Admin Portal Credentials 🏢"
            email_message = f"""Hi {admin_obj.name},

            Your apartment community portal has been successfully set up on ApartCare!

            You have been registered as the primary administrator for "{community_obj.name}". Below are your secure login credentials to access your administrative dashboard:

            Login Portal URL: http://localhost:5173/auth/login  
            Username/Email: {admin_obj.email}
            Password: {clear_text_password}

            ⚠️ Security Reminder: Please protect these credentials. You can update your access password at any time via your account Profile Settings tab.

            Best regards,
            The ApartCare Systems Management Team
            """
            
            try:
                send_mail(
                    subject=email_subject,
                    message=email_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[admin_obj.email],
                    fail_silently=False,  
                )
                email_status = "Credentials dispatched successfully via email."
                
            except Exception as e:
                print(f"SMTP EXCEPTION: Failed to deliver community setup email: {str(e)}")
                email_status = f"Failed to deliver email. Server Error details: {str(e)}"

            return Response(
                { 
                    "message": "Community created successfully",
                    "community": community_obj.name,
                    "admin": admin_obj.email,
                    "email_delivery_status": email_status
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    
class DeactivateCommunity(APIView):
    permission_classes = [IsAuthenticated,IsSuperAdmin]

    def delete(self,request,id):
        community = get_object_or_404(Community,id = id)
        community.is_active = False
        community.save()

        admin_user = community.admin
        admin_user.is_active = False
        admin_user.save()

        return Response({"message": "Community and Admin deactivated successfully."})
    
class ReactivateCommunityView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin] 

    def patch(self, request, id):
        community = get_object_or_404(Community, id=id)
        
        community.is_active = True
        community.save()
        
        admin_user = community.admin
        admin_user.is_active = True
        admin_user.save()

        return Response({"message": "Community and Admin reactivated successfully."})
    
class CommunityListView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        communities = Community.objects.select_related("admin")
        serializer = CommunityListSerializer(communities, many=True)
        return Response(serializer.data)
    

class CommunityUpdateView(UpdateAPIView):

    permission_classes = [IsAuthenticated, IsSuperAdmin]
    serializer_class = CommunityUpdateSerializer
    queryset = Community.objects.select_related("admin")


class GlobalSaaSRateAPIView(APIView):
    def get(self, request):
        rates = GlobalSaaSRate.objects.first()
        if not rates:
            rates = GlobalSaaSRate.objects.create(monthly_rate=49.00, yearly_rate=499.00)
        return Response({
            "monthly_rate": float(rates.monthly_rate),
            "yearly_rate": float(rates.yearly_rate)
        })

    def post(self, request):
        rates = GlobalSaaSRate.objects.first()
        if not rates:
            rates = GlobalSaaSRate.objects.create()
        
        rates.monthly_rate = request.data.get('monthly_rate', rates.monthly_rate)
        rates.yearly_rate = request.data.get('yearly_rate', rates.yearly_rate)
        rates.save()
        return Response({"message": "Subscription rates updated globally across ApartCare nodes."})


class SuperAdminDashboardAnalyticsAPIView(APIView):
    def get(self, request):
        today = datetime.date.today()
        

        expired_nodes = CommunitySubscription.objects.filter(next_billing_date__lt=today, status='ACTIVE')
        for sub in expired_nodes:
            sub.status = 'EXPIRED'
            sub.save()
            sub.community.is_active = False
            sub.community.save()

        total_revenue = CommunitySubscription.objects.aggregate(Sum('total_amount_paid'))['total_amount_paid__sum'] or 0.00
        
        communities_list = []
        all_subs = CommunitySubscription.objects.select_related('community', 'community__admin').all()
        for sub in all_subs:
            communities_list.append({
                "id": sub.community.id,
                "name": sub.community.name,
                "address": sub.community.address,
                "admin_email": sub.community.admin.email if sub.community.admin else "N/A",
                "plan_type": sub.get_plan_type_display(),
                "days_remaining": f"{sub.days_remaining} days left" if sub.days_remaining > 0 else "Lapsed",
                "amount_paid": float(sub.total_amount_paid),
                "next_bill": str(sub.next_billing_date),
                "is_active": sub.community.is_active
            })

        return Response({
            "summary": {
                "total_communities": Community.objects.count(),
                "subscribed_count": CommunitySubscription.objects.filter(plan_type__in=['MONTHLY', 'YEARLY'], status='ACTIVE').count(),
                "trial_count": CommunitySubscription.objects.filter(plan_type='TRIAL', status='ACTIVE').count(),
                "deactivated_count": CommunitySubscription.objects.filter(status='EXPIRED').count(),
                "total_platform_revenue": float(total_revenue)
            },
            "communities": communities_list
        })

class GlobalSaaSRateAPIView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        if request.user.role != 'SUPER_ADMIN' and request.user.role != 'ADMIN':
            return Response(
                {"detail": "Authentication credentials do not have permission to execute this configuration override."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        rates, created = GlobalSaaSRate.objects.get_or_create(
            id=1, 
            defaults={'monthly_rate': 49.00, 'yearly_rate': 499.00}
        )
        return Response({
            "monthly_rate": float(rates.monthly_rate),
            "yearly_rate": float(rates.yearly_rate)
        }, status=status.HTTP_200_OK)

    def post(self, request):

        if request.user.role != 'SUPER_ADMIN':
            return Response(
                {"detail": "Authentication credentials do not have permission to execute this configuration override."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        monthly = request.data.get('monthly_rate')
        yearly = request.data.get('yearly_rate')

        if monthly is None or yearly is None:
            return Response({"detail": "Both monthly_rate and yearly_rate are required parameters."}, status=status.HTTP_400_BAD_REQUEST)

        rates, created = GlobalSaaSRate.objects.update_or_create(
            id=1,
            defaults={
                'monthly_rate': monthly,
                'yearly_rate': yearly
            }
        )

        return Response({
            "message": "Subscription rates updated globally across ApartCare nodes.",
            "monthly_rate": float(rates.monthly_rate),
            "yearly_rate": float(rates.yearly_rate)
        }, status=status.HTTP_200_OK)

# class SuperAdminDashboardAnalyticsAPIView(APIView):
#     def get(self, request):
#         today = datetime.date.today()
        
#         total_communities = Community.objects.count()
        
#         active_paid = CommunitySubscription.objects.filter(status='ACTIVE').count()
#         pending_payments = CommunitySubscription.objects.filter(status='PENDING').count()
#         deactivated_count = CommunitySubscription.objects.filter(status='EXPIRED').count()
        
#         trial_count = CommunitySubscription.objects.filter(plan_type='TRIAL', status='ACTIVE').count()
#         monthly_count = CommunitySubscription.objects.filter(plan_type='MONTHLY', status='ACTIVE').count()
#         year_count = CommunitySubscription.objects.filter(plan_type='YEARLY', status='ACTIVE').count()
        
#         total_revenue = CommunitySubscription.objects.aggregate(Sum('total_amount_paid'))['total_amount_paid__sum'] or 0.00

#         communities_list = []
#         all_subs = CommunitySubscription.objects.select_related('community', 'community__admin').all()
        
#         for sub in all_subs:
#             current_status = sub.status
#             if current_status == 'PENDING':
#                 current_status = 'ACTIVE' 
#             communities_list.append({
#                 "id": sub.community.id,
#                 "name": sub.community.name,
#                 "address": sub.community.address,
#                 "admin_email": sub.community.admin.email if sub.community.admin else "No Admin Configured",
#                 "plan_type": sub.get_plan_type_display(), 
#                 "days_remaining": f"{sub.days_remaining} days left" if sub.days_remaining > 0 else "Lapsed",
#                 "amount_paid": float(sub.total_amount_paid),
#                 "next_bill": str(sub.next_billing_date),
#                 "status": current_status, 
#                 "is_active": sub.community.is_active 
#             })

#         warning_threshold = datetime.date.today() + datetime.timedelta(days=7)
#         lapsing_nodes = CommunitySubscription.objects.filter(
#             next_billing_date__lte=warning_threshold, 
#             next_billing_date__gte=datetime.date.today(),
#             status='ACTIVE'
#         )

#         for sub in lapsing_nodes:
#             msg_body = f"⚠️ Warning: The subscription access window for '{sub.community.name}' expires in {sub.days_remaining} days on {sub.next_billing_date}."
#             if not SuperAdminNotification.objects.filter(message=msg_body, is_read=False).exists():
#                 SuperAdminNotification.objects.create(
#                     notification_type='EXPIRATION_WARNING',
#                     message=msg_body
#                 )


#         return Response({
#             "summary": {
#                 "total_communities": total_communities,
#                 "subscribed_count": active_paid,       
#                 "deactivated_count": pending_payments, 
#                 "trial_period_count": trial_count,
#                 "monthly_billing_count": monthly_count,
#                 "yearly_billing_count": year_count,
#                 "total_platform_revenue": float(total_revenue)
#             },
#             "communities": communities_list
#         })

class SuperAdminDashboardAnalyticsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = datetime.date.today()
        
        # 1. Base Metrics
        total_communities = Community.objects.count()
        
        # 2. Fully Active Tenants (Count premium paid tiers that are currently ACTIVE)
        # 🎯 FIXED: Filters out TRIAL accounts so it only tracks true premium subscriptions
        active_paid = CommunitySubscription.objects.filter(
            plan_type__in=['MONTHLY', 'YEARLY'], 
            status='ACTIVE'
        ).count()
        
        # 3. Lapsed / Frozen Licenses (Count accounts that have completely EXPIRED)
        # 🎯 FIXED: Changed lookup filter string from 'PENDING' to 'EXPIRED'
        deactivated_count = CommunitySubscription.objects.filter(status='EXPIRED').count()
        
        # 4. Trial Track Communities
        trial_count = CommunitySubscription.objects.filter(plan_type='TRIAL', status='ACTIVE').count()
        
        # Secondary breakdowns variables
        monthly_count = CommunitySubscription.objects.filter(plan_type='MONTHLY', status='ACTIVE').count()
        year_count = CommunitySubscription.objects.filter(plan_type='YEARLY', status='ACTIVE').count()
        
        # 5. Financial Aggregations
        total_revenue = CommunitySubscription.objects.aggregate(Sum('total_amount_paid'))['total_amount_paid__sum'] or 0.00

        # --- Communities List Array Generation ---
        communities_list = []
        all_subs = CommunitySubscription.objects.select_related('community', 'community__admin').all()
        
        for sub in all_subs:
            current_status = sub.status
            # Map legacy 'PENDING' data flags to 'ACTIVE' for the UI display matrix row lines
            if current_status == 'PENDING':
                current_status = 'ACTIVE' 

            communities_list.append({
                "id": sub.community.id,
                "name": sub.community.name,
                "address": sub.community.address,
                "admin_email": sub.community.admin.email if sub.community.admin else "No Admin Configured",
                "plan_type": sub.get_plan_type_display(), 
                "days_remaining": f"{sub.days_remaining} days left" if sub.days_remaining > 0 else "Lapsed",
                "amount_paid": float(sub.total_amount_paid),
                "next_bill": str(sub.next_billing_date),
                "status": current_status, 
                "is_active": sub.community.is_active 
            })

        # --- Automated Warning Triggers ---
        warning_threshold = today + datetime.timedelta(days=7)
        lapsing_nodes = CommunitySubscription.objects.filter(
            next_billing_date__lte=warning_threshold, 
            next_billing_date__gte=today,
            status='ACTIVE'
        )

        for sub in lapsing_nodes:
            msg_body = f"⚠️ Warning: The subscription access window for '{sub.community.name}' expires in {sub.days_remaining} days on {sub.next_billing_date}."
            if not SuperAdminNotification.objects.filter(message=msg_body, is_read=False).exists():
                SuperAdminNotification.objects.create(
                    notification_type='EXPIRATION_WARNING',
                    message=msg_body
                )

        # 🎯 RESPONSE STRUCT: Clean variables mapped directly to your frontend properties
        return Response({
            "summary": {
                "total_communities": total_communities,
                "subscribed_count": active_paid,       # 👑 Premium Active Counter Mapped
                "deactivated_count": deactivated_count, # ❌ Frozen Expired Counter Mapped
                "trial_period_count": trial_count,     # ⏳ Trial Counter Mapped
                "monthly_billing_count": monthly_count,
                "yearly_billing_count": year_count,
                "total_platform_revenue": float(total_revenue)
            },
            "communities": communities_list
        })

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class CreateSaaSTransactionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'ADMIN' or not user.community:
            return Response({"detail": "Only a Community Admin can initiate a subscription payment."}, status=403)
            
        plan_choice = request.data.get('plan_type') 
        if plan_choice not in ['MONTHLY', 'YEARLY']:
            return Response({"detail": "Invalid subscription plan selection choice."}, status=400)

        rates = GlobalSaaSRate.objects.first()
        if not rates:
            rates = GlobalSaaSRate.objects.create() 

        price = rates.monthly_rate if plan_choice == 'MONTHLY' else rates.yearly_rate
        amount_in_paisa = int(price * 100) 
        try:
            razorpay_order = client.order.create({
                "amount": amount_in_paisa,
                "currency": "INR",
                "payment_capture": 1
            })

            return Response({
                "order_id": razorpay_order['id'],
                "amount": price,
                "currency": "INR",
                "plan_type": plan_choice
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"detail": f"Razorpay connection failure: {str(e)}"}, status=500)


class VerifySaaSCheckoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data

        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_signature = data.get('razorpay_signature')
        plan_type = data.get('plan_type')


        subscription = CommunitySubscription.objects.get(community=user.community)
        rates = GlobalSaaSRate.objects.first()
        amount_paid = rates.monthly_rate if plan_type == 'MONTHLY' else rates.yearly_rate

        today = datetime.date.today()

        if plan_type == 'MONTHLY':
            subscription.next_billing_date = today + datetime.timedelta(days=30)
        elif plan_type == 'YEARLY':
            subscription.next_billing_date = today + datetime.timedelta(days=365)

        subscription.plan_type = plan_type
        subscription.status = 'ACTIVE'
        subscription.total_amount_paid += amount_paid
        subscription.save()
        
        subscription.community.is_active = True
        subscription.community.save()

        SaaSPaymentLedger.objects.create(
            community=user.community,
            amount_paid=amount_paid,
            transaction_id=razorpay_payment_id,
            status='SUCCESS'
        )

        return Response({"message": f"Payment successfully verified! Your subscription is active for the next {'30' if plan_type == 'MONTHLY' else '365'} days."})
    


class MyCommunitySubscriptionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        if not user.community:
            return Response(
                {"detail": "Your user account is not linked to any apartment community profile."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        subscription, created = CommunitySubscription.objects.get_or_create(
            community=user.community,
            defaults={
                'plan_type': 'TRIAL',
                'status': 'ACTIVE',
                'next_billing_date': datetime.date.today() + datetime.timedelta(days=30)
            }
        )

        return Response({
            "community_name": user.community.name,
            "admin_email": user.email,
            "plan_type": subscription.plan_type,                     
            "plan_type_display": subscription.get_plan_type_display(), 
            "status": subscription.status,
            "days_remaining": max(0, subscription.days_remaining),    
            "next_bill": str(subscription.next_billing_date),
            "total_contributed": float(subscription.total_amount_paid)
        }, status=status.HTTP_200_OK)




class SuperAdminAnnouncementAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        announcements = SuperAdminAnnouncement.objects.all().order_by('-created_at')
        data = [{
            "id": ann.id,
            "title": ann.title,
            "content": ann.content,
            "created_at": ann.created_at.strftime("%d %b %Y, %I:%M %p")
        } for ann in announcements]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != 'SUPER_ADMIN':
            return Response({"detail": "Unauthorized operation loop access."}, status=403)
            
        title = request.data.get('title')
        content = request.data.get('content')

        if not title or not content:
            return Response({"detail": "Title and Content are required field inputs."}, status=400)

        announcement = SuperAdminAnnouncement.objects.create(title=title, content=content)

        admin_emails = User.objects.filter(role='ADMIN', is_active=True).values_list('email', flat=True)

        if admin_emails:
            try:
                send_mail(
                    subject=f"📢 ApartCare Global Operator Alert: {title}",
                    message=f"Hello Community Administrator,\n\nOur Super Admin has published a critical operational update:\n\n{content}\n\nBest regards,\nApartCare Core Infrastructure Team",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=list(admin_emails),
                    fail_silently=False,
                )
            except Exception as e:
                print(f"SMTP Dispatch Failure: {str(e)}") 

        return Response({"message": "Announcement published successfully and forwarded via email distribution arrays!"}, status=status.HTTP_201_CREATED)


class SuperAdminNotificationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'SUPER_ADMIN':
            return Response({"detail": "Denied Access."}, status=403)
            
        notifications = SuperAdminNotification.objects.filter(is_read=False).order_by('-created_at')
        data = [{
            "id": n.id,
            "type": n.notification_type,
            "message": n.message,
            "created_at": n.created_at.strftime("%d %b %Y, %I:%M %p")
        } for n in notifications]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        SuperAdminNotification.objects.filter(id=request.data.get('id')).update(is_read=True)
        return Response({"message": "Alert status checked and cleared."})