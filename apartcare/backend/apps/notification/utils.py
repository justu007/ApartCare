

import threading
from django.core.mail import get_connection, EmailMessage
from django.conf import settings

class MassEmailThread(threading.Thread):
    def __init__(self, subject, message, recipient_emails):
        self.subject = subject
        self.message = message
        self.recipient_emails = recipient_emails
        threading.Thread.__init__(self)

    def run(self):
        try:
            connection = get_connection(fail_silently=False) 
            
            emails_to_send = []
            
            for recipient in self.recipient_emails:
                email = EmailMessage(
                    subject=self.subject,
                    body=self.message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[recipient],
                    connection=connection 
                )
                emails_to_send.append(email)
            
            connection.send_messages(emails_to_send)
            
            print(f"✅ Successfully sent {len(emails_to_send)} announcement emails in the background!")
            
        except Exception as e:
            print(f"❌ Failed to send background email: {e}")

def send_background_mass_email(subject, message, recipient_emails):
    """
    Takes a list of emails and sends them all in a background thread.
    """
    if not recipient_emails:
        print("⚠️ No recipient emails provided. Skipping email broadcast.")
        return
    
    MassEmailThread(subject, message, recipient_emails).start()