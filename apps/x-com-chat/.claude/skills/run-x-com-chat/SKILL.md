---
name: run-x-com-chat
description: Run, start or screenshot x-com-chat — its next dev server plus convex dev for a worktree or a coder's live changes, driven with agent-browser. Use when asked to run x-com-chat, start its dev server, send a chat message in it, show a coder's changes, or screenshot it.
---

# run x-com-chat

A Next 16 chat app with two dev processes: **`next dev`** serves the pages on `3000 + offset`, **`convex dev`** pushes `convex/` to the Convex dev deployment. Pages read and write that cloud deployment directly, so `next dev` alone runs the app — start `convex dev` too only when the change touches `convex/`. Nothing serves this app in the background on the mac. Drive it with `agent-browser`.

Paths are relative to the bytes repo root unless they start with `apps/x-com-chat`.

## Start: a worktree (the coder path)

```bash
git worktree add .claude/worktrees/<slug> -b coder/<slug> main
pnpm worktree:seed .claude/worktrees/<slug>   # ~4 s: copies .env/.env.local, installs with CI=1, writes .worktree-offset; prints «next apps 30N0»
lsof -nP -iTCP:3020 -sTCP:LISTEN              # empty = free. taken → report it, never kill it
cd .claude/worktrees/<slug>/apps/x-com-chat && pnpm dev          # run_in_background — note its task id
cd .claude/worktrees/<slug>/apps/x-com-chat && pnpm dev:convex   # only if convex/ changed; run_in_background — note its task id
```

Ready checks (the port is `3000 + offset`; `:3020` below):

```bash
timeout 60 bash -c 'until curl -s -o /dev/null localhost:3020/chat; do sleep 1; done'
curl -s -o /dev/null -w '%{http_code}\n' localhost:3020/chat    # 200 (first compile ~4.5 s); / answers 308 → /chat
```

`convex dev` is ready when its output prints `Convex functions ready!` (~1.5 s). It needs no login on dima's mac.

A `run` pass stops what it started when its check is done. A coder serving the tree for dima keeps it up by its own contract (`x:crew-coder`), not this skill's.

## Drive

```bash
export AGENT_BROWSER_SESSION=run-x-com-chat
agent-browser set viewport 1280 800
agent-browser open http://localhost:3020          # redirects to /chat/<friendId>/<chatId>, the last chat
agent-browser wait --load load
agent-browser snapshot -i                         # textbox "To chat...", button "Send", combobox (friend), link "⚙️ Settings"
agent-browser fill @e12 "run-skill probe: reply with one word"   # refs from the snapshot
agent-browser click @e15
timeout 40 bash -c 'until agent-browser get text body | grep -q "run-skill probe"; do sleep 1; done'
agent-browser wait 6000                           # the reply streams in ~2 s
agent-browser screenshot <path>.png
agent-browser console                             # healthy: «[HMR] connected» + the Clerk dev-keys warning
agent-browser close
```

Look at the screenshot: the friend's portrait sits left, the chat right, and the new message has a «Reasoned for a few seconds» reply under it. The server log shows `POST /api/chat 200`.

To prove the tree serves its own code: edit a string (e.g. `placeholder='To chat...'` in `src/app/(chat)/chat/[[...chatAddress]]/parts/Chat.tsx`), then `agent-browser get attr textarea placeholder` shows the new text within ~3 s.

## Stop

Stop only what you started: TaskStop each background task by its id (the `pnpm dev` one, and the `pnpm dev:convex` one if you started it), or kill the PID captured at start. Never a PID found by port or name. Then:

```bash
lsof -nP -iTCP:3020 -sTCP:LISTEN     # prints nothing
lsof -nP -iTCP:9229 -sTCP:LISTEN     # prints nothing (next's --inspect port)
git -C .claude/worktrees/<slug> checkout -- apps/x-com-chat/AGENTS.md   # only if the diff is next's rewrite, see gotchas
git worktree remove .claude/worktrees/<slug> && git branch -d coder/<slug>   # when the tree is done
```

## Test

No test suite. The gate is `cd apps/x-com-chat && pnpm typecheck` (next typegen + tsc, ~1.3 s).

## Gotchas

- ⚠️ **`next dev` rewrites the tracked `apps/x-com-chat/AGENTS.md`** — it replaces the `nextjs-agent-rules` block on every start («Generated AGENTS.md for AI agents»). The tree goes dirty and `git worktree remove` refuses. Restore the file before removing a probe tree; a coder leaves it out of its commit unless told otherwise.
- ⚠️ **everything hits shared cloud state.** Both `.env` and `.env.local` point at the one Convex **dev** deployment — the same one the main checkout uses. A sent message is saved into dima's real dev chat history, and each send calls Groq with the real key.
- ⚠️ **`convex dev` from a worktree pushes that tree's `convex/` over the shared dev deployment.** Main's dev functions are replaced until someone pushes again. Run it only when the change touches `convex/`, and say so in the report.
- **the port is `3000 + offset`** — `worktree:seed` prints it; `.worktree-offset` holds the offset (20 → `:3020`). The offset is shared by every next app in the tree.
- `--inspect` always binds `:9229`, whatever the offset. The log then prints `Starting inspector on 127.0.0.1:9229 failed: address already in use` — that is next's own child process, harmless noise.
- no login is needed to chat: pages render signed-out. `src/proxy.ts` lists only `http://localhost:3000` in Clerk's `authorizedParties`, so **signing in on a worktree port is expected to fail** (unverified — no sign-in was tried).
- `convex dev` prints «Your Convex AI files are out of date» — noise, not a finding.
