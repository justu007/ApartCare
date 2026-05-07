
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from apps.chat.models import ChatMessage 
from apps.apartment.models import  Community
from apps.issue.models import Issue

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user_group_name = f'user_{self.user_id}'

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

    async def send_notification(self, event):
        message = event['message']
        title = event['title']

        await self.send(text_data=json.dumps({
            'title': title,
            'message': message
        }))


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

        self.user = self.scope.get("user")

        if not self.user or not self.user.is_authenticated:
            print("⛔ CONNECTION REJECTED: User is not authenticated.")
            await self.close(code=4001)
            return

        print(f"✅ CONNECTION ACCEPTED: {getattr(self.user, 'name', self.user.username)} joined.")
        
        self.room_type = self.scope['url_route']['kwargs']['room_type'] 
        self.room_id = self.scope['url_route']['kwargs']['room_id']     
        self.room_group_name = f'chat_{self.room_type}_{self.room_id}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        print(f"\n📥 1. MESSAGE RECEIVED FROM REACT: {text_data}")
        
        try:
            text_data_json = json.loads(text_data)
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
                    'timestamp': saved_msg.timestamp.strftime("%I:%M %p")
                }
            )
            print("📡 5. BROADCAST COMPLETE!")

        except Exception as e:
            print(f"❌ FATAL ERROR IN WEBSOCKET RECEIVE: {str(e)}")

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
            return ChatMessage.objects.create(sender = self.user, issue = issue, community = issue.creator.community, message=message)
        else:
            community = Community.objects.get(id=self.room_id)
            return ChatMessage.objects.create(sender=self.user, community=community, message=message)

