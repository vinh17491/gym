# Gymer - Enterprise Fitness Management

Full-stack gym management system with 13 enterprise features.

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, SQL Server
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **PWA**: Workbox, Vite PWA Plugin
- **Charts**: Recharts
- **State**: Zustand

## Features
1. Referral & Affiliate System
2. Coupon & Promotion System
3. Loyalty Points System
4. Audit Log System
5. Advanced Analytics
6. CRM System
7. Support Tickets
8. PDF Invoice Generation
9. Backup & Recovery
10. Admin Revenue Dashboard
11. Coach Revenue Dashboard
12. Mobile PWA
13. Production Security

## Quick Start

### Development
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

### Docker
```bash
docker-compose up -d
```

## API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/health
- /api/referral/*
- /api/coupons/*
- /api/loyalty/*
- /api/audit/*
- /api/analytics/*
- /api/crm/*
- /api/tickets/*
- /api/invoices/*
- /api/backup/*
- /api/revenue/*
- /api/coaches/*

## Database
Run the single SQL file to create all tables, stored procedures, and seed data:
```bash
sqlcmd -S localhost -U sa -P GymerSecure123! -d gymer -i database/full_schema.sql
```
