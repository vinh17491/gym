# 🏋️ Gymer — Enterprise Gym Management System

Full-stack gym management platform. **React + Vite** frontend, **Node.js/Express (TypeScript)** backend, **SQL Server** database.

## Business Purpose

Gymer enables gym owners to manage memberships, track members, process payments, run referrals, manage coaches, handle support tickets, and analyze business performance — all in a dark-theme interface.

## Core Features

| Feature | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Dashboard | ✅ | ✅ API | ✅ Stats + Charts |
| Video Library | 🟡 UI only | ❌ No API | ✅ Hardcoded UI |
| Coach Booking | 🟡 UI only | ❌ No API | ✅ Hardcoded UI |
| Membership Plans | 🟡 UI only | ❌ No API | ✅ Hardcoded UI |
| User Profile | 🟡 UI only | ❌ No save API | ✅ Placeholder save |
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

## Tech Stack

**Frontend:** React 18 + TypeScript, Vite, TailwindCSS (dark), React Router v6 (lazy routes), Zustand, Axios, Recharts, Lucide, Framer Motion, react-hot-toast, PWA

**Backend:** Node.js + Express + TypeScript, SQL Server (mssql), JWT (access + refresh tokens), Zod validation, Winston logging, bcryptjs, Helmet, express-rate-limit, nodemailer (installed, not wired)

**Database:** SQL Server 2022, 34 tables, 0 stored procs (see note)

**Infrastructure:** Docker + Docker Compose, Nginx reverse proxy

> ⚠️ **Note:** The schema drops 8 stored procedures but never creates them. The `analytics`, `revenue`, and `loyalty` controllers call `executeProc()` which will fail at runtime if these procs are expected. This needs to be fixed before production deployment.

## Folder Structure

```
D:\gymer\
├── README.md
├── DEVELOPER_GUIDE.md
├── PROJECT_AUDIT.md
├── ROADMAP.md
├── database/
│   └── full_schema.sql       — Complete schema + seed data (SSMS → F5)
├── backend/
│   └── src/
│       ├── config/           — DB connection, app config
│       ├── middleware/        — Auth, validation, error handler, rate limiter, audit log
│       ├── modules/           — Feature modules (auth, coaches, crm, coupons, ...)
│       │   ├── affiliate/     — ⚠️ Empty scaffold (0 files)
│       │   ├── notifications/ — ⚠️ Empty scaffold (0 files)
│       │   └── users/         — ⚠️ Empty scaffold (0 files)
│       ├── jobs/              — ⚠️ Empty scaffold (0 files)
│       ├── templates/         — ⚠️ Empty scaffold (0 files)
│       ├── types/             — TypeScript types (UserRole, IUser, IJwtPayload)
│       └── utils/             — Logger, response helpers
├── frontend/
│   └── src/
│       ├── api/              — Axios instance + JWT interceptors
│       ├── components/
│       │   ├── layout/       — Layout, Sidebar, CommandMenu
│       │   ├── shared/       — StatCard (ReactNode icon), DataTable, PageHeader, PageTransition
│       │   └── ui/           — Button, Input, Badge, Dialog, Skeleton, StatCard (LucideIcon), ...
│       ├── hooks/            — useApi (GET only, no POST/PUT/DELETE)
│       ├── lib/              — Utils (cn, formatDate, formatCurrency)
│       ├── pages/            — 17 page components
│       ├── stores/           — Zustand authStore
│       └── types/            — TypeScript interfaces
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf
├── setup.bat
├── setup.sh
└── setup-docker.sh
```

## Quick Start

### Prerequisites
- Node.js 18+
- SQL Server (local or Docker)
- SQL Server Management Studio (SSMS)

### 1. Database

Open `database/full_schema.sql` in SSMS → **F5**

Or via CLI:
```bash
sqlcmd -S localhost -E -i database/full_schema.sql
```

Creates DB `gymer` + 34 tables + seed data.

### 2. Backend

```bash
cd backend
cp .env.example .env     # Edit with your DB credentials
npm install
npm run dev              # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

### 4. Login

| Email | Password | Role |
|---|---|---|
| admin@gymer.com | admin123 | Admin |

> ⚠️ These are development credentials. Change before any non-local deployment.

## Build for Production

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Docker

```bash
docker-compose build
docker-compose up -d
```

Services:
- **frontend** → `http://localhost:80` (Nginx)
- **backend** → `http://localhost:5000`
- **db** → `localhost:1433` (SQL Server 2022)

> ⚠️ Docker SA password is hardcoded in `docker-compose.yml`. Use Docker secrets for production.

## Roles & Permissions

| Role | Access |
|------|--------|
| **Member** | Dashboard, Video, Booking, Tickets, Referral, Loyalty, Invoices, Profile, Settings |
| **Coach** | Coach Dashboard, assigned members, monthly statement |
| **Admin** | Full: Admin Dashboard, Analytics, Revenue, Audit, Backup, CRM, Coupons |

## Known Limitations

- **4 pages with no backend:** Video Library, Coach Booking, Membership Plans, User Profile (UI-only, hardcoded data)
- **No stored procedures:** Schema references 8 procs but none are created — `executeProc()` calls will fail
- **No tests:** Zero automated tests in the entire codebase
- **No CI/CD:** No GitHub Actions or deployment pipeline
- **Password change is placeholder:** SettingsPage doesn't actually call an API
- **Backup restore has SQL injection:** Must be fixed before production
- **`sendEmail` is a no-op:** Invoice email endpoint just sets a flag

See `PROJECT_AUDIT.md` for full details.

## Environment Variables

Copy `backend/.env.example` → `backend/.env` and configure:

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Backend port |
| DB_HOST | localhost | SQL Server host |
| DB_PORT | 1433 | SQL Server port |
| DB_NAME | gymer | Database name |
| DB_TRUSTED_CONNECTION | true | Use Windows Auth |
| DB_USER | — | SQL auth user (when TRUSTED_CONNECTION=false) |
| DB_PASSWORD | — | SQL auth password |
| JWT_ACCESS_SECRET | dev-acc...n | JWT signing key |
| JWT_REFRESH_SECRET | dev-refresh-secret-32c | Refresh token key |
| CORS_ORIGIN | http://localhost:5173 | Allowed origin |
| SMTP_HOST | smtp.gmail.com | Email server |
| SMTP_PORT | 587 | Email port |
| UPLOAD_DIR | ./uploads | File storage path |
| BACKUP_DIR | ./backups | Backup storage path |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Can't connect to SQL Server | Check SQL Server is running (SQL Server Configuration Manager) |
| Port 5000 in use | Edit `PORT` in `backend/.env` |
| Port 5173 in use | Edit port in `frontend/vite.config.ts` |
| Backend crashes silently | Check `backend/logs/` directory |
| Stored procedure errors | Add missing CREATE PROCEDURE statements to schema |
| CORS errors in browser | Update `CORS_ORIGIN` in `.env` to match frontend URL |
| `executeProc` fails | Stored procedures don't exist — use inline SQL or add them to schema |
