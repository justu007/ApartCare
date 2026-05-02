
# import threading
# from django.core.mail import send_mass_mail
# from django.conf import settings

# class MassEmailThread(threading.Thread):
#     def __init__(self, datatuple):
#         self.datatuple = datatuple
#         threading.Thread.__init__(self)

#     def run(self):
#         try:
#             send_mass_mail(self.datatuple, fail_silently=True)
#         except Exception as e:
#             print(f"Failed to send email: {e}")

# def send_background_mass_email(subject, message, recipient_emails):

#     if not recipient_emails:
#         return
    

#     messages = [
#         (subject, message, settings.DEFAULT_FROM_EMAIL, [email]) 
#         for email in recipient_emails
#     ]
    
#     MassEmailThread(tuple(messages)).start()

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
            # 1. Explicitly open a fresh connection just for this background thread
            connection = get_connection(fail_silently=False) 
            
            emails_to_send = []
            
            # 2. Build the individual emails
            for recipient in self.recipient_emails:
                email = EmailMessage(
                    subject=self.subject,
                    body=self.message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[recipient],
                    connection=connection # Attach the specific connection
                )
                emails_to_send.append(email)
            
            # 3. Send them all at once!
            connection.send_messages(emails_to_send)
            
            # 4. Success log!
            print(f"✅ Successfully sent {len(emails_to_send)} announcement emails in the background!")
            
        except Exception as e:
            # If it fails, print the EXACT error to your terminal
            print(f"❌ Failed to send background email: {e}")

def send_background_mass_email(subject, message, recipient_emails):
    """
    Takes a list of emails and sends them all in a background thread.
    """
    if not recipient_emails:
        print("⚠️ No recipient emails provided. Skipping email broadcast.")
        return
    
    # Start the robust thread
    MassEmailThread(subject, message, recipient_emails).start()