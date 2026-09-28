---
name: x-com-chat-verify
description: Verify an x-com-chat change against the running next dev server — load the chat view in a headless browser, capture evidence. Use after any change under apps/x-com-chat, before its report or commit.
---

# verify x-com-chat

🐾 a pet app: this pass proves the app loads and its main view renders. nothing more.

## the handle

- **nothing serves it by default.** start `next dev` with the **start** steps of `x-com-chat-run`, stop it with its **stop** steps when the pass ends. `convex dev` only when the change touches `convex/` — it pushes over the shared dev deployment.
- **main** is `http://localhost:3000`, **a worktree** is `3000 + offset` — `.worktree-offset` holds the offset (`:3010` for the first tree). all four next apps share that base port; check it is free first.

## drive

`agent-browser` with a named session (`export AGENT_BROWSER_SESSION=verify-x-com-chat-<topic>`), `set viewport 1280 800`; `close` it at the end.

## checks

1. **it loads** — `curl -s -o /dev/null -w '%{http_code}' <url>/chat` is `200` (the first compile takes a few seconds).
2. **the chat view renders** — `open <url>` redirects to `/chat/<friendId>/<chatId>`; after ~3 s, `get count textarea` is `1` with placeholder «To chat...», the friend's portrait shows, the saved history lists on the right, and `console` has zero error lines.

a send is not part of this pass: it saves into dima's real Convex dev history and calls Groq with the real key. send only when the change is on the send path, and say so in the report.

## evidence

- a screenshot of the chat view: the sidebar, the portrait, the history, the composer with «Send»
- the two check lines

## known noise

- `next dev` rewrites the tracked `AGENTS.md` — `x-com-chat-run`'s gotchas say how to keep it out of a commit.
- the Clerk dev-keys warning in the console, and the Next.js dev-tools button bottom left.
