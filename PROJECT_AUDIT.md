# Project Audit — Current State Analysis

Date: 2026-06-24

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Backend TypeScript | ✅ Build PASS |
| Frontend Vite | ✅ Build PASS (+ PWA) |
| Database Schema | ✅ 34 tables, 8 stored procs, seed data |
| API Endpoints | ✅ All 13 modules functional |
| Authentication | ✅ JWT + bcrypt (admin: admin@gymer.com / admin123) |
| Total Source Files | ~94 |

---

## Severity Definitions

- **Critical** — Blocks production, security risk, or data loss
- **High** — Major feature broken, significant UX issue, performance at scale
- **Medium** — Missing feature, maintainability concern, dev friction
- **Low** — Polish, SEO, minor improvements

---

## Critical Issues

| # | Issue | Area | Impact | Effort | Fix |
|---|-------|------|--------|--------|-----|
| C1 | No service layer — controllers contain raw SQL | Backend | Maintenance burden, hard to test | 5 days | Extract SQL to service layer, use repository pattern |
| C2 | Controllers mutate `res.json` directly (audit middleware) | Backend | Fragile, breaks abstraction | 4 hours | Refactor audit to use response wrapper |
| C3 | No automated tests (unit/integration/e2e) | Both | No regression safety | 10 days | Add Vitest (FE), Jest (BE), Playwright (E2E) |

---

## High Issues

| # | Issue | Area | Impact | Effort | Fix |
|---|-------|------|--------|--------|-----|
| H1 | No frontend error tracking / boundaries | Frontend | Silent failures in production | 1 day | Add Sentry, React error boundaries, global error UI |
| H2 | No pagination on any list endpoint | Backend | Performance at scale | 2 days | Add `page`, `limit`, `total` to all GET lists |
| H3 | Hardcoded demo credentials in seed SQL | Backend | Security risk if deployed | 30 min | Use env vars or runtime generation |
| H4 | `StatCard` uses dynamic Tailwind classes (`bg-${color}-500/20`) | Frontend | JIT purge removes them — broken UI | 15 min | Use class variance or predefined classes |

---

## Medium Issues

| # | Issue | Area | Impact | Effort | Fix |
|---|-------|------|--------|--------|-----|
| M1 | No API documentation (OpenAPI/Swagger) | Both | Onboarding friction | 2 days | Add `@nestjs/swagger` or manual OpenAPI spec |
| M2 | No CI/CD pipeline | DevOps | Deployment risk | 1 day | GitHub Actions: build, test, docker, deploy |
| M3 | No pre-commit hooks (lint, format, type-check) | Both | Code quality drift | 4 hours | Add Husky + lint-staged + prettier |
| M4 | Coach route `/coach` returns 404 for admin | Backend | Admin can't access coach features | 2 hours | Fix role check or route guard |
| M5 | `useApi.ts` error state never surfaced to user | Frontend | Silent API failures | 2 hours | Add error toast + retry mechanism |
| M6 | Multiple pages duplicate code (`MembersPage` ≈ `CRMPage`) | Frontend | Maintenance burden | 2 hours | Extract shared table component |

---

## Low Issues

| # | Issue | Area | Impact | Effort | Fix |
|---|-------|------|--------|--------|-----|
| L1 | Missing `index.html` meta tags (description, OG) | Frontend | SEO | 15 min | Add meta tags |
| L2 | No `robots.txt` | Frontend | SEO | 15 min | Add `robots.txt` to `public/` |
| L3 | No 404 page | Frontend | Broken routes show blank | 30 min | Add `NotFoundPage` + catch-all route |
| L4 | Color palette indigo-based, not brand green | Frontend | Brand consistency | 30 min | Update Tailwind config to green primary |
| L5 | No Inter font loaded | Frontend | Typography quality | 15 min | Add `@import 'inter'` or self-host |

---

## Frontend UX Issues (from UI Audit)

| Priority | Fix | Effort |
|----------|-----|--------|
| P0 | Fix StatCard Tailwind classes | 15 min |
| P0 | Fix Dashboard hardcoded values | 30 min |
| P0 | Add error/empty/skeleton states to all pages | 2h |
| P0 | Add skeleton loading | 1h |
| P1 | Add Inter font | 15 min |
| P1 | Update color palette to green | 30 min |
| P1 | Add command menu (Ctrl+K) | 2h |
| P1 | Add page transitions | 1h |
| P2 | Add responsive breakpoints | 3h |
| P2 | Add aria labels | 1h |
| P2 | Create missing pages (video, booking, membership, profile) | 8h |
| P3 | Fix password change API | 30 min |
| P3 | Add search/filter to tables | 3h |

---

## Missing Frontend Pages (UI Only — Need Backend)

| Page | Route | Status |
|------|-------|--------|
| Video Library | `/video` | UI only, no API |
| Coach Booking | `/booking` | UI only, no API |
| Membership Plans | `/membership` | UI only, no API |
| User Profile | `/profile` | UI only, no API |

---

## Backend Feature Completeness

| Module | CRUD | Validation | Auth | Tests |
|--------|------|------------|------|-------|
| Auth | ✅ | ✅ | Public | ❌ |
| Analytics | ✅ (read) | ✅ | Admin | ❌ |
| Audit | ✅ (read) | ✅ | Admin | ❌ |
| Backup | ✅ | ✅ | Admin | ❌ |
| Coaches | ✅ | ✅ | Auth | ❌ |
| Coupons | ✅ | ✅ | Auth | ❌ |
| CRM | ✅ | ✅ | Auth | ❌ |
| Invoices | ✅ | ✅ | Auth | ❌ |
| Loyalty | ✅ | ✅ | Auth | ❌ |
| Referral | ✅ | ✅ | Auth | ❌ |
| Revenue | ✅ (read) | ✅ | Admin | ❌ |
| Tickets | ✅ | ✅ | Auth | ❌ |

---

## Security Concerns

| Issue | Severity | Fix |
|-------|----------|-----|
| Hardcoded JWT secrets in `.env.example` | Medium | Use strong random secrets in production |
| No rate-limit on auth endpoints | Medium | Add stricter rate limit on `/login`, `/register` |
| No CSP headers | Low | Configure Helmet CSP |
| No input sanitization on SQL (uses param queries) | Low | Already safe — params used everywhere |

---

## Performance Concerns

| Issue | Severity | Fix |
|-------|----------|-----|
| No DB connection pooling config tuning | Medium | Configure pool size per load |
| No query caching | Medium | Add Redis for frequent reads |
| No pagination | High | Add to all list endpoints |
| N+1 queries in analytics | Medium | Use stored procs (already implemented) |

---

## Debt Summary

| Category | Count |
|----------|-------|
| Critical | 3 |
| High | 4 |
| Medium | 6 |
| Low | 5 |
| **Total** | **18** |

---

## Recommended Next Actions (Priority Order)

1. **P0:** Fix StatCard Tailwind classes, Dashboard hardcoded values
2. **P0:** Add error/empty/skeleton states
3. **C3:** Add test infrastructure (Vitest + Playwright)
4. **C1:** Extract service layer from controllers
5. **H2:** Add pagination to all list endpoints
6. **M1:** Generate OpenAPI spec
7. **M2:** Add GitHub Actions CI/CD
8. **M3:** Add pre-commit hooks
9. **M4:** Fix coach route 404
10. Build missing backend APIs for Video, Booking, Membership, Profile pages