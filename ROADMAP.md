# Roadmap — Gymer Development Plan

---

## ✅ Completed (Phase 1 — MVP)

- [x] Backend scaffold (Express + TypeScript + mssql)
- [x] JWT Authentication (login, register, access + refresh tokens)
- [x] 11 feature modules (auth, analytics, audit, backup, coaches, coupons, CRM, invoices, loyalty, referral, revenue, tickets)
- [x] Frontend scaffold (React + Vite + TailwindCSS dark theme)
- [x] Layout system (Sidebar, Header, CommandMenu, mobile drawer)
- [x] All 13 admin/feature pages with dark theme
- [x] Zustand state management
- [x] Axios interceptors (JWT auto-refresh)
- [x] React Router v6 (lazy routes, protected routes)
- [x] Recharts for analytics/revenue charts
- [x] PWA support (manifest + service worker)
- [x] Database schema: 34 tables + 8 stored procedures + seed data
- [x] Docker + Nginx reverse proxy
- [x] Health check endpoint
- [x] Rate limiting, Helmet, CORS, compression
- [x] Audit logging middleware
- [x] Zod validation on inputs
- [x] CLI commands: `setup.bat`, `setup.sh`, `setup-docker.sh`

---

## 🔨 Phase 2 — Critical Fixes (Week 1-2)

Priority: Fix broken things before building new.

- [ ] Fix `StatCard` dynamic Tailwind classes → JIT-safe variant classes
- [ ] Fix Dashboard hardcoded `weeklyWorkouts: 0` → real API data
- [ ] Add React error boundaries to all pages
- [ ] Add skeleton loading to all pages
- [ ] Add error/empty states to all list pages
- [ ] Fix coach route 404 for admin role
- [ ] Surface `useApi` errors to user (toast + retry)
- [ ] Fix password change API in SettingsPage

---

## 🏗 Phase 3 — Backend Hardening (Week 2-3)

Priority: Production-ready architecture.

- [ ] Extract service layer from controllers (repository pattern)
- [ ] Add pagination to all list endpoints (page, limit, total)
- [ ] Add OpenAPI/Swagger documentation
- [ ] Add Vitest unit tests for all controllers (target: 80%)
- [ ] Add request/response logging (structured)
- [ ] Configure DB connection pool for production
- [ ] Add health check with DB status
- [ ] Add graceful shutdown handler
- [ ] Move JWT secrets to env-only (remove from `.env.example` defaults)

---

## 🎨 Phase 4 — Frontend Polish (Week 3-4)

Priority: UX that doesn't look like a prototype.

- [ ] Load Inter font (self-host or CDN)
- [ ] Update color palette to green primary (`#22C55E`)
- [ ] Add skeleton loading for all async data
- [ ] Add page transitions (Framer Motion)
- [ ] Add search/filter to all DataTables
- [ ] Add responsive breakpoints for mobile
- [ ] Add aria-labels and focus indicators
- [ ] Add 404 page
- [ ] Add robots.txt + meta tags
- [ ] Add password strength indicator on register

---

## 🚀 Phase 5 — New Backend APIs (Week 4-6)

Priority: Complete feature parity with frontend.

- [ ] **Video Library** — CRUD videos, categories, play tracking
- [ ] **Coach Booking** — Coach schedule, member booking, availability slots
- [ ] **Membership Plans** — Plan CRUD, subscribe, cancel, upgrade
- [ ] **User Profile** — Edit profile, avatar upload, history
- [ ] **Notifications** — In-app notification system
- [ ] **File Upload** — S3/local storage for avatars, documents

---

## 🌐 Phase 6 — DevOps & Production (Week 6-8)

Priority: Ship with confidence.

- [ ] GitHub Actions CI/CD (build, test, docker, deploy)
- [ ] Husky + lint-staged + Prettier pre-commit hooks
- [ ] Docker production optimization (multi-stage builds)
- [ ] Nginx production config (SSL, caching, headers)
- [ ] Add Sentry error tracking (frontend + backend)
- [ ] Add Redis for session caching and rate limiting
- [ ] Environment-based config (dev/staging/prod)
- [ ] Database migration system (not full-schema reset)
- [ ] Load testing (k6 or Artillery)
- [ ] Security audit (OWASP checklist)

---

## 🌟 Phase 7 — Advanced Features (Month 3+)

Priority: Differentiation.

- [ ] Mobile app (React Native or PWA enhancements)
- [ ] Payment gateway integration (Stripe, VietQR)
- [ ] SMS notifications (Twilio)
- [ ] Multi-language support (i18n)
- [ ] Role-based dashboard customization
- [ ] Advanced analytics (ML-based churn prediction)
- [ ] White-label support (gym branding)

---

## 📊 Scalability Plan

### Short-term (1-3 months)
- Optimize DB queries (add indexes for frequently queried columns)
- Add connection pooling tuning
- Add Redis caching for analytics queries

### Mid-term (3-6 months)
- Split frontend into micro-frontends if team grows
- Add read replicas for SQL Server
- Implement event-driven architecture (message queue)

### Long-term (6+ months)
- Migrate to Kubernetes if scaling horizontally
- Add CDN for static assets
- Add data warehouse for analytics

---

## Success Metrics

| Metric | Target |
|--------|--------|
| UI/UX Score | 70/100 → 90/100 |
| Test Coverage | 0% → 80% |
| Lighthouse Score | N/A → 95+ |
| Security Score | N/A → 95+ |
| API Response Time (p95) | <200ms |
| Build Time | <30s (FE), <10s (BE) |
