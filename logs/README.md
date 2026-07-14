# Logs Policy

Runtime `.log` files are generated artifacts and must remain ignored. Do not commit passwords, tokens, request payloads, personal data, raw acceptance output, or temporary database names. `backend/logs/` and root `logs/*.log` are not authoritative documentation.

Curated, secret-free milestones belong in `logs/project-history/`. Canonical technical instructions belong in `docs/`. Rotate/delete local runtime logs according to operational need after incidents are resolved; preserve required evidence outside Git under the team's approved secure retention process. Never promote a raw log into Git merely for handoff.
