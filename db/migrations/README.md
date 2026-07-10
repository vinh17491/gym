# GymFit ordered database migrations

This directory is the ordered upgrade path for the database selected by the backend application configuration. `db/schema.sql` remains the legacy destructive bootstrap baseline and must not be used as a migration.

## Naming and ordering

- Migration files use `NNNN_description.sql`.
- Only filenames matching `^\d{4}_.+\.sql$` are accepted.
- Files execute in lexicographic filename order.
- The first four digits are the unique migration version.

## Tracking and checksums

Successful applications are recorded in `SchemaMigrations` with version, filename, SHA-256 checksum and application time. An applied migration whose current file checksum differs from the stored checksum is an integrity failure; the runner never rewrites the stored checksum.

## Transactions and failures

Each migration executes in its own SQL transaction. All batches and the matching `SchemaMigrations` insert commit together. The current transaction rolls back on the first failure, later migrations do not run, and the command exits non-zero.

## SQL Server `GO` policy

The runner supports `GO` only when the trimmed content of a line is exactly `GO`, case-insensitive. It executes those batches sequentially inside the same migration transaction. Text containing `GO` as part of another line is not a separator.

## Safety rules

- Migrations connect only through the backend's configured application database.
- Migration business logic must not hard-code a server, database, user or password.
- Logs may show the database returned by `DB_NAME()` but never passwords or credential-bearing connection strings.
- Never use a destructive reset, database replacement or `db/schema.sql` as a fallback.
- Apply mode stops before any migration transaction when required foundation tables are absent or stock backfill is ambiguous.
- `--status` is read-only: it does not create `SchemaMigrations` and does not apply pending SQL.

