# ApartCare - Community Management System

ApartCare is a comprehensive, role-based community management platform built with React, Redux, and Django. It digitizes and streamlines apartment operations by providing dedicated, real-time dashboards for Admins, Residents, and Staff. 

The system features an intelligent issue-triage pipeline, financial tracking, and a live communication layer powered by Django Channels and WebSockets.

## 🚀 Tech Stack
* **Frontend:** React, Redux Toolkit, Tailwind CSS, Vite
* **Backend:** Django, Django REST Framework, Django Channels (WebSockets)
* **Database:** PostgreSQL / SQLite
* **Real-time:** Redis

## ✨ Key Features
* **Role-Based Dashboards:** Unique, secure interfaces for Admins, Residents, and Staff.
* **Real-Time Global & Private Chat:** Universal WebSocket consumer handling community-wide broadcasts and private 3-way ticket resolutions.
* **Issue Triage Pipeline:** Track maintenance issues from creation to resolution, complete with staff assignment and status-locking.
* **Financial Module:** Automated billing generation and staff salary tracking.
* **Facility Management:** Hall booking and meeting scheduling.

## 🛠️ Local Installation Guide

### 1. Clone the repository
\`\`\`command prompt
git clone https://github.com/justu007/ApartCare.git
cd ApartCare
\`\`\`

### 2. Backend Setup (Django)
Open a terminal and navigate to the backend directory:
\`\`\`command prompt
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
\`\`\`

Create a `.env` file in the backend root and add your secret keys. Then run migrations:
\`\`\`command prompt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
\`\`\`

### 3. Frontend Setup (React)
Open a new terminal and navigate to the frontend directory:
\`\`\`command prompt
cd frontend
npm install
npm run dev
\`\`\`

The application will now be running on `http://localhost:5173/`.