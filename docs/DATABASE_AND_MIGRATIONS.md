# Database and Migrations

GymFit uses SQL Server. The canonical database is `GYMFIT_DB`; acceptance must never mutate it.

The runner in `backend/src/scripts/migrate.ts` reads ordered `db/migrations/NNNN_description.sql` files, applies each in a transaction, and records filename/version/SHA-256 in `SchemaMigrations`. `npm run db:migrate:status` is read-only. A changed checksum for an applied migration is an integrity failure; never edit migrations `0001`-`0005`.

Filenames must match `NNNN_description.sql` and execute lexicographically. Each migration and its tracking row commit in one transaction. A line containing only `GO` is a supported SQL batch separator. Apply mode must stop when required foundation tables are absent or stock backfill is ambiguous; destructive reset/bootstrap is not a fallback.

| Migration | Purpose |
|---|---|
| 0001 | Commerce catalog foundation: variants/options/images and canonical per-variant Inventory |
| 0002 | Default variants, low-stock threshold and InventoryAdjustments |
| 0003 | Orders, OrderItems and OrderStatusHistory |
| 0004 | PaymentStatusHistory |
| 0005 | Reservation expiration metadata/index |

Verified canonical baseline after TASK-007: Products 167, ProductVariants 167, Inventory 167, ProductImages 1, Orders 0, PaymentStatusHistory 0. Inventory enforces non-negative `on_hand`, `0 <= reserved <= on_hand`, and computed `available = on_hand - reserved`. Products own variants/images; variants own inventory; Orders own item snapshots and immutable status/payment history. Expiration releases eligible unpaid reservations; delivery consumes reserved/on-hand stock.

Before applying a migration: confirm target identity, create a canonical backup using the established backup process, verify that backup, review SQL and checksum/status, then apply once. Never include passwords, credential-bearing connection strings or sensitive backup names in documentation/logs.

Acceptance uses an isolated database such as `GYMFIT_DB_TASK008_ACCEPTANCE_<timestamp>` restored from a verified baseline. Verify identity before mutation, run acceptance there, clean up, and re-check canonical counts/integrity.

TASK-008 reserves `0006` for workout foundation, `0007` for Coach-Member/assignment/session data, and `0008` only if progress measurements require persistent storage. These are plans, not existing migrations. Discovery may adapt tables but not numbering. See the [full specification](TASK-008_IMPLEMENTATION_SPEC.md).
