
from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta


load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')

if not SECRET_KEY:
    raise Exception("SECRET_KEY not found in environment variables")


DEBUG =os.getenv('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

AUTH_USER_MODEL = 'accounts.User'


load_dotenv()
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/


RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'apps.accounts.authentication.CookieJWTAuthentication', 
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'apps.admin_panel.pagination.CustomPagination',
    'PAGE_SIZE': 10,
}


SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=20),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,

    'AUTH_COOKIE':'access_token',          
    'AUTH_COOKIE_REFRESH': 'refresh_token', 
    'AUTH_COOKIE_SECURE': False,            
    'AUTH_COOKIE_SAMESITE': 'Lax',          
}


AUTHENTICATION_BACKENDS = [
    'apps.accounts.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]


# Application definition

INSTALLED_APPS = [
    'apps.accounts',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    "rest_framework_simplejwt.token_blacklist",
    'rest_framework',
    'rest_framework.authtoken',
    'apps.api',
    'apps.admin_panel',
    'corsheaders',
    'channels',
    'apps.apartment',
    'apps.webapp',
    'apps.resident',
    'apps.staff',
    'apps.issue',
    'apps.bills',
    'apps.salary',
]

MIDDLEWARE = [
    
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'community.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'community.wsgi.application'

ASGI_APPLICATION = 'community.asgi.application'

# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', '127.0.0.1'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}



# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'


CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
]


MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


FRONTEND_URL = "http://localhost:5173"
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587

EMAIL_HOST_USER = 'justinejosephine007@gmail.com'
EMAIL_HOST_PASSWORD = 'hqwjljdbzouqrirw'
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = 'justinejosephine007@gmail.com'



















# # --- EMAIL SETTINGS (PRODUCTION) ---
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'  # Or smtp.sendgrid.net, etc.
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True

# # The actual email account your server uses to log in and send the mail
# EMAIL_HOST_USER = 'apartcare.system@gmail.com' 
# # An "App Password" generated in your Google Account security settings
# EMAIL_HOST_PASSWORD = 'abcd-efgh-ijkl-mnop'    

# DEFAULT_FROM_EMAIL = 'ApartCare <apartcare.system@gmail.com>'
# FRONTEND_URL = "https://www.yourrealwebsite.com"