---
name: space-explorer-api-verify
description: Verify a space-explorer-api change against the running graphql server — smoke every query and mutation with curl, capture evidence. Use after any change under apps/space-explorer-api, before its report or commit.
---

# verify space-explorer-api

🐾 a pet app: this pass proves the server starts and answers. nothing more.

## the handle

- **nothing serves the api by default.** start it with the **start** steps of `space-explorer-api-run` — always on a scratch copy of `db.sqlite` — and stop it with its **stop** steps when the pass ends.
- **main** is `http://localhost:4000/`, **a worktree** is `4000 + offset` — `.worktree-offset` holds the offset (`:4010` for the first tree).
- the server log must say `injected env (0)`: the scratch `DATABASE_URL` won. `(1)` means it writes the tracked `db.sqlite` — stop and restart on the scratch copy.

## checks

1. **it answers** — `{ launches(pageSize: 5) { hasMore list { id } } }` returns 5 ids, `hasMore: true`, 0 `errors`. print the counts with `jq`, never the payload.
2. **every operation runs** — `.claude/skills/space-explorer-api-run/smoke.sh <port>` prints `✓ smoke passed on :<port>`.

## evidence

- the `injected env (0)` line
- the two check lines: the launches counts and the smoke verdict
