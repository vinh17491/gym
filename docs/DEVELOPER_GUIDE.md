# Developer Guide

Updated 2026-07-15. Use repository-relative paths.

## Start development

Configure names described in [Environment Setup](ENVIRONMENT_SETUP.md), then run `npm install` and `npm run dev` separately in `backend/` and `frontend/`. Check migrations from `backend/` with `npm run db:migrate:status`; apply only after backup/identity/checksum review with `npm run db:migrate`. See [Database and Migrations](DATABASE_AND_MIGRATIONS.md).

## Current route map

Public frontend routes: `/`, `/about`, `/contact`, `/blog`, `/membership`, `/coaches`, `/coaches/:id`, `/videos`, `/success-stories`, `/exercises`, `/exercises/:id`, `/workout-programs`, `/products`, `/products/:id`, `/cart`, `/login`, `/register`.

JWT-protected routes: `/dashboard`, `/members`, `/referral`, `/coupons`, `/loyalty`, `/tickets`, `/invoices`, `/crm`, `/settings`, `/booking`, `/profile`, `/orders`, `/orders/:orderId`, `/checkout`, `/video`, and `/coach`. Admin-wrapped routes: `/admin`, `/admin/analytics`, `/admin/audit`, `/admin/revenue`, `/admin/backup`, `/admin/products`, `/admin/orders`, `/admin/orders/:orderId`, `/admin/categories`, `/admin/brands`, `/admin/inventory`, `/admin/products/:productId/variants`.

Backend mounts: `/api/auth`, `referral`, `coupons`, `loyalty`, `audit`, `analytics`, `crm`, `tickets`, `invoices`, `backup`, `revenue`, `coaches`, `plans`, `videos`, `exercises`, `bookings`, `products`, `admin/products`, shared `/api/admin` catalog/variant/inventory/order routers, `/api/orders`, and `/api/media`. Exact commerce endpoints are in [API Overview](API_OVERVIEW.md).

## Module and security model

Current commerce modules (`products`, `admin-products`, `admin-catalog`, `admin-variants`, `admin-inventory`, `orders`, `admin-orders`, `mail`) use services and validation where needed. Legacy modules often use controllers directly. Reuse the pattern of the module being extended instead of introducing a global rewrite.

Login returns JWT state used by the Axios client and Zustand auth store. Protected/Admin frontend routes improve UX. Backend `authenticate`, `authorize`, and owner-filtered queries provide actual security. Never accept a customer identity from request body when it can be derived from the JWT.

Product stock is variant-specific and `available = on_hand - reserved`. Do not bypass service transactions, transition rules, history writes, expiration handling or ownership filters.

## Checks and migrations

Use targeted inspection/type checking while editing. Backend scripts are `dev`, `build`, `start`, `lint`, `db:migrate`, and `db:migrate:status`; frontend scripts are `dev`, `build`, and `preview`. Run builds at meaningful task gates, not after every file. For acceptance, restore to an isolated timestamped database, verify `DB_NAME()` before mutation, run authorization/IDOR/concurrency/browser cases, clean up, and verify `GYMFIT_DB` integrity.

New migrations use `NNNN_description.sql`, execute lexically, and are recorded with SHA-256 checksum. Never modify an applied migration. TASK-008 starts at `0006` only after the [Discovery Gate](TASK-008_DISCOVERY_CHECKLIST.md).

For debugging, check health/API response, configured database identity, central structured logs, validation errors, JWT/role state, and frontend network responses. Do not commit runtime logs or print environment secrets.

Update README/status/API/database/security/limitations/handoff documents with every completed task. Validate links, secrets and `git diff --check` before handoff.
