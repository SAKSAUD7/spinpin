# SpinPin Leicester - Full Delivery & Deployment Guide

This guide contains everything you need to set up, deploy, and manage the SpinPin platform (Frontend, Backend, Database, and Payment Integration).

## 1. Project Architecture

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, Framer Motion
- **Backend**: Django 5.1.4, Django REST Framework (DRF), Django Ninja
- **Database**: SQLite (Local) / MySQL or PostgreSQL (Production recommended)
- **Payments**: SumUp API (Dual-merchant integration)

---

## 2. Environment Variables Setup

Both the frontend and backend require `.env` files.

### Backend (`backend/.env`)
Create a `.env` file in the `backend` folder:

```ini
# Core Django
SECRET_KEY=your-secure-secret-key
DEBUG=True # Set to False in production
ALLOWED_HOSTS=localhost,127.0.0.1,your-production-domain.com
CORS_ALLOWED_ORIGINS=http://localhost:5000,http://localhost:3000,https://your-production-domain.com

# Database (Default is SQLite for dev)
DB_ENGINE=django.db.backends.sqlite3

# Email Settings (Configure Azure or SMTP for production)
EMAIL_ENABLED=True
EMAIL_BOOKING_ENABLED=True

# Payment Configuration (Dual-Merchant SumUp)
PAYMENT_MODE=sumup
SUMUP_RETURN_URL=https://your-production-domain.com/book/success

# SpinPin Ltd (Skating/Arcade)
SUMUP_SKATING_API_KEY=sup_sk_fLnsSyO1H7KviBiaeq5NcPDKYULWioiyM
SUMUP_SKATING_MERCHANT_CODE=MC933QM6

# Twinkle Town Ltd (Bowling)
SUMUP_BOWLING_API_KEY=sup_sk_rvC5s5NFxx2lNzKd54bJgXFwCDXnSCP8S
SUMUP_BOWLING_MERCHANT_CODE=M7EN4CMZ
```

### Frontend (`frontend/.env.local`)
Create a `.env.local` file in the `frontend` folder:

```ini
NEXT_PUBLIC_API_URL=http://localhost:9000/api/v1 # Update to production API URL
```

---

## 3. Database Setup & Migrations

The backend uses Django ORM. To set up the database from scratch:

1. Open a terminal in the `backend` directory.
2. Activate your virtual environment (e.g., `.\.venv\Scripts\activate`).
3. Run the migrations to create the database tables:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
4. Create an admin superuser to access the Django admin panel and frontend CMS portal:
   ```bash
   python manage.py createsuperuser
   ```
   *Follow the prompts to enter a username, email, and password.*

---

## 4. Running the Application Locally

### Start the Backend Server (Port 9000)
```bash
cd backend
.\.venv\Scripts\activate
python manage.py runserver 9000
```

### Start the Frontend Server (Port 5000)
```bash
cd frontend
npm install
npm run dev
```

The website will be available at `http://localhost:5000`.

---

## 5. SumUp Payment Gateway Integration

The platform is integrated with **SumUp Checkout API** to support two separate merchant accounts based on the booked activity:

- **Roller Skating & Arcade**: Routes payments to **SpinPin Ltd**.
- **Ten Pin Bowling**: Routes payments to **Twinkle Town Ltd**.

### How it works:
1. When a user books "Roller Skating", the backend selects the `SUMUP_SKATING_API_KEY` and creates a checkout session for SpinPin Ltd.
2. When a user books "Ten Pin Bowling", the backend selects the `SUMUP_BOWLING_API_KEY` and creates a checkout session for Twinkle Town Ltd.
3. The user is redirected to the securely hosted SumUp payment page.
4. After payment, the user is redirected back to the `/book/success` page.
5. The backend verifies the transaction with SumUp and updates the booking status to `PAID`.

---

## 6. Deployment Guidelines (VPS / Server)

If deploying to a Hostinger VPS or similar Ubuntu server:

1. **Backend (Gunicorn & PM2/Systemd)**:
   - Use `gunicorn` to serve the Django application.
   - Run the API behind Nginx reverse proxy on port 9000.
   - Example PM2 command: `pm2 start "gunicorn ninja_backend.wsgi:application --bind 0.0.0.0:9000" --name spinpin-api`

2. **Frontend (Next.js)**:
   - Build the Next.js app: `npm run build`
   - Start the production server: `npm start`
   - Run via PM2: `pm2 start npm --name spinpin-web -- start`

3. **Nginx Reverse Proxy**:
   - Route `yourdomain.com/api` to `localhost:9000`
   - Route `yourdomain.com` to `localhost:5000` (or whichever port Next.js is running on)

---

## 7. Email & Communication

To enable booking confirmation emails, you will need to update the Azure Communication Services or SMTP settings in the production `.env` file. The integration is already built into `apps.emails.services`.

*End of Document*
