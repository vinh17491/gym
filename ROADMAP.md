# Roadmap — Gymer Development Plan

Last updated: 2026-06-24

---

## ✅ Completed (Phase 1 — MVP)

- [x] Backend scaffold (Express + TypeScript + mssql)
- [x] JWT Authentication (login, register, access + refresh tokens)
- [x] RBAC middleware (member/coach/admin)
- [x] 12 feature modules with controllers + routes
- [x] Frontend scaffold (React + Vite + TailwindCSS dark theme)
- [x] Layout system (Sidebar, Header, CommandMenu, mobile drawer)
- [x] 17 admin/feature pages with dark theme
- [x] Zustand state management (authStore)
- [x] Axios interceptors (JWT auto-refresh on 401)
- [x] React Router v6 (lazy routes, protected routes)
- [x] Recharts for analytics/revenue charts
- [x] PWA support (manifest + service worker)
- [x] Database schema: 34 tables + seed data (0 stored procs — see note)
- [x] Docker + Nginx reverse proxy
- [x] Health check endpoint (`/api/health`)
- [x] Rate limiting, Helmet, CORS, compression
- [x] Audit logging middleware
- [x] Zod validation on inputs
- [x] CLI setup scripts (`setup.bat`, `setup.sh`, `setup-docker.sh`)

> ⚠️ **Note:** The schema drops 8 stored procedures (`sp_GetDAU`, `sp_GetRevenueByPeriod`, etc.) but never creates them. Analytics endpoints that call `executeProc()` will fail at runtime.

---

## 🔨 Phase 2 — Critical Fixes (Week 1–2)

**Goal:** Fix security vulnerabilities and broken features before anything else.

- [ ] **C1** — Fix SQL injection in `restoreBackup` — parameterize filepath
- [ ] **C3** — Remove `sendEmail` no-op or implement actual SMTP via nodemailer
- [ ] **C4** — Implement refresh token invalidation (add `token_version` column to Users, increment on refresh, verify on use)
- [ ] **H7** — Add rate limiting to `/api/auth/refresh`
- [ ] **H1** — Production CORS via environment variable (not hardcoded `localhost:5173`)
- [ ] **H2** — Move SA password from plaintext docker-compose to Docker secrets or `.env`
- [ ] **M1** — Add the 8 missing stored procedures OR refactor analytics calls to use inline SQL
- [ ] **H6** — Wire SettingsPage password change to `PUT /api/auth/password`
- [ ] **H3** — Fix coach route guard (add `UserRole.ADMIN` to `authorize()`, wrap `/coach` with `CoachRoute`)
- [ ] **H8** — Replace Dashboard hardcoded activity with real API or remove section

---

## 🏗 Phase 3 — Backend Hardening (Week 2–3)

**Goal:** Production-ready architecture.

- [ ] Extract service layer from controllers (repository pattern for testability)
- [ ] Add error tracking middleware (Winston structured logging → file)
- [ ] Add `SIGTERM` / `SIGINT` graceful shutdown handler (close pool, drain server)
- [ ] Validate token expiry on app init (`isAuthenticated` should verify token, not just check localStorage)
- [ ] Add CSP headers to Helmet config
- [ ] Remove duplicate DataTable component (`shared/DataTable.tsx` vs `ui/data-table.tsx`)
- [ ] Consolidate StatCard into single component
- [ ] Add `CoachRoute` component for frontend route guard
- [ ] Add `migrate` script to `package.json` (currently references non-existent `src/database/migrate.ts`)

---

## 🧪 Phase 4 — Testing Infrastructure (Week 3–4)

**Goal:** Zero → 50% test coverage on critical paths.

- [ ] Set up Vitest (frontend) + Jest (backend) with basic config
- [ ] Add integration tests for auth flow (register → login → refresh → me)
- [ ] Add unit tests for Zod validation schemas
- [ ] Add integration tests for each CRUD controller
- [ ] Add API contract test (validate response shapes match frontend expectations)
- [ ] Add E2E smoke test with Playwright (login → navigate → check data loads)
- [ ] Add CI script (GitHub Actions: build → test → Docker build)

---

## 🎨 Phase 5 — Frontend Polish (Week 4–5)

**Goal:** Remove prototype feel.

- [ ] Add Inter font (self-host via `@fontsource/inter` or CDN)
- [ ] Add skeleton loading states to all pages that show data
- [ ] Add error/empty states to all list pages (currently inconsistent)
- [ ] Add page transitions (Framer Motion — already a dependency)
- [ ] Add search/filter to Invoices, Tickets, Audit tables
- [ ] Add responsive breakpoints for mobile sidebar (hamburger menu)
- [ ] Add `aria-label` to all interactive elements
- [ ] Add `robots.txt` + meta tags
- [ ] Fix `DashboardPage` to redirect to `/admin` via route-level guard (not `<Navigate>`)

---

## 🚀 Phase 6 — New Backend APIs (Week 5–7)

**Goal:** Complete feature parity with frontend — connect all UI to real data.

### Priority 1 — Core Business

- [ ] **User Profile** — `PUT /api/auth/me` (update name, phone, avatar), `POST /api/auth/password` (change password)
  - DB: Users table (already has avatar_url)
  - Frontend: `UserProfile.tsx` exists, wire save to API

- [ ] **Membership Plans** — `GET /api/plans`, `POST /api/plans`, `POST /api/memberships/subscribe`, `POST /api/memberships/cancel`
  - DB: Plans table exists, Memberships table exists
  - Frontend: `MembershipPlans.tsx` exists (no API call)
  - Critical: This is the revenue driver

- [ ] **File Upload** — `POST /api/upload` (avatars, documents)
  - Config: `config.upload.dir` and `config.upload.maxFileSize` already configured
  - `multer` already installed
  - Add static file serving for uploaded files

### Priority 2 — Service Differentiators

- [ ] **Coach Booking** — `GET /api/coaches/:id/availability`, `POST /api/bookings`, `GET /api/bookings`
  - DB: Add `Bookings` table (id, coach_id, member_id, date, time_slot, status)
  - Frontend: `CoachBooking.tsx` exists (hardcoded data)
  - Add to coach routes

- [ ] **Video Library** — `GET /api/videos`, `POST /api/videos`, `POST /api/videos/:id/watch`
  - DB: Workouts, WorkoutExercises tables exist (add `thumbnail_url` if missing)
  - Frontend: `VideoLibrary.tsx` exists (hardcoded data)
  - Wire search/category filters to API

### Priority 3 — Engagement

- [ ] **Notifications** — `GET /api/notifications`, `POST /api/notifications/:id/read`, `GET /api/notifications/unread-count`
  - DB: Notifications table exists
  - No frontend or backend code exists yet
  - Add notification bell icon to header

---

## 🌐 Phase 7 — DevOps & Production (Week 7–8)

**Goal:** Ship with confidence.

- [ ] GitHub Actions CI/CD: build → test → Docker → deploy
- [ ] Add nginx SSL configuration (Let's Encrypt or custom cert)
- [ ] Add Docker healthcheck for backend service
- [ ] Add database migration system (not full-schema drop/recreate)
- [ ] Add Sentry error tracking (frontend + backend)
- [ ] Add Redis for session caching and rate limiting (replace in-memory rate limiter)
- [ ] Environment-based config (`NODE_ENV=production`)
- [ ] Load testing with k6 (target: p95 < 200ms for all list endpoints)
- [ ] Security audit (OWASP Top 10 checklist)

---

## 🌟 Phase 8 — Advanced Features (Month 3+)

- [ ] Payment gateway integration (Stripe / VietQR)
- [ ] SMS notifications (Twilio)
- [ ] Multi-language support (i18n)
- [ ] Role-based dashboard customization
- [ ] Advanced analytics (churn prediction, cohort analysis)
- [ ] White-label support (gym branding)
- [ ] Mobile app (React Native or PWA enhancements)
- [ ] Nutrition tracking (NutritionPlans/NutritionEntries tables exist, no API)
- [ ] Affiliate program (Affiliates/AffiliatePayouts tables exist, no API)

---

## Scalability Plan

### Short-term (1–3 months)
- Add indexes for frequently queried columns
- Configure connection pool for production load
- Add query result caching for analytics endpoints

### Mid-term (3–6 months)
- Add read replicas for SQL Server
- Implement event-driven architecture (message queue for notifications)
- Add Redis for caching layer

### Long-term (6+ months)
- Migrate to Kubernetes if horizontal scaling needed
- Add CDN for static assets
- Add data warehouse for analytics

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Test Coverage | 0% | 80% critical paths |
| API Response Time (p95) | Unknown | <200ms |
| Security (OWASP) | Unaudited | 95%+ pass rate |
| Lighthouse Score | Unknown | 95+ |
| Build Time | Unknown | <30s FE, <10s BE |
| Production Uptime | N/A | 99.9% |
| Feature Parity | 75% | 100% (all UI → API) |
