# ApartCare - Community Management System

ApartCare is a comprehensive, role-based community management platform built with React, Redux, and Django. It digitizes and streamlines apartment operations by providing dedicated, real-time dashboards for SuperAdmins, Admins, Residents, and Staff.

The system features an intelligent issue-triage pipeline, financial tracking, SaaS subscription management via Razorpay, and a live communication layer powered by Django Channels and WebSockets.

---

## 🚀 Tech Stack

* **Frontend:** React, Redux Toolkit, Tailwind CSS, Vite
* **Backend:** Django, Django REST Framework, Django Channels (ASGI)
* **Real-time / Messaging:** Redis, WebSockets
* **Database:** PostgreSQL / SQLite
* **Payment Gateway:** Razorpay SDK

---

## 📋 System Prerequisites

Ensure you have the following installed on your local machine:

* **Python:** `3.10+`
* **Node.js:** `18.x` or `20.x` (LTS recommended) and `npm`
* **Redis Server:** Running on `localhost:6379` (Required for WebSockets / Django Channels)
* **Git**

---

## ⚙️ Environment Configuration

### 1. Backend Environment Variables (`backend/.env`)

Create a file named `.env` inside the `backend/` directory:

```env
# Django Core Settings
SECRET_KEY=your_django_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration (Defaults to SQLite if omitted)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=apartcare_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# CORS & Frontend Origin
CORS_ALLOWED_ORIGINS=http://localhost:5173,[http://127.0.0.1:5173](http://127.0.0.1:5173)

# Redis Channel Layers (WebSockets & Live Telemetry)
REDIS_URL=redis://127.0.0.1:6379/1

# Razorpay Payment Gateway Credentials (Test Keys)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Email Settings (Password Resets & Notifications)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_smtp_app_password
```
Create a file named .env inside the frontend/ directory:

# API Base Route
VITE_API_BASE_URL=http://localhost:8000/api

# WebSocket Telemetry & Chat Server
VITE_WS_BASE_URL=ws://localhost:8000

# Razorpay Checkout Public Identifier
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id

#Local Installation & Execution
redis-server

#Backend Setup (Django & ASGI)
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create SuperAdmin
python manage.py createsuperuser

# Start development server
python manage.py runserver
The backend API will run on http://127.0.0.1:8000/

#Frontend Setup (React & Vite)

cd frontend

# Install dependencies
npm install

# Start Vite server
npm run dev
The frontend interface will run on http://localhost:5173/.


### Step 2: Create Example Environment Files (`.env.example`)

Standard repository best practice is to commit sample files so users and reviewers know exactly what keys to supply:

1. **`backend/.env.example`**
   Create this file with blank/sample values for `SECRET_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `REDIS_URL`, etc.
2. **`frontend/.env.example`**
   Create this file with `VITE_API_BASE_URL`, `VITE_WS_BASE_URL`, and `VITE_RAZORPAY_KEY_ID`.

---

### Step 3: Commit and Push
Once saved:
```bash
git add README.md backend/.env.example frontend/.env.example
git commit -m "docs: add environment setup documentation and env examples"
git push origin main

SUPER_ADMIN: /super-admin/Dashboard (Community onboarding, global pricing matrix)

ADMIN: /admin/dashboard (Staff management, billing, announcements, SaaS subscription)

RESIDENT: /resident/dashboard (Maintenance tickets, utility dues, venue booking, subscription & invoice review)

STAFF: /staff/dashboard (Issue ticketing and payslips)
