---
name: run-space-explorer-api
description: Run, start or smoke-test space-explorer-api — the graphql server behind space-explorer-ui — in a worktree, driven with curl. Use when asked to run the api, start its server, query it, or check a coder's resolver change against the live server.
---

# run space-explorer-api

An Apollo graphql server with no ui. Launches come from an external SpaceX rest source; users and trips live in a sqlite file. It serves on `4000 + offset` (`:4010` for the first worktree). Drive it with `curl`, through `smoke.sh` beside this file.

Paths are relative to the bytes repo root unless they start with `apps/space-explorer-api`.

## Run: a worktree (the coder path)

```bash
git worktree add .claude/worktrees/<slug> -b coder/<slug> main
pnpm worktree:seed .claude/worktrees/<slug>     # ~4 s; prints «space-explorer 5183/4010» — the api is the second number
cd .claude/worktrees/<slug>/apps/space-explorer-api
cp db.sqlite <scratch>/se-api.sqlite            # the throwaway db — see «the db» below
DATABASE_URL=file:<scratch>/se-api.sqlite pnpm dev   # run_in_background — note its task id
```

Ready in under a second. Wait for it, then check the log says the scratch db won:

```bash
timeout 40 bash -c 'until curl -sf -o /dev/null -H "apollo-require-preflight: 1" "localhost:4010/?query=%7B__typename%7D"; do sleep 1; done'
# log: «injected env (0) from .env» then «🚀 Server ready at http://localhost:4010/»
```

`injected env (0)` means `.env` set nothing, because `DATABASE_URL` was already set. A `(1)` means the server is writing to the tracked `db.sqlite`.

A `run` pass stops the server when its check is done. A coder keeping it up for its own work owns that lifetime (`x:crew-coder`), not this skill.

## Drive

```bash
apps/space-explorer-api/.claude/skills/run-space-explorer-api/smoke.sh 4010
# ▸ launches ▸ launch(id) ▸ login ▸ bookTrips ▸ userProfile ▸ cancelTrip
# ✓ smoke passed on :4010
```

It runs every query and mutation once and prints each response. It exits non-zero on any graphql `errors` or on a dead port (exit 7). A second arg picks the login email (default `smoke@example.com`).

One query by hand:

```bash
curl -s -H 'content-type: application/json' localhost:4010/ -d '{"query":"{ launches(pageSize: 2) { cursor hasMore list { id mission { name } } } }"}'
```

Authed calls send `-H "authorization: <token>"`. The token is what `login` returns: the email in base64, no `Bearer` prefix.

## Stop

Stop the background task that ran `pnpm dev` (TaskStop with its task id). That takes the `tsx` node child with it. Never kill a PID found by port lookup. Then:

```bash
lsof -nP -iTCP:4010 -sTCP:LISTEN   # prints nothing
git worktree remove .claude/worktrees/<slug>
```

## Test

```bash
cd apps/space-explorer-api && pnpm typecheck   # tsc, ~1 s; the app has no test suite
```

## The db — read before any write

- `db.sqlite` **and** `.env` are tracked in git. `.env` says `DATABASE_URL="file:./db.sqlite"`, resolved from the app dir. Without the override, `login` and `bookTrips` write into the tracked file and dirty the tree.
- the scratch copy already carries every migration. A `prisma migrate` runs only against a scratch `DATABASE_URL`, and the reply says so.
- `prisma/db.sqlite` is a second tracked copy. The server does not open it (`src/lib/prismaClient.ts` reads only `DATABASE_URL`).
- production runs on Railway (`railway.json`) with its own db. Nothing here touches it.

## Gotchas

- **the port is `4000 + offset`** — `.worktree-offset` holds the offset, and it follows the tree's index in `git worktree list`, so a second live tree gets `:4020`. Read the seed's line; never assume `:4010`. A port already taken belongs to someone else: report it, never kill it.
- launches need the network: they come from `https://gateway.pipeworx.io/spacex/`. `site: "Unknown"` and `missionPatch: ""` are that source's data, not a bug.
- an authed call for an email that never ran `login` gets `UNAUTHENTICATED` — the context drops a token whose user is not in the db.
- error responses carry a full `stacktrace` in `extensions`. That is dev mode, expected.
- `space-explorer-ui`'s codegen points at `:4000`, the main checkout's port, not the worktree's.
