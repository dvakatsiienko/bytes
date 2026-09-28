---
name: space-explorer-ui-verify
description: Verify a space-explorer-ui change against the running ui + api pair — log in and load the launches list in a headless browser, capture evidence. Use after any change under apps/space-explorer-ui, before its report or commit.
---

# verify space-explorer-ui

🐾 a pet app: this pass proves the app loads and its main view renders. nothing more.

## the handle

- **nothing serves it by default.** start the pair with the **start** steps of `space-explorer-ui-run`, stop both with its **stop** steps when the pass ends.
- **main** is ui `http://localhost:5173` + api `:4000`, **a worktree** is `5173/4000 + offset` (`:5183`/`:4010` for the first tree).
- the ui must run with `VITE_GQL_URL=http://localhost:<this tree's api port>/` — without it a worktree ui talks to `:4000`.

## drive

`agent-browser` with a named session (`export AGENT_BROWSER_SESSION=verify-space-explorer-ui-<topic>`), `set viewport 1280 800`; `close` it at the end.

## checks

1. **login → launches** — `open <ui>` lands on `/login`; `find role button click --name 'Log in'` (the email comes prefilled) → `wait --url '**/launches'`.
2. **the main view renders** — `get count 'a[href^="/launches/"]'` is `10`, and `console` shows zero error lines.
3. **it talks to its own api** — `network requests --filter localhost:40` lists only this tree's api port.

## evidence

- a screenshot of `/launches`: the header with the email, launch tickets, the bottom nav LAUNCHES / CART / TRIPS / LOGOUT
- the three check lines
