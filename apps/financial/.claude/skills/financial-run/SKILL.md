---
name: financial-run
description: Run, start or screenshot financial — the invoices dashboard with login, a next dev server for a worktree or a coder's live changes, on a scratch Postgres, driven with agent-browser. Use when asked to run financial, start its dev server, log in to it, show a coder's changes, or screenshot it.
---

# run financial

A Next.js 16 dashboard (invoices, customers, revenue) behind a better-auth login. **Two processes:** `next dev` on `3000 + offset` (`:3010` for the first worktree) and a **scratch Postgres** in Docker on `:55432`. Drive it with `agent-browser`.

⚠️ **the gitignored `apps/financial/.env` (which `worktree:seed` copies into every tree) points `DATABASE_URL` at `db.prisma.io`** — the hosted Prisma Postgres the Vercel CLI wrote, treat it as production. Logging in writes a session row, so every run here overrides `DATABASE_URL` with the scratch one. Writing to `db.prisma.io` needs dima's word first.

Paths are relative to the bytes repo root unless they start with `apps/financial`.

## Run: a worktree (the coder path)

```bash
git worktree add .claude/worktrees/<slug> -b coder/<slug> main
pnpm worktree:seed .claude/worktrees/<slug>        # ~4 s; prints «next apps 3010» for offset 10
```

Process 1 — the scratch database. `colima status` first: start colima only if it is stopped, and remember that you started it.

```bash
colima start                                       # ~13 s; only if `colima status` says not running
docker run -d --name financial-run-db -e POSTGRES_PASSWORD=pg -p 55432:5432 postgres:17-alpine
timeout 90 bash -c 'until docker exec financial-run-db pg_isready -U postgres -q; do sleep 1; done'
cd .claude/worktrees/<slug>/apps/financial
export DATABASE_URL=postgresql://postgres:pg@localhost:55432/postgres
pnpm db:push                                       # ~1 s
pnpm db:seed                                       # ~12 s, «✅ Seed succseeded.»
docker exec financial-run-db psql -U postgres -tAc 'select (select count(*) from "User"),(select count(*) from "Customer"),(select count(*) from "Invoice"),(select count(*) from "Revenue")'
# 1|6|13|12
```

Process 2 — the server. Check `lsof -nP -iTCP:3010 -sTCP:LISTEN` first; a taken port is reported, never killed.

```bash
cd .claude/worktrees/<slug>/apps/financial && DATABASE_URL=postgresql://postgres:pg@localhost:55432/postgres pnpm dev   # run_in_background — note its task id
timeout 90 bash -c 'until curl -sf -o /dev/null localhost:3010; do sleep 1; done'
```

A `run` pass stops both processes when its check is done. A coder serving the tree for dima keeps them up until the worktree goes — that lifetime is the coder's contract (`x:crew-coder`), not this skill's.

## Drive

The seed user is `user@x.com` / `12345`, and the login form comes pre-filled with it.

```bash
export AGENT_BROWSER_SESSION=financial-run
agent-browser set viewport 1280 800
agent-browser open http://localhost:3010/dashboard   # the proxy redirects to /login
agent-browser wait --load load
agent-browser snapshot -i                          # «Log in to continue.», EMAIL, PASSWORD, «Log in»
agent-browser click @e3                            # «Log in» (ref from the snapshot)
agent-browser wait --url '**/dashboard' && agent-browser wait --load networkidle
agent-browser screenshot <path>/dashboard.png
agent-browser open http://localhost:3010/dashboard/invoices/create
agent-browser wait --load networkidle
agent-browser snapshot -i -c                       # customer combobox, amount textbox, Pending / Paid, «Create Invoice» — refs below are from this snapshot
agent-browser select @e84 "Amy Burns"
agent-browser click @e91 && agent-browser type @e91 "42.50"
agent-browser click @e88                           # the «Paid» label
agent-browser click @e83                           # «Create Invoice»
agent-browser wait --url '**/dashboard/invoices' && agent-browser wait --load networkidle
agent-browser eval '(() => document.body.innerText.includes("$42.50"))()'   # true
agent-browser screenshot <path>/invoices.png
agent-browser console                              # healthy: only «[Fast Refresh]» lines
agent-browser close
```

Prove a write reached the scratch database, not the hosted one:

```bash
docker exec financial-run-db psql -U postgres -tAc 'select amount,status from "Invoice" where amount=4250'   # 4250|paid
```

Look at the screenshots: `/dashboard` shows four cards (collected, pending, 13 invoices, 6 customers), a green revenue bar chart and «Latest invoices»; `/dashboard/invoices` lists the new $42.50 Amy Burns row on top, stamped PAID.

## Stop

Stop the background task that ran `pnpm dev` (TaskStop with its task id) — never a PID found by port lookup. Then the database, then colima only if you started it:

```bash
lsof -nP -iTCP:3010 -sTCP:LISTEN     # prints nothing
lsof -nP -iTCP:9229 -sTCP:LISTEN     # prints nothing: the --inspect debugger went with it
docker rm -f financial-run-db
colima stop                          # only if you started it; ~2 s
lsof -nP -iTCP:55432 -sTCP:LISTEN    # prints nothing
git -C .claude/worktrees/<slug> status --short    # empty
git worktree remove .claude/worktrees/<slug>
```

## Test

```bash
cd apps/financial && pnpm test       # vitest, 1 file, 2 tests, ~1 s
```

## Gotchas

- **amounts are integer cents** — the $42.50 invoice is `4250` in the `Invoice` table (`src/lib/money.ts`).
- **every protected path redirects to `/login`** without the better-auth session cookie (`src/proxy.ts`); only `/`, `/login` and `/signup` are public. After login the cookie lives in the `AGENT_BROWSER_SESSION`, so `/login` then redirects to `/dashboard`.
- **the `DATABASE_URL` override wins over `.env`** — `dotenv/config` and next's env loading never overwrite a variable already set. Next still prints «Environments: .env»; the queries go to `:55432` all the same.
- **`colima start` switches the docker context to `colima`, and `colima stop` switches it back to `default`.** With colima stopped, `docker` fails with «failed to connect to the docker API at unix:///var/run/docker.sock».
- **the four next apps share base port 3000** — `cv`, `figmentation`, `financial` and `x-com-chat` all start on `3000 + offset`; one per tree.
- **the offset is the tree's position in `git worktree list`**, read at seed time — a tree seeded after another one was removed can land on the same offset as a live tree. Read `.worktree-offset` and check the port before starting.
- **`--inspect` prints «Starting inspector on 127.0.0.1:9229 failed: address already in use» on its own start** — the parent takes `:9229` and next's child process then fails on it. It is only a warning.
- **in financial, `next dev` left `AGENTS.md` and `next-env.d.ts` clean** — unlike cv, both already carry next's form. Still run `git status --short` before `git worktree remove`; revert either one if next rewrites it.
- **the seed prints «[Better Auth] Base URL is not set»** — harmless for a local run; login and redirects worked.
- **`agent-browser find text '$42.50'` finds nothing** even while the row is on screen — use the `eval` on `innerText` above.
- the TanStack Query devtools button and the Next.js dev-tools button sit in every dev screenshot — known, not a finding.
- `financial-run-db` and `:55432` are fixed names: two financial runs at once collide. Give the second one its own container name and port.
