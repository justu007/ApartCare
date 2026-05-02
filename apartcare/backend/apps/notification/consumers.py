import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Grab the user ID from the WebSocket URL
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user_group_name = f'user_{self.user_id}'

        # Add this specific connection to a "Group" named after the user
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Remove the user from the group when they close the browser tab
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )

    # This method catches the message from your Django Views and pushes it to React
    async def send_notification(self, event):
        message = event['message']
        title = event['title']

        # Send message to WebSocket (React)
        await self.send(text_data=json.dumps({
            'title': title,
            'message': message
        }))