# Backend Modules Inventory — Gymer

> Express + MSSQL backend. Base URL: `/api`
> Auth: JWT Bearer token (`authenticate` middleware). Role-based access via `authorize(...roles)`.
> Roles: `member`, `coach`, `admin`

---

## Table of Contents

1. [Auth](#1-auth)
2. [Users / Profile](#2-users--profile)
3. [Referral](#3-referral)
4. [Coupons](#4-coupons)
5. [Loyalty / Points](#5-loyalty--points)
6. [Audit](#6-audit)
7. [Analytics](#7-analytics)
8. [Revenue](#8-revenue)
9. [CRM](#9-crm)
10. [Tickets](#10-tickets)
11. [Invoices](#11-invoices)
12. [Backup](#12-backup)
13. [Coaches](#13-coaches)
14. [Bookings](#14-bookings)
15. [Plans / Memberships](#15-plans--memberships)
16. [Videos / Workouts](#16-videos--workouts)
17. [Exercises](#17-exercises)
18. [Products](#18-products)
19. [Media](#19-media)
21. [Affiliate](#21-affiliate)
22. [Notifications](#22-notifications)

---

## 1. Auth

**Files:** `auth.controller.ts`, `auth.routes.ts`, `auth.validation.ts`, `me.controller.ts`
**Prefix:** `/api/auth`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/auth/register` | Rate-limited | Public | Register new user (default role: `member`). Creates referral code. Processes referral if code provided. Returns JWT tokens. |
| POST | `/auth/login` | Rate-limited | Public | Login with email/password. Updates `last_login_at`. Returns JWT tokens. |
| POST | `/auth/logout` | ✅ Bearer | Any | Stateless logout (client discards token). |
| POST | `/auth/refresh` | Public | Public | Exchange refresh token for new access+refresh tokens. |
| GET | `/auth/me` | ✅ Bearer | Any | Get current user profile (excludes password). |
| PUT | `/auth/me` | ✅ Bearer | Any | Update profile (name, phone). |
| POST | `/auth/password` | ✅ Bearer | Any | Change password (verifies current password). |
| POST | `/auth/avatar` | ✅ Bearer | Any | Upload avatar image (multipart, max 5MB, jpeg/png/webp). Stores to `uploads/avatars/`. |
| DELETE | `/auth/avatar` | ✅ Bearer | Any | Remove avatar. |

**Validation Schemas (Zod):**
- `registerSchema`: email (valid), password (8-128), name (2-100), phone (10-15, optional), referral_code (optional)
- `loginSchema`: email, password (min 1)
- `updateProfileSchema`: name (1-100), phone (max 20, optional)
- `changePasswordSchema`: current_password (min 1), new_password (6-100)

**Business Logic:**
- Password hashed with `bcryptjs` (salt rounds: 12)
- JWT: access token + refresh token with separate secrets and expirations
- Referral code generated from first 4 chars of name + random hex
- On registration with referral code → creates `ReferralTransactions` record
- Avatar stored on disk at `uploads/avatars/avatar-{timestamp}{ext}`

**Database Tables:** `Users`, `ReferralTransactions`

---

## 2. Users / Profile

**Files:** `me.controller.ts` (profile management, merged into auth.routes)
**Prefix:** `/api/auth` (same routes as Auth)

> Profile endpoints are part of the auth module — see Auth section above for `PUT /auth/me`, `POST /auth/password`, `POST /auth/avatar`, `DELETE /auth/avatar`.

**Database Tables:** `Users`

---

## 3. Referral

**Files:** `referral.controller.ts`, `referral.routes.ts`, `referral.validation.ts`
**Prefix:** `/api/referral`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/referral/my-code` | ✅ Bearer | Any | Get current user's referral codes. |
| POST | `/referral/create-code` | ✅ Bearer | Any | Create a referral code for current user (one per user). Code = first 4 chars of email + random hex. |
| GET | `/referral/my-referrals` | ✅ Bearer | Any | List all referrals made by current user (joins with Users for referred user info). |
| GET | `/referral/commission` | ✅ Bearer | Any | Sum of confirmed commissions + count. |
| GET | `/referral/all` | ✅ Bearer | `admin` | List all referral codes with user info. |

**Validation Schemas:**
- `createReferralCodeSchema`: empty object (no body needed)
- `claimRewardSchema`: `reward_id` (positive int)

**Database Tables:** `ReferralCodes`, `ReferralTransactions`, `Users`

---

## 4. Coupons

**Files:** `coupon.controller.ts`, `coupon.routes.ts`, `coupon.validation.ts`
**Prefix:** `/api/coupons`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/coupons/validate` | ✅ Bearer | Any | Validate a coupon code against a plan. Checks: active, date range, usage limit, user limit, minimum purchase. Returns discount amount. |
| POST | `/coupons` | ✅ Bearer | `admin` | Create a new coupon. |
| GET | `/coupons` | ✅ Bearer | `admin` | List all coupons. |
| GET | `/coupons/stats` | ✅ Bearer | `admin` | Coupon usage statistics. |

**Validation Schemas (Zod):**
- `createCouponSchema`: code (3-50), type (`fixed`/`percentage`/`free_trial`/`first_purchase`/`referral`/`flash_sale`), value (positive), min_purchase (≥0), start_date, end_date, usage_limit (optional positive int), user_limit (positive int, default 1), applicable_plans (optional string)
- `applyCouponSchema`: code (string), plan_id (positive int)

**Business Logic:**
- Coupon types: fixed amount, percentage discount, free trial, first purchase, referral, flash sale
- Validates coupon is active, within date range, not exceeded usage/user limits
- Calculates discount: `percentage` → `plan_price * value / 100`; `fixed` → `value`; capped at plan price
- Checks minimum purchase requirement against plan price

**Database Tables:** `Coupons`, `CouponUsages`, `Plans`

---

## 5. Loyalty / Points

**Files:** `loyalty.controller.ts`, `loyalty.routes.ts`
**Prefix:** `/api/loyalty`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/loyalty/points` | ✅ Bearer | Any | Get current user's point balance. Auto-creates Points record if none exists. |
| GET | `/loyalty/history` | ✅ Bearer | Any | Get current user's point transaction history. |
| GET | `/loyalty/rewards` | ✅ Bearer | Any | List available rewards (active, in stock). |
| POST | `/loyalty/redeem` | ✅ Bearer | Any | Redeem a reward. Checks point balance, deducts points via `sp_SpendPoints`, decrements stock, creates `RewardRedemptions` record. |
| POST | `/loyalty/daily-login` | ✅ Bearer | Any | Claim daily login bonus (10 points). Once per day per user via `sp_AddPoints`. |
| POST | `/loyalty/add` | ✅ Bearer | `admin` | Manually add points to a user (body: `user_id`, `points`, `source`). |

**Validation (inline Zod):**
- `redeem`: `reward_id` (positive int)
- `add`: `user_id` (positive int), `points` (int), `source` (string)

**Stored Procedures:** `sp_SpendPoints`, `sp_AddPoints`

**Database Tables:** `Points`, `PointTransactions`, `RewardsCatalog`, `RewardRedemptions`

---

## 6. Audit

**Files:** `audit.controller.ts`, `audit.routes.ts`
**Prefix:** `/api/audit`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/audit` | ✅ Bearer | `admin` | List audit logs with pagination. Filterable by `user_id`, `action`, `entity_type`, `from`, `to`. Joins with Users for user name/email. |
| GET | `/audit/actions` | ✅ Bearer | `admin` | List all distinct action types. |

**Business Logic:**
- Pagination via OFFSET/FETCH. Total count query for pagination metadata.
- Filters: user_id (int), action (exact match), entity_type (exact match), date range (from/to).

**Database Tables:** `AuditLogs`, `Users`

---

## 7. Analytics

**Files:** `analytics.controller.ts`, `analytics.routes.ts`
**Prefix:** `/api/analytics`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/analytics/dashboard` | ✅ Bearer | `admin` | Dashboard summary: DAU, MAU, daily revenue, active members, churn rate. |
| GET | `/analytics/dashboard/summary` | ✅ Bearer | `admin` | Alias for dashboard summary (same handler). |
| GET | `/analytics/revenue` | ✅ Bearer | `admin` | Daily revenue totals (completed payments). |
| GET | `/analytics/retention` | ✅ Bearer | `admin` | Retention cohort data from `AnalyticsRetention` table. |
| GET | `/analytics/conversion` | ✅ Bearer | `admin` | Conversion funnel: visitors (0), registrations, members, paid users. |
| GET | `/analytics/user-growth` | ✅ Bearer | `admin` | Daily new user registrations. |

> **Note:** `exportReport` function exists in controller but is NOT wired in routes.

**Business Logic:**
- DAU = distinct users with WorkoutSessions today
- MAU = distinct users with WorkoutSessions in last 30 days
- Churn rate = cancelled memberships / total memberships in last 30 days
- Revenue = completed Payments

**Database Tables:** `WorkoutSessions`, `Payments`, `Memberships`, `Users`, `AnalyticsRetention`, `AnalyticsDaily`

---

## 8. Revenue

**Files:** `revenue.controller.ts`, `revenue.routes.ts`
**Prefix:** `/api/revenue`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/revenue/dashboard` | ✅ Bearer | `admin` | Revenue summary: total, monthly, daily, new customers today, active subscriptions, churn rate. |
| GET | `/revenue/trend` | ✅ Bearer | `admin` | Daily revenue trend (completed payments). |
| GET | `/revenue/membership-sales` | ✅ Bearer | `admin` | Revenue and count per plan. |
| GET | `/revenue/conversion-funnel` | ✅ Bearer | `admin` | Conversion funnel: registrations → memberships → paid users. |

**Database Tables:** `Payments`, `Memberships`, `Plans`, `Users`

---

## 9. CRM

**Files:** `crm.controller.ts`, `crm.routes.ts`
**Prefix:** `/api/crm`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/crm` | ✅ Bearer | `admin`, `coach` | List customers with search by name/email, filter by tag, pagination. Joins CRMCustomers with Users. |
| GET | `/crm/:id` | ✅ Bearer | `admin`, `coach` | Get single customer with notes, tasks, and payment history. |
| POST | `/crm/:id/notes` | ✅ Bearer | `admin`, `coach` | Add a note to a customer. Body: `content`, `type` (default: "note"). |
| POST | `/crm/:id/tasks` | ✅ Bearer | `admin`, `coach` | Create a task for a customer. Body: `title`, `description`, `due_date`, `assigned_to` (optional, defaults to current user). |

**Database Tables:** `CRMCustomers`, `CRMNotes`, `CRMTasks`, `Users`, `Payments`

---

## 10. Tickets

**Files:** `ticket.controller.ts`, `ticket.routes.ts`, `ticket.validation.ts`
**Prefix:** `/api/tickets`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/tickets` | ✅ Bearer | Any | Create a new ticket. Also creates initial message. Body: `subject`, `description`, `category` (default: "general"), `priority` (default: "medium"). |
| GET | `/tickets` | ✅ Bearer | Any | List tickets. Members see only their own. Filterable by `status`. |
| GET | `/tickets/:id` | ✅ Bearer | Any | Get ticket with messages. Members can only view their own tickets. Internal notes hidden from members. |
| POST | `/tickets/:id/reply` | ✅ Bearer | Any | Reply to a ticket. Reopens closed tickets. Body: `message`, `is_internal` (default: false). |
| PATCH | `/tickets/:id/status` | ✅ Bearer | `admin`, `coach` | Update ticket status (`open`/`pending`/`resolved`/`closed`). |

**Validation Schemas (Zod):**
- `createTicketSchema`: subject (1-200), description (min 1), category (string, default "general"), priority (`low`/`medium`/`high`/`urgent`, default "medium")
- `replyTicketSchema`: message (min 1), is_internal (boolean, default false)

**Database Tables:** `Tickets`, `TicketMessages`, `Users`

---

## 11. Invoices

**Files:** `invoice.controller.ts`, `invoice.routes.ts`
**Prefix:** `/api/invoices`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/invoices` | ✅ Bearer | Any | List invoices. Members see only their own. |
| GET | `/invoices/:id` | ✅ Bearer | Any | Get single invoice. Members can only view their own. |
| POST | `/invoices/generate` | ✅ Bearer | Any | Generate invoice via `sp_GenerateInvoice` stored procedure. Body: `payment_id`, `amount`, `tax`, `discount`. |
| POST | `/invoices/:id/send-email` | ✅ Bearer | `admin` | Mark invoice email as sent (sets `email_sent=1`). |

**Stored Procedures:** `sp_GenerateInvoice`

**Database Tables:** `Invoices`, `Users`

---

## 12. Backup

**Files:** `backup.controller.ts`, `backup.routes.ts`
**Prefix:** `/api/backup`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/backup/create` | ✅ Bearer | `admin` | Create a full SQL Server backup (`.bak`). Uses `BACKUP DATABASE` with compression. Logs to `BackupLogs`. Body: `type` (default: "manual"). |
| GET | `/backup` | ✅ Bearer | `admin` | List all backup logs. |
| POST | `/backup/:id/restore` | ✅ Bearer | `admin` | Restore database from backup. Sets DB to single-user mode, restores with REPLACE, then multi-user. |

**Business Logic:**
- Backup file naming: `gymer_backup_{type}_{date}_{timestamp}.bak`
- Backup directory from `config.backup.dir`
- Restore: `ALTER DATABASE ... SET SINGLE_USER WITH ROLLBACK IMMEDIATE` → `RESTORE DATABASE ... WITH REPLACE` → `ALTER DATABASE ... SET MULTI_USER`

**Database Tables:** `BackupLogs`

---

## 13. Coaches

**Files:** `coach.controller.ts`, `coach.routes.ts`
**Prefix:** `/api/coaches`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/coaches` | Public | — | List all active coaches with workout count. Searchable by name/email, paginated. |
| GET | `/coaches/:id` | Public | — | Get single coach by ID with workout count. |

**Business Logic:**
- Coaches are Users with `role = 'coach'`
- Returns workout count via LEFT JOIN with Workouts

**Database Tables:** `Users`, `Workouts`

---

## 14. Bookings

**Files:** `bookings.controller.ts`, `bookings.routes.ts`
**Prefix:** `/api/bookings`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/bookings/coaches` | Public | — | List coaches with stats: total members (from CRMCustomers), avg rating, total sessions. |
| GET | `/bookings/coaches/:id/availability` | Public | — | Get coach's available time slots for a date. Returns 8 slots (09:00-17:00, excluding 12:00). Query: `date` (optional, default today). |
| POST | `/bookings` | ✅ Bearer | Any | Create a booking. Checks for time slot conflicts. Body: `coach_id`, `booking_date`, `start_time`, `end_time`, `notes`. Status: `pending`. |
| GET | `/bookings` | ✅ Bearer | Any | List current user's bookings. Coaches see bookings where they are coach; members see their own. |
| PUT | `/bookings/:id/status` | ✅ Bearer | `admin`, `coach` | Update booking status (`pending`/`confirmed`/`completed`/`cancelled`). |

**Business Logic:**
- Availability: 8 fixed hourly slots (09, 10, 11, 13, 14, 15, 16, 17). Filters out already booked slots.
- Conflict detection: checks for existing pending/confirmed booking for same coach+date+time.
- Booking status flow: pending → confirmed → completed (or cancelled).

**Database Tables:** `Bookings`, `Users`, `CRMCustomers`

---

## 15. Plans / Memberships

**Files:** `plans.controller.ts`, `plans.routes.ts`
**Prefix:** `/api/plans`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/plans` | Public | — | List all active plans, ordered by `sort_order`. |
| GET | `/plans/my-membership` | ✅ Bearer | Any | Get current user's active membership with plan details. |
| POST | `/plans/subscribe` | ✅ Bearer | Any | Subscribe to a plan. Creates `Memberships` record (status: `active`, `auto_renew: 1`) and a `pending` Payment. Rejects if user already has active membership. |
| POST | `/plans/cancel` | ✅ Bearer | Any | Cancel active membership (sets status to `cancelled`, end_date to now). |
| POST | `/plans` | ✅ Bearer | `admin` | Create a new plan. Body: `name`, `description`, `price`, `duration_days`, `type` (`monthly`/`yearly`), `features` (array), `sort_order`. |
| PUT | `/plans/:id` | ✅ Bearer | `admin` | Update a plan. |
| DELETE | `/plans/:id` | ✅ Bearer | `admin` | Delete a plan. |

**Validation Schemas (Zod):**
- `planSchema`: name (1-100), description (optional), price (positive), duration_days (positive int), type (`monthly`/`yearly`), features (string array, optional), sort_order (int, optional), is_active (boolean, optional)
- `subscribeSchema`: `plan_id` (positive int)

**Business Logic:**
- Subscription: calculates `start_date` = now, `end_date` = now + `duration_days`
- Creates pending payment record for plan price
- One active membership per user enforced

**Database Tables:** `Plans`, `Memberships`, `Payments`

---

## 16. Videos / Workouts

**Files:** `videos.controller.ts`, `videos.routes.ts`
**Prefix:** `/api/videos`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/videos/public` | Public | — | List free workout videos only (`is_free = 1`). |
| POST | `/videos` | ✅ Bearer | `admin`, `coach` | Create a workout video. Body: `name`, `description`, `plan_type`, `duration_minutes`, `difficulty`, `coach_id` (optional, defaults to current user), `is_free` (default: 1). |
| PUT | `/videos/:id` | ✅ Bearer | `admin`, `coach` | Update a workout video. |
| DELETE | `/videos/:id` | ✅ Bearer | `admin` | Delete a workout video. |
| GET | `/videos/categories` | ✅ Bearer | `admin`, `coach` | List distinct workout categories (`plan_type` values). |
| GET | `/videos` | ✅ Bearer | `admin`, `coach` | List all workout videos (filterable by category, difficulty, search, paginated). |
| GET | `/videos/:id` | ✅ Bearer | `admin`, `coach` | Get single workout video with instructor info. |

**Database Tables:** `Workouts`, `Users`

---

## 17. Exercises

**Files:** `exercises.controller.ts`, `exercises.service.ts`, `index.ts`
**Prefix:** `/api/exercises`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/exercises` | Public | — | List exercises with filters: `search`, `category`, `difficulty`, `bodyPart`, `target`, `equipment`, `page`, `limit`. |
| GET | `/exercises/categories` | Public | — | List distinct exercise categories. |
| GET | `/exercises/difficulties` | Public | — | List distinct difficulty levels. |
| GET | `/exercises/bodyParts` | Public | — | List distinct body parts. |
| GET | `/exercises/muscles` | Public | — | List distinct muscles (from ExerciseMuscles join). |
| GET | `/exercises/equipment` | Public | — | List distinct equipment types. |
| GET | `/exercises/:id` | Public | — | Get exercise by ID or exerciseId string. Includes tags, muscles, media. |
| GET | `/exercises/:id/media` | Public | — | Get media for an exercise. |
| PUT | `/exercises/:id` | ✅ Bearer | `admin`, `coach` | Update exercise fields (partial update). |
| POST | `/exercises/:id/media` | ✅ Bearer | `admin`, `coach` | Add media to an exercise. Body: `thumbnailUrl`, `imageUrl`, `previewVideoUrl`, `source`, `confidenceScore`, `verified`. |
| DELETE | `/exercises/media/:mediaId` | ✅ Bearer | `admin` | Delete exercise media. |
| POST | `/exercises/populate-media` | ✅ Bearer | `admin` | Seed media for all exercises (via `mediaService.populateAllExercises`). |
| POST | `/exercises/seed-media` | ✅ Bearer | `admin` | Alias for populate-media. |

**Business Logic:**
- Exercises have tags (many-to-many via `ExerciseTags`), muscles (`ExerciseMuscles`), and media (`ExerciseMedia`)
- Media population: uses Unsplash for images and sample videos, seeded with `gymfit` source
- List query uses dynamic WHERE clause with multiple optional filters

**Database Tables:** `Exercises`, `ExerciseTags`, `ExerciseMuscles`, `ExerciseMedia`

---

## 18. Products

**Files:** `products.controller.ts`, `products.routes.ts`, `index.ts`
**Prefix:** `/api/products`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/products` | Public | — | List products with pagination, sorting (`price-low`/`price-high`/`newest`/`name`/`rating`), category filter. |
| GET | `/products/search` | Public | — | Search products by name, description, SKU, or brand name. Paginated. |
| GET | `/products/featured` | Public | — | Get featured products (limit param, default 8). |
| GET | `/products/new` | Public | — | Get 8 newest products. |
| GET | `/products/sale` | Public | — | Get products on sale (sale_price < price, sorted by discount amount). |
| GET | `/products/categories/all` | Public | — | List all categories with product count. |
| GET | `/products/brands/all` | Public | — | List all brands with product count. |
| GET | `/products/category/:category` | Public | — | List products by category (slug, name, or ID). Paginated. |
| GET | `/products/:id` | Public | — | Get single product with brand, category, parsed JSON fields (specifications, features, gallery_images), and related products. |

**Business Logic:**
- Products linked to Brands and Categories
- JSON fields parsed: `specifications` (object), `features` (array), `gallery_images` (array)
- Related products: top 4 from same category by rating
- `is_on_sale` is aliased from `is_featured`

**Database Tables:** `Products`, `Brands`, `Categories`

---

## 19. Media

**Files:** `media.controller.ts`, `media.routes.ts`, `media.service.ts`
**Prefix:** `/api/media`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/media/status` | Public | — | Get media processing stats: total products, with webp, with svg, null, files on disk. |
| POST | `/media/process/:productId` | Public | — | Process single product media: search Amazon for product images, download, convert to WebP, generate thumbnail, update DB. |
| POST | `/media/batch-process` | Public | — | Batch process all products. Skips already-processed (has .webp). Returns summary. |

**Business Logic:**
- **Amazon scraping**: searches Amazon for brand + product name, extracts ASIN, fetches product page, extracts high-res image URL
- **Image processing**: downloads via curl, converts to WebP using Python PIL, generates 300x300 thumbnail
- **Storage**: `public/media/products/{brand-slug}/{product-slug}/main.webp` + `thumbnail.webp`
- **Exercise media seeding**: `mediaService` generates Unsplash image URLs and sample videos for exercises
- Old SVG files deleted when WebP is generated

**Database Tables:** `Products`, `ExerciseMedia`

---

## 21. Affiliate

**Status:** Empty directory — no controller, routes, or service files exist yet.

---

## 22. Notifications

**Status:** Empty directory — no controller, routes, or service files exist yet.

---

## Database Tables Summary

| Table | Used By |
|-------|---------|
| `Users` | Auth, Profile, Referral, Audit, CRM, Bookings, Tickets, Invoices, Coaches, Videos, Analytics, Revenue |
| `ReferralCodes` | Referral |
| `ReferralTransactions` | Auth (registration), Referral |
| `Coupons` | Coupons |
| `CouponUsages` | Coupons (validation) |
| `Points` | Loyalty |
| `PointTransactions` | Loyalty |
| `RewardsCatalog` | Loyalty |
| `RewardRedemptions` | Loyalty |
| `AuditLogs` | Audit |
| `AnalyticsRetention` | Analytics |
| `AnalyticsDaily` | Analytics (exportReport, unused in routes) |
| `CRMCustomers` | CRM, Bookings |
| `CRMNotes` | CRM |
| `CRMTasks` | CRM |
| `Tickets` | Tickets |
| `TicketMessages` | Tickets |
| `Invoices` | Invoices |
| `BackupLogs` | Backup |
| `Bookings` | Bookings |
| `Plans` | Plans, Coupons |
| `Memberships` | Plans, Analytics, Revenue |
| `Payments` | Plans, Analytics, Revenue, Invoices, CRM |
| `Workouts` | Coaches, Videos |
| `Exercises` | Exercises |
| `ExerciseTags` | Exercises |
| `ExerciseMuscles` | Exercises |
| `ExerciseMedia` | Exercises, Media service |
| `Products` | Products, Media |
| `Brands` | Products |
| `Categories` | Products |
| `WorkoutSessions` | Analytics |

## Stored Procedures

| Procedure | Used By | Purpose |
|-----------|---------|---------|
| `sp_GenerateInvoice` | Invoices | Generate invoice from payment |
| `sp_SpendPoints` | Loyalty | Deduct points from user balance |
| `sp_AddPoints` | Loyalty | Add points to user balance |

---

## Middleware Stack (applied globally)

| Middleware | Purpose |
|------------|---------|
| `securityHeaders` | Custom security headers |
| `helmet` | HTTP security headers |
| `cors` | CORS with config origin |
| `compression` | Response compression |
| `express.json` | JSON body parsing (10mb limit) |
| `express.urlencoded` | URL-encoded body parsing |
| `sessionMiddleware` | Session management |
| `sanitizeMiddleware` | Input sanitization |
| `createAuditMiddleware` | Auto-audit logging |
| `apiLimiter` | Global rate limiting |
| `csrfProtection` | CSRF token validation (state-changing routes) |

---

## File Structure Summary

```
src/modules/
├── auth/           ✅ auth.controller.ts, auth.routes.ts, auth.validation.ts, me.controller.ts
├── analytics/      ✅ analytics.controller.ts, analytics.routes.ts
├── audit/          ✅ audit.controller.ts, audit.routes.ts
├── backup/         ✅ backup.controller.ts, backup.routes.ts
├── bookings/       ✅ bookings.controller.ts, bookings.routes.ts
├── coaches/        ✅ coach.controller.ts, coach.routes.ts
├── coupon/         ✅ coupon.controller.ts, coupon.routes.ts, coupon.validation.ts
├── crm/            ✅ crm.controller.ts, crm.routes.ts
├── exercises/      ✅ exercises.controller.ts, exercises.service.ts, index.ts
├── invoices/       ✅ invoice.controller.ts, invoice.routes.ts
├── loyalty/        ✅ loyalty.controller.ts, loyalty.routes.ts
├── media/          ✅ media.controller.ts, media.routes.ts, media.service.ts
├── notifications/  ❌ (empty directory)
├── plans/          ✅ plans.controller.ts, plans.routes.ts
├── products/       ✅ products.controller.ts, products.routes.ts, index.ts
├── referral/       ✅ referral.controller.ts, referral.routes.ts, referral.validation.ts
├── revenue/        ✅ revenue.controller.ts, revenue.routes.ts
├── tickets/        ✅ ticket.controller.ts, ticket.routes.ts, ticket.validation.ts
├── users/          ❌ (empty directory)
└── videos/         ✅ videos.controller.ts, videos.routes.ts
```
# HISTORICAL REFERENCE — NOT CURRENT SOURCE OF TRUTH

Retained as a point-in-time module inventory. Use the [Developer Guide](../../DEVELOPER_GUIDE.md) and actual source for current modules.
