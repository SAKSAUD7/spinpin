# Ninja Inflatable Park - Management System

A comprehensive web-based management system for Ninja Inflatable Park, featuring session bookings, party bookings, waiver management, and a full CMS.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14.1.0 (React 18)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Custom component library
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **QR Codes**: qrcode library
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast, Sonner
- **Testing**: Vitest, Testing Library

### Backend
- **Framework**: Django 5.0+
- **API**: Django REST Framework
- **Authentication**: JWT (Simple JWT)
- **Documentation**: DRF Spectacular (OpenAPI/Swagger)
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Image Processing**: Pillow
- **PDF Generation**: ReportLab

---

## 📁 Project Structure

This is a **monorepo** managed with **Turborepo**, containing the frontend, backend, and shared packages.

```
ninjainflatablepark-4/
├── backend/                 # Django backend
│   ├── apps/
│   │   ├── bookings/       # Session & party bookings
│   │   ├── cms/            # Content management
│   │   ├── core/           # User auth & core models
│   │   └── shop/           # E-commerce (future)
│   ├── media/              # Uploaded images
│   ├── ninja_backend/      # Django settings
│   ├── db.sqlite3          # Database
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/               # Next.js frontend (workspace)
│   ├── app/
│   │   ├── (main)/        # Public pages
│   │   └── (admin-portal)/ # Admin panel
│   ├── components/         # React components
│   ├── lib/               # Utilities & API clients
│   ├── public/            # Static assets
│   └── package.json
│
├── packages/              # Shared packages
│   ├── ui/                # Shared UI components
│   ├── types/             # TypeScript types & Zod schemas
│   └── database/          # Database utilities
│
├── package.json           # Root package.json (monorepo)
└── turbo.json            # Turborepo configuration
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm 10+ (for workspace support)

### 1. Clone Repository
```bash
git clone <repository-url>
cd ninjainflatablepark-4
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

Backend will run at: `http://localhost:8000`

### 3. Frontend Setup (Monorepo)
```bash
# Return to root directory
cd ..

# Install all dependencies (root + workspaces)
npm install

# Start development server (uses Turborepo)
npm run dev
```

Frontend will run at: `http://localhost:5000`

> **Note**: The monorepo uses Turborepo to manage builds and development. The `npm run dev` command from the root will start the frontend development server on port 5000.

---

## 🔑 Admin Access

### Frontend Admin Panel
- URL: `http://localhost:5000/admin`
- Login with your superuser credentials

### Django Admin
- URL: `http://localhost:8000/admin`
- Full database access

---

## 🎯 Features

### Public Website
- ✅ Homepage with hero section
- ✅ About page
- ✅ Attractions showcase
- ✅ Facilities information
- ✅ Pricing plans
- ✅ Party packages
- ✅ Guidelines & safety
- ✅ Group bookings
- ✅ Contact form
- ✅ Session booking system
- ✅ Party booking system
- ✅ Digital waiver signing

### Admin Panel
- ✅ Dashboard with analytics
- ✅ Session bookings management
- ✅ Party bookings management (with calendar view)
- ✅ E-invitation system with templates
- ✅ QR code generation for bookings
- ✅ Waiver management
- ✅ Customer database
- ✅ CMS for all content (attractions, facilities, pricing, etc.)
- ✅ Settings management
- ✅ User management

### Backend API
- ✅ RESTful API
- ✅ JWT authentication
- ✅ OpenAPI documentation
- ✅ CORS configured
- ✅ Media file handling

---

## 🚀 Deployment

### Production Checklist

#### Backend
1. Set `DEBUG = False` in `settings.py`
2. Configure `ALLOWED_HOSTS`
3. Generate new `SECRET_KEY`
4. Migrate to PostgreSQL
5. Configure static files
6. Set up HTTPS

#### Frontend
1. Build production bundle:
   ```bash
   npm run build
   npm start
   ```
2. Configure environment variables
3. Set up CDN for static assets

### Recommended Hosting
- **Backend**: Azure App Service / Heroku / Railway
- **Frontend**: Vercel / Netlify / Azure Static Web Apps
- **Database**: Azure Database for PostgreSQL
- **Media**: Azure Blob Storage / AWS S3

---

## 📊 Database Schema

### Main Models
- **User**: Custom user model with email authentication
- **Booking**: Session bookings
- **PartyBooking**: Party bookings
- **Waiver**: Digital waivers
- **Customer**: Customer information
- **CMS Models**: Homepage, About, Attractions, etc.

---

## 🔧 Development

### Backend Commands
```bash
# Run migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver

# Run tests
python manage.py test
```

### Frontend Commands (Monorepo)
```bash
# Development (from root)
npm run dev

# Production build (all workspaces)
npm run build

# Build only frontend
npm run build:web

# Linting (all workspaces)
npm run lint

# Format code
npm run format
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/token/` - Get JWT token
- `POST /api/token/refresh/` - Refresh token

### Bookings
- `GET/POST /api/v1/bookings/bookings/` - Session bookings
- `GET/POST /api/v1/bookings/party-bookings/` - Party bookings
- `GET/POST /api/v1/bookings/waivers/` - Waivers

### CMS
- `GET /api/v1/cms/home/` - Homepage content
- `GET /api/v1/cms/about/` - About page content
- `GET /api/v1/cms/attractions/` - Attractions
- And more...

### Documentation
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`

---

## 🔒 Security

### Recent Security Audit (December 2025)
✅ **Comprehensive security audit completed and critical vulnerabilities fixed**

**Fixed Issues**:
- ✅ **P0 Critical**: Secured public access to booking and waiver endpoints
- ✅ Customer data now protected (names, emails, phone numbers, booking details)
- ✅ Admin-only access enforced for sensitive data listing

**Current Security Measures**:
- ✅ JWT authentication for API access
- ✅ Admin-only permissions for customer data endpoints
- ✅ CORS configured for cross-origin requests
- ✅ CSRF protection enabled
- ✅ Password hashing with Django's built-in security
- ⚠️ Set `DEBUG = False` in production
- ⚠️ Use strong `SECRET_KEY` in production
- ⚠️ Configure HTTPS for production deployment

**API Endpoint Security**:
- 🔒 `GET /api/v1/bookings/bookings/` - Admin only
- 🔒 `GET /api/v1/bookings/waivers/` - Admin only
- ✅ `POST /api/v1/bookings/bookings/` - Public (booking creation)
- ✅ `POST /api/v1/bookings/waivers/` - Public (waiver signing)
- ✅ `GET /api/v1/bookings/bookings/ticket/{uuid}/` - Public (ticket retrieval)

For detailed security audit report, see project documentation.

---

## 📝 Environment Variables

### Backend (.env)
```env
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://...
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Database Issues
```bash
# Reset database
python manage.py flush
python manage.py migrate
```

### Frontend Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

---

## 📞 Support

For issues or questions:
- Check existing documentation
- Review error logs
- Contact development team

---

## 📄 License

Proprietary - Ninja Inflatable Park

---

## 👥 Credits

**Developed for**: Ninja Inflatable Park  
**Technology**: Next.js, Django, React, PostgreSQL  
**Version**: 1.0.0

---

**Last Updated**: December 10, 2025 - Security audit completed and critical fixes applied
