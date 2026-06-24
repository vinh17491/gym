# Developer Guide

Technical knowledge base for the Gymer project. Read this to understand the entire system.

---

## Architecture Overview

### Data Flow

```
User Action → Component State → Axios API Call → Express Backend → SQL Server
                                          ↓
                                   Response (JSON)
                                          ↓
                              Zustand Store / Local State → Re-render
```

### Frontend Architecture

```
App
├── LoginPage (/login)
├── RegisterPage (/register)
└── Layout (Protected — requires JWT)
    ├── Sidebar (navigation, collapsible, mobile drawer)
    ├── CommandMenu (Ctrl+K global search)
    └── [Outlet] → Page Components
         ├── DashboardPage      /dashboard
         ├── VideoLibrary        /video         ← UI only, no backend
         ├── CoachBooking        /booking       ← UI only, no backend
         ├── MembershipPlans     /membership    ← UI only, no backend
         ├── UserProfile         /profile       ← UI only, no backend
         ├── MembersPage         /members
         ├── ReferralPage        /referral
         ├── CouponPage          /coupons
         ├── LoyaltyPage         /loyalty
         ├── TicketPage          /tickets
         ├── InvoicePage         /invoices
         ├── CRMPage             /crm
         ├── SettingsPage        /settings
         ├── AdminDashboard      /admin          (admin only)
         ├── AnalyticsPage       /admin/analytics (admin only)
         ├── AuditPage           /admin/audit     (admin only)
         ├── RevenuePage         /admin/revenue   (admin only)
         ├── BackupPage          /admin/backup    (admin only)
         └── CoachDashboard      /coach
```

**State Management:** Zustand (`authStore.ts`) — stores JWT + user info.

**Routing:** React Router v6 with `React.lazy()` for code splitting. `ProtectedRoute` checks `isAuthenticated`. `AdminRoute` checks `role === 'admin'`.

### Backend Architecture

```
Express App (app.ts)
├── Middleware: helmet → cors → compression → json → rate-limiter → morgan
├── Route mounting: /api/*
│   ├── /auth          — login, register, password
│   ├── /analytics     — dashboard stats
│   ├── /audit         — audit logs
│   ├── /backup        — backup management
│   ├── /coaches       — coach management
│   ├── /coupons       — coupon CRUD
│   ├── /crm           — customer management
│   ├── /invoices      — invoice management
│   ├── /loyalty       — points, rewards
│   ├── /referral      — referral codes, commissions
│   ├── /revenue       — revenue dashboard
│   └── /tickets       — support tickets
└── Error handlers
```

**Module pattern:** Each module = `routes.ts` + `controller.ts` + optional `validation.ts`

### Database Layer

```
Controller → query(sql, params) / executeProc(name, params) → mssql ConnectionPool → SQL Server
```

Single `ConnectionPool` singleton in `config/database.ts`. Supports Windows Auth (`DB_TRUSTED_CONNECTION=true`) or SQL Auth (`DB_USER` + `DB_PASSWORD`).

---

## Authentication Flow

```
1. User submits login form (email + password)
2. POST /api/auth/login → bcrypt.compareSync(password, hash)
3. Returns { accessToken, refreshToken, user }
4. Axios interceptor stores token in localStorage
5. All subsequent API calls include header: Authorization: Bearer <token>
6. Backend middleware: authenticate() → verifies JWT → sets req.user
7. On 401 → token refresh attempt → fails → redirect /login
```

**Admin login:** `admin@gymer.com` / `admin123` (bcrypt hash in DB)

**JWT:** Access token + Refresh token pair. Access expires faster; refresh used to obtain new access.

## Authorization Flow

```
Request → authenticate() middleware (JWT → req.user)
        → authorize(roles) middleware (checks req.user.role)
        → validate(Zod schema) middleware
        → Controller function
        → Response
```

**Roles:** `member`, `coach`, `admin`

| Endpoint Pattern | Required Role |
|---|---|
| `/api/auth/login`, `/api/auth/register` | Public |
| `/api/health` | Public |
| Most other endpoints | Any authenticated user |
| `/api/analytics/*`, `/api/revenue/*`, `/api/backup/*` | Admin |
| `/api/audit/*` | Admin |

---

## Key User Flows

### Registration
```
Register (/register) → POST /api/auth/register → INSERT Users → Redirect /login
```

### Login
```
Login (/login) → POST /api/auth/login → Verify bcrypt hash → Return JWT → localStorage → /dashboard
```

### Create Ticket
```
Tickets (/tickets) → Click "New Ticket" → Fill form → POST /api/tickets → Ticket in table
Reply: Click ticket → POST /api/tickets/:id/messages → Thread view
```

### Apply Coupon
```
Coupons (/coupons) → View list → POST /api/coupons (admin creates) → Code applied at checkout
```

### Earn Loyalty Points
```
Loyalty (/loyalty) → View balance → Actions earn points → GET /api/loyalty/points
Rewards: GET /api/loyalty/rewards → Claim → POST /api/loyalty/redeem
```

### Referral
```
Referral (/referral) → GET /api/referral/my-code → Copy link → Share
Friend clicks link → Registers → Commission auto-generated
```

### Revenue Analysis (Admin)
```
Admin → /admin/revenue → GET /api/revenue/dashboard
Charts: revenue trend, membership sales, conversion funnel
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Auth | Get current user |
| PUT | `/api/auth/password` | Auth | Change password |

### Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/dashboard` | Admin | Dashboard stats |

### Revenue
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/revenue/dashboard` | Admin | Revenue dashboard |

### CRM
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/crm` | Auth | List customers |
| POST | `/api/crm` | Auth | Create customer |
| PUT | `/api/crm/:id` | Auth | Update customer |
| DELETE | `/api/crm/:id` | Auth | Delete customer |

### Tickets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tickets` | Auth | List tickets |
| POST | `/api/tickets` | Auth | Create ticket |
| GET | `/api/tickets/:id` | Auth | Get ticket detail |
| POST | `/api/tickets/:id/messages` | Auth | Reply to ticket |

### Coupons
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/coupons` | Auth | List coupons |
| POST | `/api/coupons` | Auth | Create coupon |
| PUT | `/api/coupons/:id` | Auth | Update coupon |
| DELETE | `/api/coupons/:id` | Auth | Delete coupon |

### Loyalty
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/loyalty/points` | Auth | Get points balance |
| GET | `/api/loyalty/history` | Auth | Points history |
| GET | `/api/loyalty/rewards` | Auth | Rewards catalog |
| POST | `/api/loyalty/redeem` | Auth | Redeem reward |

### Referral
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/referral/my-code` | Auth | Get referral code |
| GET | `/api/referral/stats` | Auth | Referral stats |
| GET | `/api/referral/list` | Auth | List referrals |

### Invoices
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/invoices` | Auth | List invoices |
| POST | `/api/invoices` | Auth | Generate invoice |

### Audit
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/audit` | Admin | List audit logs |

### Backup
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/backup` | Admin | List backups |
| POST | `/api/backup` | Admin | Create backup |

### Coaches
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/coaches/dashboard` | Auth | Coach dashboard |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | Public | Health check |

---

## Database Overview

**Engine:** SQL Server  
**Schema file:** `database/full_schema.sql`  
**Tables:** 34  
**Stored Procedures:** 8  

### Key Tables

| Table | Purpose |
|-------|---------|
| Users | All user accounts (admin, coach, member) |
| Members | Member profiles linked to Users |
| Coaches | Coach profiles linked to Users |
| Plans | Membership plans (monthly/yearly) |
| Memberships | Active subscriptions per member |
| Payments | Payment transactions |
| Invoices | Generated invoices |
| Workouts | Workout definitions |
| WorkoutSessions | Individual workout completions |
| Videos | Video library entries |
| ReferralCodes | User referral codes |
| ReferralCommissions | Earned commissions |
| Coupons | Discount codes |
| CouponUsages | Coupon redemption records |
| Points | User loyalty point balances |
| PointTransactions | Points earn/redeem history |
| RewardsCatalog | Available loyalty rewards |
| Tickets | Support tickets |
| TicketMessages | Ticket reply threads |
| CRMCustomers | CRM customer records |
| CRMNotes | Internal notes per customer |
| CRMTasks | Follow-up tasks |
| AuditLogs | System activity audit trail |
| BackupLogs | Backup history |
| Promotions | Marketing promotions |
| Plans | Membership plans |

### Stored Procedures

| Procedure | Purpose |
|-----------|---------|
| sp_CalculateChurnRate | Calculate monthly churn |
| sp_GetDAUMAU | Daily/Monthly active users |
| sp_GetRevenueMetrics | Revenue KPIs |
| sp_GetRetentionCohorts | Cohort retention analysis |
| sp_GetConversionFunnel | Visitor → member conversion |
| sp_GetActivityHeatmap | Activity by day/hour |
| sp_GetTopMembers | Top members by activity |
| sp_BackupDatabase | Trigger DB backup |

---

## Middleware Pipeline

```
Request → Rate Limiter → authenticate (JWT) → authorize (roles) → validate (Zod) → Controller → Response
                                                                                         ↓
                                                                                    audit.ts (async log)
```

---

## Testing Guide

### How to Test Each Feature

**1. Authentication**
- Open `/register` → fill form → submit → redirect to `/login`
- Open `/login` → enter `admin@gymer.com` / `admin123` → redirect to `/dashboard`
- Check localStorage has `token`
- API: `POST /api/auth/login`, `POST /api/auth/register`
- DB: `Users` table
- Common failure: DB not connected

**2. Dashboard**
- Navigate `/dashboard` → verify stat cards show data
- API: `GET /api/analytics/dashboard`
- DB: `WorkoutSessions`, `Payments`, `Memberships`

**3. Tickets**
- Navigate `/tickets` → click "New Ticket" → fill form → submit
- Verify ticket appears in table
- API: `GET /api/tickets`, `POST /api/tickets`

**4. Coupons**
- Navigate `/coupons` → view list → create new coupon
- API: `GET /api/coupons`, `POST /api/coupons`

**5. Admin Features**
- Login as admin → navigate `/admin/analytics`, `/admin/revenue`, `/admin/audit`, `/admin/backup`
- Verify charts render and data loads
- API: respective endpoints

**6. Health Check**
```bash
curl http://localhost:5000/api/health
# → {"success":true,"message":"Gymer API running"}
```

### Quick Smoke Test (CLI)

```bash
# Login → get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gymer.com","password":"admin123"}' | python -c "import sys,json;print(json.load(sys.stdin)['data']['accessToken'])")

# Test each API
curl -s http://localhost:5000/api/health
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/analytics/dashboard
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/revenue/dashboard
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/crm
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/tickets
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/coupons
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/loyalty/points
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/audit
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/invoices
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/backup
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/referral/my-code
```

### Common Failures & Debug

| Error | Cause | Fix |
|-------|-------|-----|
| `ECONNREFUSED localhost:5000` | Backend not running | `cd backend && npm run dev` |
| `401 Unauthorized` | Token expired or invalid | Re-login to get new token |
| `DB unavailable` | Wrong SQL credentials | Check `backend/.env` DB config |
| `Cannot connect to SQL Server` | SQL Server not running | Start via SQL Server Configuration Manager |
| `Port 5000 in use` | Another process using port | Change `PORT` in `.env` or kill process |
| `Password shows ***` | Terminal redaction | Write `.env` via Python script (string concatenation) |

---

## Development Environment

### Starting Services

```bash
# Backend
cd backend
npm run dev          # http://localhost:5000

# Frontend (new terminal)
cd frontend
npm run dev          # http://localhost:5173
```

### Key Environment Variables (backend/.env)

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Backend port |
| DB_SERVER | localhost | SQL Server host |
| DB_NAME | gymer | Database name |
| DB_USER | sa | SQL login |
| DB_PASSWORD | MySecretPass123 | SQL password |
| DB_TRUSTED_CONNECTION | true | Use Windows Auth instead |
| JWT_SECRET | dev-secret | JWT signing key |
| JWT_REFRESH_SECRET | dev-refresh-secret | Refresh token key |

### Database Reset

Open `database/full_schema.sql` in SSMS → F5 (drops and recreates everything).

### Build

```bash
cd backend && npm run build    # tsc → dist/
cd frontend && npm run build   # vite build → dist/
```
