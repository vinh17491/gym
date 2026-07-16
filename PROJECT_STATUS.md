# GymFit Project Status

Updated: 2026-07-15 (Asia/Saigon)

## Auth/RBAC hardening (current)

Authentication/RBAC hardening is in progress on `hotfix/auth-rbac-hardening`. Migration `0006_auth_session_security.sql` is reserved for session security (token versioning, hashed rotating refresh sessions, session revocation and booking-slot uniqueness), not TASK-008. TASK-008 remains **NOT STARTED** and must not use `0006`.

## Current baseline

- Current branch: `008-workout-programs-progress`
- TASK-007 final base: `007c-order-management` at `427ad52996961648ffc622ca1bf2999a5aab3df4`
- Documentation canonicalization starts from commit `a330c93e73566631fc7d043b3d5c0a26d9e81b72`.
- Canonical database: `GYMFIT_DB`
- Applied migrations: `0001`–`0005`
- Overall project: **IN PROGRESS**

| Work item | Status |
|---|---|
| TASK-001 through TASK-006 | COMPLETE |
| TASK-007 | COMPLETE — `FULL_TASK_007_COMPLETE` |
| TASK-008 specification | COMPLETE |
| TASK-008 implementation | NOT STARTED |

TASK-007 runtime, authorization/IDOR, real Bank/QR, real Gmail, authenticated Customer browser and authenticated Admin browser acceptance passed. Acceptance data was cleaned and canonical database integrity passed.

Verified canonical counts after TASK-007: Products 167, ProductVariants 167, Inventory 167, ProductImages 1, Orders 0, PaymentStatusHistory 0.

## TASK-008

TASK-008 was previously cancelled/out of scope, then approved for reactivation after full TASK-007 completion as **WORKOUT PROGRAM AND MEMBER PROGRESS**. AI, camera, pose estimation and automatic rep counting remain excluded.

Current blocker: none. Exact next action: execute the [TASK-008 Discovery Checklist](docs/TASK-008_DISCOVERY_CHECKLIST.md), record REUSE/EXTEND/REPLACE/DEPRECATED decisions, and only then design migration `0006`. No TASK-008 code or migration exists yet.

## Authoritative files

- Current state: this file
- Next work: [ROADMAP.md](ROADMAP.md)
- Technical index: [docs/README.md](docs/README.md)
- TASK-007 proof: [docs/TASK-007_FINAL_HANDOFF.md](docs/TASK-007_FINAL_HANDOFF.md)
- TASK-008 scope: [docs/TASK-008_IMPLEMENTATION_SPEC.md](docs/TASK-008_IMPLEMENTATION_SPEC.md)
- Database rules: [docs/DATABASE_AND_MIGRATIONS.md](docs/DATABASE_AND_MIGRATIONS.md)

Auth/RBAC closure: manual browser acceptance PASS on `5502`/`5501`; temporary resources and isolated database were cleaned up; canonical Products 167, Users 15, Orders 1 and no acceptance fixtures were verified.
