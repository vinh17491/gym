# 🏋️ Gymer — Enterprise Gym Management System

Full-stack enterprise gym management platform. **React + Vite** frontend, **Node.js/Express (TypeScript)** backend, **SQL Server** database.

## Business Purpose

Gymer helps gym owners manage memberships, track members, process payments, run referral programs, manage coaches, handle support tickets, and analyze business performance — all in one dark-theme platform.

## Core Features

| Feature | Description |
|---------|-------------|
| Dashboard | Member, Admin, Coach views with stats, charts, KPIs |
| Video Library | Browse/search workout videos *(UI only — needs backend)* |
| Coach Booking | Find coaches, book sessions *(UI only — needs backend)* |
| Membership Plans | Tiered pricing with monthly/yearly billing *(UI only)* |
| CRM | Customer tracking with tags, LTV, risk scoring |
| Referral Program | Share links, earn commissions |
| Coupons | Discount code management |
| Loyalty Points | Points system with rewards catalog |
| Support Tickets | Issue tracking with messages |
| Invoices | Automated invoice generation |
| Analytics | DAU/MAU, revenue, retention, conversion |
| Audit Logging | Full system activity tracking |
| Backup Management | DB backup creation & monitoring |
| Revenue Dashboard | Financial overview & trends |
| User Management | Registration, login, profile, RBAC |
| PWA | Installable, offline cache, app-like experience |

## Tech Stack

**Frontend:** React 18 + TypeScript, Vite, TailwindCSS (dark), React Router v6 (lazy routes), Zustand, Axios, Recharts, Lucide, Framer Motion, PWA

**Backend:** Node.js + Express + TypeScript, SQL Server (mssql), JWT (access + refresh tokens), Zod validation, Winston logging, rate limiting, Helmet

**Infrastructure:** Docker + Docker Compose, Nginx reverse proxy

## Folder Structure

```
D:\gymer\
├── README.md
├── DEVELOPER_GUIDE.md
├── PROJECT_AUDIT.md
├── ROADMAP.md
├── database/
│   └── full_schema.sql       — Complete schema + demo data (F5 to run)
├── backend/
│   └── src/
│       ├── config/           — DB, env config
│       ├── middleware/        — Auth, validation, error, rate-limiter, audit
│       ├── modules/           — Feature modules (auth, coaches, crm, ...)
│       ├── types/             — TypeScript types
│       └── utils/             — Logger, response helpers
├── frontend/
│   └── src/
│       ├── api/              — Axios instance + interceptors
│       ├── components/
│       │   ├── layout/       — Layout, Sidebar, CommandMenu
│       │   ├── shared/       — DataTable, StatCard, page-header
│       │   └── ui/           — Button, Input, Badge, Dialog, Skeleton, ...
│       ├── hooks/            — useApi
│       ├── lib/              — Utils (cn, formatDate, formatCurrency)
│       ├── pages/            — Page components grouped by feature
│       ├── stores/           — Zustand stores
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

Creates DB `gymer` + 34 tables + 8 stored procs + seed data.

### 2. Backend

```bash
cd backend
npm install
npm run dev    # http://localhost:5000
```

### 3. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

### 4. Login

| Email | Password | Role |
|---|---|---|
| admin@gymer.com | admin123 | Admin |

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

## Roles & Permissions

| Role | Access |
|------|--------|
| **Member** | Dashboard, Video, Booking, Tickets, Referral, Loyalty, Invoices, Profile |
| **Coach** | Coach Dashboard, assigned members, schedule |
| **Admin** | Full: Admin Dashboard, Analytics, Revenue, Audit, Backup, CRM |

## Environment Variables

Copy `backend/.env.example` → `backend/.env` and configure DB connection.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Can't connect to SQL Server | Check SQL Server is running (SQL Server Configuration Manager) |
| Port 5000 in use | Edit `PORT` in `backend/.env` |
| Port 5173 in use | Edit port in `frontend/vite.config.ts` |
| Backend crashes silently | Check server logs in `backend/logs/` |
