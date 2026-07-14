# Environment Setup

Keep `backend/.env` local and ignored. `.env.example` must contain placeholders only. Never copy real values into docs, commits, issues, or logs.

| Group | Variable names | Purpose |
|---|---|---|
| Server | `PORT`, `NODE_ENV` | API port and runtime mode |
| Database | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_TRUSTED_CONNECTION`, `DB_TRUST_SERVER_CERTIFICATE` | SQL Server connection mode/target |
| JWT | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES` | Token signing and lifetime |
| CORS/session | `CORS_ORIGIN`, `REDIS_URL` | Allowed frontend and optional Redis session/rate-limit backing |
| Upload | `UPLOAD_DIR`, `MAX_FILE_SIZE` | Upload location and byte limit |
| Backup | `BACKUP_DIR`, `BACKUP_RETENTION_DAYS` | Local backup location/retention |
| Legacy mail | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Legacy membership/module SMTP |
| Product Order mail | `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_APP_PASSWORD`, `ADMIN_NOTIFICATION_EMAIL` | Order notification transport/readiness |
| Bank | `BANK_NAME`, `BANK_ACCOUNT_NAME`, `BANK_ACCOUNT_NUMBER`, `BANK_QR_IMAGE_URL` | Manual bank-transfer instructions/readiness |
| Order | `ORDER_RESERVATION_MINUTES`, `ORDER_EXPIRATION_CRON` | Reservation deadline and expiration schedule |

`MAIL_*` is deliberately separate from legacy `SMTP_*`. For Gmail, use an App Password, not the normal Gmail login password. Common transport combinations are port 465 with secure enabled or port 587 with secure disabled; use provider requirements. `MAIL_SECURE` must be exactly `true` or `false` and ports must be valid.

`BANK_QR_IMAGE_URL` must be a public root-relative path (for example a deployed `/image/...` asset) or HTTPS URL. Windows paths, protocol-relative URLs and `file:`, `javascript:` or `data:` schemes are invalid.
