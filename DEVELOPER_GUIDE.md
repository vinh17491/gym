# Developer Guide — Gymer Technical Knowledge Base

Last updated: 2026-06-24

---

## Architecture Overview

### Data Flow

User Action → React Component → Axios API Call → Express Backend → SQL Server
                                      ↓
                               Response (JSON)
                                      ↓
                          Zustand Store / Local State → Re-render

### Frontend Architecture

App (React 18 + React Router v6)
├── LoginPage          /login          (public)
├── RegisterPage       /register       (public)
└── Layout (Protected — requires JWT from localStorage)
    ├── Sidebar (navigation, collapsible, mobile drawer)
    ├── CommandMenu (Ctrl+K global search — uses cmdk)
    └── [Outlet] → Page Components
         ├── DashboardPage       /dashboard      → redirects to /admin if admin, /coach if coach
         ├── MembersPage         /members        → GET /api/crm
         ├── ReferralPage        /referral       → GET /api/referral/my-code
         ├── CouponPage          /coupons        → GET /api/coupons
         ├── LoyaltyPage         /loyalty        → GET /api/loyalty/points, /loyalty/rewards
         ├── TicketPage          /tickets        → GET /api/tickets
         ├── InvoicePage         /invoices       → GET /api/invoices
         ├── CRMPage             /crm            → GET /api/crm
         ├── SettingsPage        /settings       → placeholder (no API)
         ├── AdminDashboard      /admin          → GET /api/revenue/dashboard (admin only)
         ├── AnalyticsPage       /admin/analytics → GET /api/analytics/* (admin only)
         ├── AuditPage           /admin/audit    → GET /api/audit (admin only)
         ├── RevenuePage         /admin/revenue  → GET /api/revenue/* (admin only)
         ├── BackupPage          /admin/backup   → GET /api/backup (admin only)
         ├── CoachDashboard      /coach          → GET /api/coaches/dashboard
         ├── VideoLibrary        /video          → HARDCODED (no API, route not in App.tsx)
         ├── CoachBooking        /booking        → HARDCODED (no API, route not in App.tsx)
         ├── MembershipPlans     /membership     → HARDCODED (no API, route not in App.tsx)
         └── UserProfile         /profile        → HARDCODED (no API, route not in App.tsx)

> Video, Booking, Membership, and Profile pages exist in pages/ but have NO routes in App.tsx. They cannot be navigated to.

### State Management

- Zustand (authStore.ts) — stores JWT token + user info, handles login/logout
- isAuthenticated initialized from localStorage.getItem('token') — does not validate token expiry
- refreshUser() calls GET /api/auth/me to sync user state

### Routing

- React Router v6 with React.lazy() for code splitting (via Vite)
- ProtectedRoute — checks isAuthenticated from authStore
- AdminRoute — checks user.role === 'admin'
- No CoachRoute exists — /coach has no client-side guard

### Backend Architecture

Express App (app.ts)
├── Middleware Pipeline:
│   helmet → cors → compression → json → rateLimiter → morgan (dev only)
├── Route Mounting (/api/*):
│   ├── /auth          → login, register, refresh, me, logout
│   ├── /analytics     → dashboard, revenue, retention, conversion, user-growth, export
│   ├── /audit         → logs (paginated), actions list
│   ├── /backup        → create, list, restore
│   ├── /coaches       → dashboard, member-growth, statement
│   ├── /coupons       → validate, create, list, stats
│   ├── /crm           → list customers, get, add note, create task
│   ├── /invoices      → list, get, generate, sendEmail (no-op)
│   ├── /loyalty       → points, history, rewards, redeem, daily-login
│   ├── /referral      → my-code, create, list, commission, all
│   ├── /revenue       → dashboard, trend, membership-sales, conversion-funnel
│   └── /tickets       → create, list, get, reply, updateStatus
├── notFoundHandler (404)
└── errorHandler (AppError → JSON response)

Module Pattern: Each module = routes.ts + controller.ts + optional validation.ts
- Controllers import query() or executeProc() from config/database.ts
- No service layer — controllers contain raw SQL inline

### Authentication Flow

1. POST /api/auth/login { email, password }
   → bcrypt.compareSync(password, user.password)
   → JWT sign { userId, email, role } with accessSecret (15min) + refreshSecret (7d)
   → Response: { accessToken, refreshToken, user }

2. Frontend stores both tokens in localStorage

3. All API calls: Authorization: Bearer <accessToken>

4. On 401 from backend:
   → Frontend interceptor POST /api/auth/refresh { refreshToken }
   → Backend verifies refreshSecret, issues new pair
   → On failure → redirect to /login

5. GET /api/auth/me → returns current user from JWT payload

### Database Layer

Controller → query(sql, params) / executeProc(name, params)
         → mssql ConnectionPool (singleton in config/database.ts)
         → SQL Server

- Single ConnectionPool — max 10, idle timeout 30s
- All SQL uses parameterized queries (@param) — except restoreBackup which is vulnerable
- Stored procedures called via executeProc() — but the 8 procs don't exist yet (schema drops them without recreating)

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public (rate limited: 10/15min) | Register new member |
| POST | /api/auth/login | Public (rate limited: 10/15min) | Login, get JWT pair |
| POST | /api/auth/logout | Auth required | Client-side only (no server revocation) |
| POST | /api/auth/refresh | Public (NO rate limit) | Refresh JWT pair |
| GET | /api/auth/me | Auth required | Get current user profile |

### Analytics (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/dashboard | DAU, MAU, daily revenue, active members, churn |
| GET | /api/analytics/revenue | Daily revenue trend |
| GET | /api/analytics/retention | Retention cohorts |
| GET | /api/analytics/conversion | Visitor → member funnel |
| GET | /api/analytics/user-growth | Daily user registrations |
| GET | /api/analytics/export?format=csv | Export report as CSV or JSON |

### Audit (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/audit?page=1&limit=50 | Paginated audit logs (filterable) |
| GET | /api/audit/actions | List distinct actions |

### Backup (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/backup | Create manual backup |
| GET | /api/backup | List all backups |
| POST | /api/backup/:id/restore | Restore from backup — SQL injection risk |

### Coaches (Coach only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/coaches/dashboard | Coach-specific stats |
| GET | /api/coaches/member-growth | Member growth for coach's assigned members |
| GET | /api/coaches/statement | Monthly referral commission statement |

### Coupons

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/coupons | Admin/Coach | List all coupons |
| POST | /api/coupons | Admin | Create coupon |
| POST | /api/coupons/validate | Any auth | Validate coupon code against a plan |
| GET | /api/coupons/stats | Admin | Coupon usage statistics |

### CRM (Admin + Coach)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/crm?search=&tag=&page=1&limit=20 | List customers (paginated) |
| GET | /api/crm/:id | Get customer with notes, tasks, purchases |
| POST | /api/crm/:id/notes | Add note to customer |
| POST | /api/crm/:id/tasks | Create task for customer |

### Invoices

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/invoices | All (members see own) | List invoices |
| GET | /api/invoices/:id | All (members see own) | Get invoice details |
| POST | /api/invoices | Any | Generate invoice from payment |
| POST | /api/invoices/:id/send-email | Any | No-op (just sets flag) |

### Loyalty

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/loyalty/points | Any | Get user points balance |
| GET | /api/loyalty/history | Any | Points transaction history |
| GET | /api/loyalty/rewards | Any | Active rewards catalog |
| POST | /api/loyalty/redeem | Any | Redeem reward for points |
| POST | /api/loyalty/daily-login | Any | Claim daily login bonus (+10 pts) |

### Referral

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/referral/my-code | Any | Get user referral code(s) |
| POST | /api/referral/create | Any | Generate new referral code |
| GET | /api/referral/list | Any | List user referrals with names |
| GET | /api/referral/commission | Any | Total commission earned |
| GET | /api/referral/all | Admin | All referral codes (admin view) |

### Revenue (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/revenue/dashboard | Total/monthly/daily revenue, churn, new customers |
| GET | /api/revenue/trend | Daily revenue trend |
| GET | /api/revenue/membership-sales | Sales by plan |
| GET | /api/revenue/conversion-funnel | Registration → membership → paid |

### Tickets

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/tickets?status= | All (members see own) | List tickets |
| GET | /api/tickets/:id | All (members see own) | Get ticket with messages |
| POST | /api/tickets | Any | Create ticket with initial message |
| POST | /api/tickets/:id/reply | All (members see own) | Reply to ticket |
| PUT | /api/tickets/:id/status | Any | Update ticket status |

---

## Database Schema

### Tables (34)

| Table | Purpose |
|-------|---------|
| Users | User accounts (email, password hash, role, referral_code) |
| Plans | Membership plan definitions (name, price, billing_period) |
| Memberships | Active member subscriptions (user_id, plan_id, status) |
| Payments | Payment records (user_id, plan_id, amount, status) |
| Invoices | Generated invoices (invoice_number, amount, tax, discount) |
| InvoiceItems | Individual line items on invoices |
| Notifications | In-app notification records |
| ReferralCodes | User-generated referral codes |
| ReferralClicks | Referral link click tracking |
| ReferralRewards | Referral reward definitions |
| ReferralTransactions | Referral commission records |
| Affiliates | Affiliate program participants |
| AffiliatePayouts | Affiliate commission payouts |
| Coupons | Discount code definitions (type, value, limits) |
| CouponUsages | Coupon redemption records |
| Promotions | Marketing promotion records |
| Points | User loyalty points balance |
| PointTransactions | Points earn/spend history |
| RewardsCatalog | Available rewards for point redemption |
| RewardRedemptions | Records of reward redemptions |
| Workouts | Video/workout library items |
| WorkoutExercises | Exercises within workouts |
| WorkoutSessions | User workout tracking records |
| NutritionPlans | Meal plan definitions |
| NutritionEntries | Daily food logging |
| Tickets | Support ticket headers |
| TicketMessages | Messages within tickets |
| TicketAttachments | File attachments on tickets |
| CRMCustomers | Extended customer records (tags, LTV, risk, coach) |
| CRMNotes | Notes on CRM customers |
| CRMTasks | Tasks assigned to CRM customers |
| AuditLogs | System activity audit trail |
| BackupLogs | Backup creation history |
| AnalyticsDaily | Daily aggregated analytics |
| AnalyticsRetention | Cohort retention data |

### Key Relationships

Users ---< Memberships >--- Plans
Users ---< Payments >--- Plans
Users ---< Tickets ---< TicketMessages
Users ---< PointTransactions
Users ---< ReferralTransactions (referrer_id, referred_id)
Users ---< CRMCustomers (via CRMCustomers.user_id)
CRMCustomers ---< CRMNotes
CRMCustomers ---< CRMTasks
Workouts ---< WorkoutExercises
Workouts ---< WorkoutSessions

### Indexes

- IX_Users_Email on Users.email
- IX_Users_Role on Users.role

---

## Frontend Component Library

### UI Components (components/ui/)

| Component | Props | Purpose |
|-----------|-------|---------|
| button.tsx | variant, size, icon, loading, disabled | CVA-based button |
| input.tsx | label, icon, type, value, onChange | Input with optional label + icon |
| badge.tsx | variant (green/red/yellow/blue/purple) | Status badge |
| card.tsx | — | Styled card container |
| dialog.tsx | open, onClose, title, children | Modal dialog |
| modal.tsx | open, onClose, title | Another modal variant |
| skeleton.tsx | className | Loading skeleton |
| stat-card.tsx | title, value, icon, trend, subtitle | Dashboard stat card (LucideIcon) |
| data-table.tsx | columns, data, emptyMessage | Generic data table |
| error-state.tsx | message, onRetry | Error display with retry |
| empty-state.tsx | title, description, action, icon | Empty state display |
| loading-spinner.tsx | text | Loading indicator |
| command-menu.tsx | — | Cmd+K command palette (cmdk) |

### Shared Components (components/shared/)

| Component | Purpose |
|-----------|---------|
| StatCard.tsx | Alternate StatCard (ReactNode icon) — different API from ui/stat-card.tsx |
| DataTable.tsx | Alternate data table — different from ui/data-table.tsx |
| page-header.tsx | Page title + subtitle header |
| page-transition.tsx | Framer Motion page transition wrapper |

### Layout Components (components/layout/)

| Component | Purpose |
|-----------|---------|
| Layout.tsx | Main layout with Sidebar + Header + Outlet |
| Sidebar.tsx | Navigation sidebar with admin section, user info, logout |
| CommandMenu.tsx | Ctrl+K global search command palette |

---

## Hooks

### useApi<T>(url: string, deps?: any[])

Returns { data: T | null, loading: boolean, error: string | null, refetch: () => void }

- Calls GET /api{url} on mount
- Defaults to deps: [] — URL changes may not trigger refetch when caller passes nothing
- Only supports GET — mutations use api directly
- No loading/error state management for mutations

---

## Middleware Pipeline

Request
  → Rate Limiter (100 req / 15 min per IP, or 10/15 min for auth endpoints)
  → Helmet (security headers)
  → CORS (configurable origin)
  → Compression
  → Body parser (JSON, 10MB limit)
  → authenticate() (JWT → req.user) — on protected routes
  → authorize(roles) (check req.user.role) — on role-restricted routes
  → validate(Zod schema) — on validated routes
  → Controller
  → Response (JSON via sendSuccess/sendError)
  → auditLog() — monkey-patches res.json to log after successful mutations

---

## Security Notes

| Area | Status | Detail |
|------|--------|--------|
| SQL Injection | 1 vuln | restoreBackup concatenates filepath into SQL |
| Password Hashing | OK | bcryptjs with salt rounds 12 |
| JWT | OK | Access (15min) + Refresh (7d) pair |
| Token Storage | WARN | localStorage — accessible to XSS |
| RBAC | OK | member/coach/admin with middleware |
| Rate Limiting | OK | 100/15min general, 10/15min auth |
| CSP | WARN | Helmet default only — no custom CSP |
| CORS | WARN | Hardcoded to localhost:5173 — no prod override |
| Input Validation | OK | Zod schemas on validated routes |
| SQL Params | OK | Parameterized queries (except restoreBackup) |
| Refresh Revocation | FAIL | No server-side invalidation |
| HTTPS | FAIL | Nginx serves HTTP only |

---

## Development Guide

### Starting Services

Backend:   cd backend && npm install && npm run dev     # http://localhost:5000
Frontend:  cd frontend && npm install && npm run dev   # http://localhost:5173

### Environment Setup

  cd backend
  cp .env.example .env
  Edit .env with your SQL Server credentials

Default .env uses Windows Auth (DB_TRUSTED_CONNECTION=true). For SQL Auth:
  DB_TRUSTED_CONNECTION=false
  DB_USER=sa
  DB_PASSWORD=YourPassword
  DB_TRUST_SERVER_CERTIFICATE=true

### Database Reset

  sqlcmd -S localhost -E -i database/full_schema.sql
  OR: Open in SSMS → F5

Drops and recreates entire gymer database. No migration support.

### Build

  cd backend && npm run build    # tsc → dist/
  cd frontend && npm run build   # vite build → dist/

### Available npm Scripts (Backend)

| Script | Command | Purpose |
|--------|---------|---------|
| dev | tsx watch src/server.ts | Development server with hot reload |
| build | tsc | TypeScript compilation |
| start | node dist/server.js | Production server |
| lint | eslint src --ext .ts | Lint |
| test | jest --coverage | Tests (no tests exist yet) |
| migrate | ts-node src/database/migrate.ts | Migrations (file does not exist) |
| seed | ts-node src/database/seed.ts | Seed data (file does not exist) |

---

## Common Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| ECONNREFUSED localhost:5000 | Backend not running | cd backend && npm run dev |
| 401 Unauthorized | Token expired or invalid | Re-login to get new token |
| DB unavailable | Wrong SQL credentials | Check backend/.env DB config |
| Cannot connect to SQL Server | SQL Server not running | Start via SQL Server Configuration Manager |
| executeProc failed: Procedure not found | Stored procedures do not exist | Add CREATE PROCEDURE or refactor to inline SQL |
| CORS error in browser | Frontend origin not in CORS_ORIGIN | Update CORS_ORIGIN in .env |
| Port 5000 in use | Another process using port | Change PORT in .env or kill process |
| Port 5173 in use | Another Vite instance running | Change port in frontend/vite.config.ts |
| Blank page after login | Token in localStorage but invalid | Clear localStorage and re-login |
| restoreBackup error | SQL injection in backup restore | Parameterize filepath in backup.controller.ts |

---

## Known Code Smells

1. Two StatCard components — components/shared/StatCard.tsx (ReactNode icon) vs components/ui/stat-card.tsx (LucideIcon icon)
2. Two DataTable components — components/shared/DataTable.tsx vs components/ui/data-table.tsx
3. Controllers contain raw SQL — no service/repository layer
4. audit.ts monkey-patches res.json — fragile response interception
5. useApi only does GET — no POST/PUT/DELETE support
6. Empty scaffolded directories — modules/affiliate/, modules/notifications/, modules/users/, jobs/, templates/
7. npm run migrate and npm run seed scripts reference non-existent files
8. Hardcoded demo credentials in README and seed data
9. isAuthenticated checks localStorage but never verifies token validity
10. Dashboard Recent Activity is hardcoded [1,2,3,4].map(...) with static strings
