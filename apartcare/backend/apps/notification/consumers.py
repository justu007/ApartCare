import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from apps.chat.models import ChatMessage 
from apps.apartment.models import  Community
from apps.issue.models import Issue
from .models import Notification
from django.contrib.auth import get_user_model
import logging
logger = logging.getLogger(__name__)

User = get_user_model() 

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_target_id = self.scope['url_route']['kwargs']['user_id']
        
        if self.user_target_id == 'superadmin':
            self.user_group_name = 'user_superadmin_global'
        else:
            self.user_group_name = f'user_admin_community_{self.user_target_id}'

        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )
    # async def receive(self, text_data):
    #     try:
    #         data = json.loads(text_data)
    #         if data.get('type') == 'ping':
    #             return
    #     except Exception:
    #         pass

    async def send_notification(self, event):
        message = event.get('message', '')
        title = event.get('title', 'System Alert')
        from_room_id = event.get('from_room_id', None)

        await self.send(text_data=json.dumps({
            'title': title,
            'message': message,
            'from_room_id': from_room_id
        }))

    async def send_issue_update(self, event):
        await self.send_json({
            "event_type": event["event_type"],
            "issue": event["issue"]
    })


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.user = self.scope.get("user")

        self.room_type = self.scope['url_route']['kwargs']['room_type'] 
        self.room_id = self.scope['url_route']['kwargs']['room_id']     

        self.room_group_name = f'chat_{self.room_type}_{self.room_id}'

        if not self.user or not self.user.is_authenticated:
            print("⛔ CONNECTION REJECTED: User is not authenticated.")
            await self.close(code=4001)
            return

        print(f"✅ CONNECTION ACCEPTED: {getattr(self.user, 'name', self.user.username)} joined.")
        


        print(f"📡 User joined channel layer group: {self.room_group_name}")
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        print(f"\n📥 1. MESSAGE RECEIVED FROM REACT: {text_data}")
        
        try:
            text_data_json = json.loads(text_data)
            
            if text_data_json.get('type') == 'ping':
                return

            message = text_data_json['message']

            print("💾 2. ATTEMPTING TO SAVE TO DATABASE...")
            saved_msg = await self.save_message(message)
            print("✅ 3. SUCCESSFULLY SAVED TO DB!")

            print(f"🚀 4. BROADCASTING TO ROOM: {self.room_group_name}")
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message', 
                    'message': message,
                    'sender_name': getattr(self.user, 'name', getattr(self.user, 'username', 'Unknown')),
                    'sender_role': getattr(self.user, 'role', 'USER'),
                    'timestamp': saved_msg.timestamp.strftime("%I:%M %p") if saved_msg.timestamp else "Just now"
                }
            )

            if self.room_type == 'support':
                if self.user.role == 'ADMIN':
                    await self.channel_layer.group_send(
                        "user_superadmin_global",
                        {
                            "type": "send_notification",
                            "title": "New Support Message",
                            "message": f"Community Admin from Complex ID #{self.room_id} has pushed an operational update packet.",
                            "from_room_id": str(self.room_id)
                        }
                    )
                else:
                    await self.channel_layer.group_send(
                        f"user_admin_community_{self.room_id}",
                        {
                            "type": "send_notification",
                            "title": "HQ Update Packet Received",
                            "message": "ApartCare Corporate HQ has pushed a response down your encryption timeline link.",
                            "from_room_id": str(self.room_id)
                        }
                    )
            elif self.room_type == 'community':
                receiver_ids = await self.create_chat_message(message)
                sender = getattr(self.user, 'name', 'Resident')
                for receiver_id in receiver_ids:
                    await self.channel_layer.group_send(
                        f"user_admin_community_{receiver_id}",
                        {
                            "type": "send_notification",
                            "title": "One new Community message received",
                            "message": f"New message from '{sender}': {message[:20]}..."
                        }
                    )

            print("📡 5. BROADCAST COMPLETE!")

        except Exception as e:
            logger.error(f"❌ FATAL ERROR IN WEBSOCKET RECEIVE: {str(e)}")

    async def chat_message(self, event):
        print(f"📬 6. SENDING BACK TO BROWSER: {event['message']}")
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_name': event['sender_name'],
            'sender_role': event['sender_role'],
            'timestamp': event['timestamp']
        }))

    @sync_to_async
    def save_message(self, message):
        if self.room_type == 'issue':
            issue = Issue.objects.get(id=self.room_id)
            return ChatMessage.objects.create(
                sender=self.user, 
                issue=issue, 
                community=issue.creator.community, 
                message=message
            )
        elif self.room_type == 'support':
            community = Community.objects.get(id=self.room_id)
            return ChatMessage.objects.create(
                sender=self.user,
                community=community,
                message=message,
                is_support=True 
            )
        else:
            community = Community.objects.get(id=self.room_id)
            return ChatMessage.objects.create(
                sender=self.user, 
                community=community, 
                message=message,
                is_support=False 
            )
            
    @sync_to_async
    def create_chat_message(self, message):
        community = Community.objects.filter(id = self.room_id).first()
        community_users = list(User.objects.filter(community = community))
        sender  = getattr(self.user,'name',getattr(self.user,'username'))
        # if hasattr(community,'admin')and community.admin:  
        #     community_users.append(community.admin)
        receivers = [u for u in community_users if u.id !=self.user.id]
        

        notification_to_create = []
        for receiver in receivers:
            notification_to_create.append(
                Notification(
                    user=receiver,
                    notification_type='Chat',
                    title="New Community Message 💬",
                    message=f"'{sender}' sent: '{message[:30]}...'" 
                )
            )

        if notification_to_create:
            Notification.objects.bulk_create(notification_to_create)

        return [r.id for r in receivers]