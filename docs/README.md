# 🏋️ Gymer — Enterprise Gym Management System

Full-stack gym management platform. **React + Vite** frontend, **Node.js/Express (TypeScript)** backend, **SQL Server** database.

## Core Features

| Feature | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Dashboard | ✅ | ✅ API | ✅ Stats + Charts |
| Video Library | ✅ | ✅ API | ✅ Wired |
| Coach Booking | ✅ | ✅ API | ✅ Wired |
| Membership Plans | ✅ | ✅ API | ✅ Wired |
| User Profile | ✅ | ✅ API | ✅ Wired |
| CRM | ✅ | ✅ API | ✅ Full page |
| Referral Program | ✅ | ✅ API | ✅ Full page |
| Coupons | ✅ | ✅ API | ✅ Full page |
| Loyalty Points | ✅ | ✅ API | ✅ Full page |
| Support Tickets | ✅ | ✅ API | ✅ Full page |
| Invoices | ✅ | ✅ API | ✅ Full page |
| Analytics | ✅ | ✅ API | ✅ Charts |
| Audit Logging | ✅ | ✅ API | ✅ Full page |
| Backup Management | ✅ | ✅ API | ✅ Full page |
| Revenue Dashboard | ✅ | ✅ API | ✅ Full page |
| PWA | ✅ | — | ✅ Service worker |

## Security

| Layer | Implementation |
|-------|---------------|
| Password Hashing | bcrypt 12 rounds |
| Authentication | JWT (access + refresh tokens) |
| Authorization | RBAC (admin/coach/member) |
| Rate Limiting | express-rate-limit (100 req/15min, auth: 10/15min) |
| CORS | Origin validation + credentials |
| HTTP Headers | Helmet (CSP, HSTS, X-Frame-Options) |
| Input Validation | Zod schemas + express-validator |
| Input Sanitization | XSS + SQLi pattern detection |
| CSRF Protection | Token-based (x-csrf-token header) |
| Session Security | secure + httpOnly + sameSite cookies |
| Audit Logging | Winston + DailyRotateFile (30d retention) |
| Error Handling | Custom AppError + structured responses |

## Tech Stack

**Frontend:** React 18 + TypeScript, Vite, TailwindCSS (dark), React Router v6 (lazy routes), Zustand, Axios, Recharts, Lucide, Framer Motion, PWA

**Backend:** Node.js + Express + TypeScript, SQL Server (mssql), JWT, Zod validation, Winston logging, bcryptjs, Helmet, express-rate-limit, express-session, Redis (rate limiting)

**Database:** SQL Server 2022, 34 tables

**Testing:** Vitest + @testing-library/react (frontend), 13 unit tests

## Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env  # configure DB, JWT secrets, CORS_ORIGIN
npm run build
npm start

# Frontend
cd frontend
npm install
npm run build
npm run preview   # or npm run dev for dev server
```

## Folder Structure

```
D:\gymer\
├── backend/
│   ├── src/
│   │   ├── config/          # config.ts, redis.ts
│   │   ├── middleware/       # auth, csrf, sanitize, session, rateLimiter, auditLogger, securityHeaders, errorHandler
│   │   ├── modules/         # auth, bookings, coaches, plans, videos, referral, coupon, loyalty, audit, analytics, crm, tickets, invoices, backup, revenue
│   │   ├── utils/           # logger, response helpers
│   │   ├── types/           # TypeScript interfaces
│   │   ├── app.ts           # Express app (security middleware stack)
│   │   └── index.ts         # Server entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # shared (StatCard, DataTable, page-header) + ui (button, input, badge, card, etc.)
│   │   ├── pages/           # 30+ page components
│   │   ├── services/        # plans.ts, videos.ts, coaches.ts (API service layer)
│   │   ├── stores/          # Zustand authStore
│   │   ├── api/             # axios instance + interceptors
│   │   ├── lib/             # utils (cn, formatDate, etc.)
│   │   └── __tests__/       # Vitest unit tests (13 tests)
│   ├── vitest.config.ts
│   └── package.json
├── database/                # SQL schema + seed data
├── docs/                    # Generated documentation
├── README.md
├── DEVELOPER_GUIDE.md
└── ROADMAP.md
```

## API Endpoints (Key)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login, get JWT tokens |
| POST | /api/auth/refresh | No | Refresh access token |
| GET | /api/auth/me | Yes | Get current user profile |
| PUT | /api/auth/me | Yes | Update profile |
| PUT | /api/auth/password | Yes | Change password |
| GET | /api/plans | No | List membership plans |
| GET | /api/videos | No | List videos |
| GET | /api/videos/categories | No | List video categories |
| GET | /api/bookings/coaches | No | List coaches |
| GET | /api/bookings/coaches/:id/availability | No | Coach availability |
| GET | /api/crm | Yes | CRM data |
| GET | /api/referral/my-code | Yes | My referral code |
| GET | /api/coupons | Yes | List coupons |
| GET | /api/loyalty/points | Yes | My loyalty points |
| GET | /api/tickets | Yes | List support tickets |
| GET | /api/invoices | Yes | List invoices |
| GET | /api/audit | Admin | Audit logs |
| GET | /api/analytics/overview | Admin | Analytics overview |
| GET | /api/revenue/dashboard | Admin | Revenue dashboard |
| GET | /api/backup | Admin | Backup management |
| GET | /api/csrf-token | Yes | Get CSRF token |
