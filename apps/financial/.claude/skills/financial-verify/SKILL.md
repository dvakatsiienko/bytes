---
name: financial-verify
description: Verify a financial change against the running dashboard on a scratch Postgres — log in and load the dashboard in a headless browser, capture evidence. Use after any change under apps/financial, before its report or commit.
---

# verify financial

🐾 a pet app: this pass proves the app loads and its main view renders. nothing more.

## the handle

- **nothing serves it by default.** start the scratch Postgres and `next dev` with the **run** steps of `financial-run`, stop all of it (and colima, if you started it) with its **stop** steps when the pass ends.
- ⚠️ the tree's `.env` points at the hosted `db.prisma.io` — treat it as production. logging in writes a session row, so `DATABASE_URL` is always the scratch `postgresql://postgres:pg@localhost:55432/postgres`.
- **main** is `http://localhost:3000`, **a worktree** is `3000 + offset` — `.worktree-offset` holds the offset (`:3010` for the first tree). all four next apps share that base port; check it is free first.

## drive

`agent-browser` with a named session (`export AGENT_BROWSER_SESSION=verify-financial-<topic>`), `set viewport 1280 800`; `close` it at the end.

## checks

1. **the seed landed** — the `psql` count line in `financial-run` prints `1|6|13|12` (users, customers, invoices, revenue months).
2. **login → dashboard** — `open <url>/dashboard` redirects to `/login`; `find role button click --name 'Log in'` (the form comes prefilled) → `wait --url '**/dashboard'`.
3. **the main view renders** — the four cards (collected, pending, 13 invoices, 6 customers), the «Recent revenue» bars for 12 months, and «Latest invoices» with 5 rows; `console` has zero error lines.

## evidence

- a screenshot of `/dashboard`
- the three check lines
