# Contributing to GymFit

## Branches and commits

- Branch from the verified task baseline. TASK-008 uses base `007c-order-management` commit `427ad52996961648ffc622ca1bf2999a5aab3df4` and branch `008-workout-programs-progress`.
- Suggested names: `008a-exercise-programs`, `008b-member-sessions`, `008c-member-progress`, or `fix/<short-topic>`.
- Do not push directly to `main`. Use explicit paths with `git add`; never use `git add .` or `git add -A`.
- Example commits: `feat: add workout program builder`, `fix: enforce member session ownership`, `docs: update TASK-008 handoff`.

Never commit `.env`, secrets, raw `.log` files, backups, uploads, test databases, browser profiles, acceptance artifacts, `node_modules`, or `dist`.

## Code conventions

- Backend: TypeScript Express modules with routes, validation, and service/controller boundaries matching the current module; async failures go to central error handling; parameterize SQL; derive identity from JWT; enforce authorization and ownership in the backend.
- Frontend: typed React components, React Router routes, API service functions, Zustand only for shared state, inline validation and React dialogs/toasts. Do not use `window.alert`/`window.confirm` for new TASK-008 flows.
- Preserve inventory invariant `available = on_hand - reserved` and existing commerce transitions.

## Migrations and acceptance

- Use the next ordered migration; TASK-008 starts at `0006`. Never modify an applied migration or its checksum.
- Back up and verify before applying. Status checks are read-only. Never run acceptance mutations against `GYMFIT_DB`.
- Use `GYMFIT_DB_TASK008_ACCEPTANCE_<timestamp>` for acceptance, verify database identity before mutation, then clean it up and re-check canonical integrity.

Run targeted typecheck/lint/tests while developing. Use Build Gate A/B/C at subtask boundaries and one final build, as specified; do not repeatedly rebuild after each file. Authorization, ownership/IDOR, transition, concurrency, validation, timezone, and browser flows are required where affected.

Every completed task must update canonical docs, migration notes, API overview, status/handoff, and known limitations. Before handoff: validate links, scan changed files for secrets, run `git diff --check`, review staged paths, commit explicitly, push the feature branch, and report the exact commit.
