# Git and Branch Workflow

TASK-007 final source is branch `007c-order-management`, commit `427ad52996961648ffc622ca1bf2999a5aab3df4`. TASK-008 branches from that commit; the official proposed/current branch is `008-workout-programs-progress`.

Contributors do not push directly to `main`, merge `main` during this task, force-push, or rewrite the TASK-007 baseline. Stage explicit files only—never `git add .` or `git add -A`. Exclude `.env`, secrets, raw logs, backups, uploads, browser/acceptance artifacts, test DB files, `node_modules`, and `dist`.

Before handoff, update canonical documentation, validate links/secrets/diff whitespace, inspect `git status` and staged diff, commit with a scoped message, push the feature branch, and verify local HEAD equals the remote branch. Teammates continue with:

```bash
git fetch origin
git switch 008-workout-programs-progress
git pull --ff-only origin 008-workout-programs-progress
```

The first implementation action is the TASK-008 Discovery Gate, not migration creation.
