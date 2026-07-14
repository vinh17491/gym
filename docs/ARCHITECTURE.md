# Architecture

## System flow

`React/Vite UI -> Axios -> Express /api routes -> validation/auth -> controller or service -> SQL Server`

JWT bearer authentication supplies `userId` and role. Roles are `ADMIN`, `COACH`, and `MEMBER`; backend middleware and ownership queries are authoritative. The frontend uses `ProtectedRoute` and `AdminRoute` for navigation UX, but these do not replace API authorization.

Backend features live under `backend/src/modules/`. Legacy modules commonly use route/controller pairs; current commerce modules add validation and service layers. `backend/src/app.ts` mounts middleware, `/uploads`, `/image`, `/media`, health/CSRF endpoints, and all API routers. Central not-found/error middleware formats failures; validation uses Zod or express-validator depending on module.

The frontend uses `frontend/src/App.tsx` for React Router 6 routes, layout guards under `components/layout`, Zustand auth/product state, `api/axios.ts`, typed service modules, and feature pages. Public marketing/catalog pages and protected member/admin pages coexist in the same app.

## Catalog and commerce

Product catalog data uses Products, ProductImages, ProductVariants, option tables and per-variant Inventory. The invariant is:

`available = on_hand - reserved`

The commerce chain is `Product -> Variant -> Cart -> Checkout -> Order -> Reservation -> Payment -> Fulfillment`. Cart identity is `(productId, variantId)` and current price/availability is reloaded from the API.

Order lifecycle: `PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED`, with permitted cancellation from pre-delivery states subject to payment rules. Payment lifecycle supports `UNPAID -> PENDING -> PAID/FAILED`, `FAILED -> UNPAID`, direct `UNPAID -> PAID`, and `PAID -> REFUNDED`; unsupported/same-status transitions conflict. `OrderStatusHistory` and `PaymentStatusHistory` preserve actor, transition and time.

Creating an order reserves inventory. Expiration or valid cancellation releases reserved stock; delivery reduces both `reserved` and `on_hand`. A cron runner plus lazy expiration before relevant reads handles expired unpaid reservations. Bank readiness is derived from validated `BANK_*` configuration; mail readiness uses separate `MAIL_*` configuration. Mail occurs after database commit, so delivery failure does not undo committed payment/order state.

Static product uploads use the configured upload directory and `/uploads`; repository images use `/image`; media uses `/media`. Bank QR accepts a root-relative public URL or HTTPS and rejects unsafe/local schemes.

## TASK-008 boundary

TASK-008 must first audit the existing public Exercises API, `WorkoutPrograms.tsx`, `MediaPlayer.tsx`, User/Role data, media handling, and any Coach-Member/workout tables. It extends the system only after REUSE/EXTEND/REPLACE/DEPRECATED decisions; it must not create a parallel workout system. Commerce code and migrations `0001`-`0005` remain untouched.
