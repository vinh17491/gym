# Security and Authorization

- JWT bearer authentication is implemented by `authenticate`; roles are Admin, Coach and Member. Frontend guards are UX only—the backend is authoritative.
- Admin commerce routers apply authentication and `ADMIN` authorization before handlers. Customer Order services derive the user from JWT and filter/read/mutate by owner, preventing cross-member order access; admin override exists only under `/api/admin`.
- Current modules use validation plus parameterized `mssql` inputs. New sort/filter fields require allowlists and bounded pagination.
- Secrets remain in ignored local environment files. Do not log credentials, tokens, mail passwords, bank private data or body measurements.
- Payment changes follow explicit transition rules and create history. Customer notification requires complete Bank configuration. Mail is attempted after transaction commit; failure does not roll back a committed payment/order transition.
- OrderStatusHistory and PaymentStatusHistory are audit records and are not normal edit/delete resources. TASK-008 completed session/set snapshots must likewise be immutable in normal flow.
- Upload serving denies dotfiles; product uploads are handled through Multer/service validation. Bank/media references accept controlled public-relative or HTTPS paths, not local/active-content schemes. Do not claim antivirus/object-storage controls that are not implemented.

TASK-008 workout and body metrics are personal data: Member self only, Coach only for an active scoped relationship, and Admin only for operational need. There must be no public progress API. Identity comes from JWT, not request body. Assignment/session concurrency requires transactions/locking and unique constraints; cross-member IDOR and Coach scope are mandatory acceptance cases. No medical diagnosis is in scope.
