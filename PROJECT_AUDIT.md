# Project Audit — Complete Feature Gap Analysis

Date: 2026-06-24
Audit Type: Full codebase deep-dive — backend, frontend, database, infrastructure

---

## Executive Summary

| Metric | Status |
|--------|--------|
| Backend TypeScript Build | ✅ PASS |
| Frontend Vite Build | ✅ PASS (+ PWA) |
| Database Tables | 34 tables (0 stored procs — docs incorrectly claim 8) |
| API Modules w/ Controllers | 12/16 (75%) |
| Frontend Pages | 17 implemented + 4 with frontend-only |
| Automated Tests | ❌ Zero test files in source |
| Auth (JWT) | ✅ Implemented |
| RBAC | ✅ (member/coach/admin) |
| CI/CD | ❌ None |
| API Documentation | ❌ None |
| Docker | ✅ docker-compose, nginx |

---

## Severity Definitions

- **Critical** — Blocks production, security risk, data loss
- **High** — Major feature broken, significant UX/performance issue
- **Medium** — Missing feature, maintainability concern
- **Low** — Polish, SEO, minor improvements

---

## Feature Classification Matrix

### 1. Fully Implemented (Backend API + Frontend Page + DB)

| Feature | Backend | Frontend | DB Tables | Notes |
|---------|---------|----------|-----------|-------|
| Auth (login/register/refresh) | ✅ | ✅ | Users | bcrypt + JWT pair |
| CRM (customers, notes, tasks) | ✅ | ✅ | CRMCustomers, CRMNotes, CRMTasks | Pagination supported |
| Coupons (CRUD + validate) | ✅ | ✅ | Coupons, CouponUsages | Full validation logic |
| Invoices (list/get/generate) | ✅ | ✅ | Invoices, InvoiceItems | `sendEmail` is a no-op |
| Tickets (CRUD + messages) | ✅ | ✅ | Tickets, TicketMessages, TicketAttachments | Role-based visibility |
| Loyalty (points, rewards, redeem) | ✅ | ✅ | Points, PointTransactions, RewardsCatalog, RewardRedemptions | Daily login bonus |
| Referral (codes, commissions) | ✅ | ✅ | ReferralCodes, ReferralTransactions, ReferralClicks, ReferralRewards | Code generation + tracking |
| Analytics Dashboard | ✅ | ✅ | AnalyticsDaily, AnalyticsRetention | DAU/MAU/revenue/churn |
| Revenue Dashboard | ✅ | ✅ | (uses Payments) | Trend, sales, funnel |
| Audit Logs | ✅ | ✅ | AuditLogs | Filtered + paginated |
| Backup (create/list/restore) | ✅ | ✅ | BackupLogs | ⚠️ SQL injection in restore |

### 2. Frontend-Only (UI exists, no backend API)

| Feature | Frontend | DB Tables | Missing |
|---------|----------|-----------|---------|
| Video Library | ✅ | Workouts, WorkoutExercises, WorkoutSessions | No `/api/videos` route or controller |
| Coach Booking | ✅ | None for bookings | No schedule/booking tables or controller |
| Membership Plans | ✅ | Plans, Memberships | No `/api/plans` route or controller |

### 3. Backend Modules — Empty Scaffolds (0 files)

| Module | Purpose |
|--------|---------|
| `modules/affiliate` | Affiliate program management |
| `modules/notifications` | In-app notifications |
| `modules/users` | User management (CRUD for admin) |
| `jobs/` | Scheduled tasks (cron) |
| `templates/` | Email/notification templates |

### 4. DB Tables with No API

| Table | Purpose |
|-------|---------|
| Workouts, WorkoutExercises, WorkoutSessions | Video/workout library |
| NutritionPlans, NutritionEntries | Meal planning |
| Affiliates, AffiliatePayouts | Affiliate program |
| Promotions | Marketing |
| Notifications | In-app messaging |

---

## Issues Found

### Critical

| # | Issue | Location | Risk | Fix |
|---|-------|----------|------|-----|
| C1 | SQL injection in `restoreBackup` — filepath from DB concatenated into SQL without parameterization | `backup.controller.ts:42` | Attacker who modifies BackupLogs executes arbitrary SQL | Parameterize: `query("... DISK=N@fp", { fp })` |
| C2 | Zero automated tests in entire codebase | Both | No regression detection | Add Vitest (FE) + Jest (BE) |
| C3 | `sendEmail` is a no-op — sets flag without sending | `invoice.controller.ts:39` | User believes email sent when it wasn't | Implement nodemailer or remove endpoint |
| C4 | Refresh tokens never invalidated — no blacklist, no version, no rotation | Auth module | Stolen refresh token = permanent access | Add token version column to Users |

### High

| # | Issue | Location | Risk | Fix |
|---|-------|----------|------|-----|
| H1 | CORS origin hardcoded to localhost — no production override | `docker-compose.yml` | Production CORS rejects real domain | Use env-based CORS config |
| H2 | SA password in plaintext in docker-compose | `docker-compose.yml:17` | DB admin password visible to anyone | Use Docker secrets |
| H3 | CoachDashboard has no route guard — `/coach` unprotected | `App.tsx:55` | Any member accesses coach area | Add `CoachRoute` or `authorize` |
| H4 | Two StatCard components with different interfaces | `components/shared/StatCard.tsx` vs `components/ui/stat-card.tsx` | Props mismatch, `subtitle` only on one | Consolidate to single component |
| H5 | `useApi` defaults to empty deps array | `useApi.ts:5` | Stale data when URL changes | Default to `[url]` |
| H6 | SettingsPage password change is client-side placeholder | `SettingsPage.tsx:14-18` | User believes password changed — it didn't | Wire to auth API |
| H7 | `/refresh` endpoint has no rate limiting | `auth.routes.ts` | Brute-force refresh token guessing | Add rate limiter |
| H8 | Dashboard "Recent Activity" is hardcoded mock data | `DashboardPage.tsx:56-71` | No real activity shown | Build API or remove |

### Medium

| # | Issue | Location | Risk | Fix |
|---|-------|----------|------|-----|
| M1 | 0 stored procedures exist — schema drops 8 but never creates them | `full_schema.sql` | `executeProc` calls will fail at runtime | Add CREATE PROCEDURE blocks |
| M2 | Coach route blocks admin — `authorize(UserRole.COACH)` | `coach.routes.ts` | Admin can't view coach dashboards | Add `UserRole.ADMIN` to allowed roles |
| M3 | No DB migration system — full schema drop/recreate | `database/` | Can't evolve production schema | Add migration framework |
| M4 | `useApi` only supports GET | `useApi.ts` | No loading/error for mutations | Extend with method param |
| M5 | Duplicate DataTable components | `components/shared/DataTable.tsx` vs `components/ui/data-table.tsx` | Code duplication | Consolidate |
| M6 | No graceful shutdown handler | `server.ts` | DB connection leaks on restart | Add `SIGTERM` handler |
| M7 | Tokens in localStorage | `authStore.ts` | XSS → token theft | Consider httpOnly cookies |
| M8 | No CSP headers | `app.ts:20` | Weak XSS mitigation | Configure Helmet CSP |
| M9 | `isAuthenticated` never validates token on init | `authStore.ts:9` | Shows logged-in UI with expired token | Check token expiry |
| M10 | `multer` installed but no upload routes | `config.ts`, `package.json` | File uploads impossible | Implement upload endpoint |
| M11 | No SSL/HTTPS in nginx config | `nginx.conf` | Unencrypted traffic | Add SSL cert |

### Low

| # | Issue | Location | Risk | Fix |
|---|-------|----------|------|-----|
| L1 | No `robots.txt` | `frontend/public/` | Poor crawler behavior | Add robots.txt |
| L2 | Missing meta tags (description, OG) | `index.html` | Bad social sharing | Add meta tags |
| L3 | Dashboard redirect flashes before navigating | `DashboardPage.tsx:10-11` | UX flicker | Use route-level guard |
| L4 | Demo credentials in README/docs | docs | Deployment with default creds | Add warnings |
| L5 | No Docker healthcheck on backend | `docker-compose.yml` | No auto-restart on failure | Add HEALTHCHECK |
| L6 | No Inter font loaded | Tailwind config | Inconsistent typography | Load Inter |

---

## Architecture Fragility

| Issue | Detail |
|-------|--------|
| Controllers contain raw SQL | No service/repository layer — hard to test |
| No transaction management | Multi-step DB operations can partial-write |
| `audit.ts` monkey-patches `res.json` | Can break other middleware |
| No typed API client | Frontend uses `any` casts — contract drift undetected |

---

## Debt Summary

| Category | Count |
|----------|-------|
| Critical | 4 |
| High | 8 |
| Medium | 11 |
| Low | 6 |
| **Total** | **29** |

---

## Recommended Next Actions

1. **C3** — Remove fake `sendEmail` or implement actual SMTP
2. **C1** — Fix SQL injection in backup restore
3. **C4** — Implement refresh token invalidation
4. **H6** — Wire SettingsPage password change to API
5. **H1/H2** — Fix production CORS + docker secrets
6. **M1** — Add missing stored procedures or inline SQL
7. **H7** — Add rate limiting to `/refresh`
8. **C2** — Set up test infrastructure
9. **H4/H5** — Consolidate duplicate components
10. **H3** — Fix coach route guard
11. Build missing APIs: Profile, Membership Plans, Coach Booking
12. **M10** — Implement file upload
