---
name: figmentation-verify
description: Verify a figmentation change against the running showcase — drive home, `/tesla-landing` and `/clinique` in a headless browser, capture evidence. Use after any change under apps/figmentation, before its report or commit.
---

# verify figmentation

## the handle

- **nothing serves figmentation by default.** start it with the **start** steps of `figmentation-run`, stop it with its **stop** steps when the pass ends.
- **main** is `http://localhost:3000`, **a worktree** is `3000 + offset` — `.worktree-offset` holds the offset (`:3010` for the first tree). all four next apps share that base port; check it is free first.
- three routes: `/` (two demo cards), `/tesla-landing`, `/clinique`. all static — no api, no env, nothing writes.

## drive

- `agent-browser` with a named session: `export AGENT_BROWSER_SESSION=verify-figmentation-<topic>`; `close` it at the end.
- desktop `set viewport 1280 800`, phone `set viewport 390 844`.
- `open <url>` → `wait --load load` → probe → `console` (healthy: zero error lines) → `screenshot <path>`.

## checks — each prints a count, never a payload

this app is a pixel showcase: **the screenshot is the main evidence.** read each one at full size and compare it to the Figma file the home card links — a shifted gap, a wrong weight or a cut word is a finding even when every count passes.

1. **every image loads** — no `img` with `complete && naturalWidth === 0`. main: home 2, tesla 1, clinique 5.
2. **home cards route** — `find role button click --name Visit` lands on `/tesla-landing` (a client-side link: `wait --url '**/tesla-landing'`, never `wait --load`). `a[href*="figma.com"]` count is `2`, each with `rel` noopener.
3. **the tesla hero fills the screen at 1280** — `document.documentElement.scrollHeight` equals `innerHeight` (800): one screen, no scroll.
4. **clinique holds at 390** — `scrollWidth - innerWidth` is `0`: the running marquee strip must not push the page sideways. page height is ~4070 at 390, ~1690 at 1280.
5. **clinique stays a static mock** — the buttons are `−`, `+`, «Add to Bag» and four «Shop now»; clicking «Add to Bag» leaves the header at «Bag (0)» (the DOM text; css uppercases it — `find text 'BAG (0)'` finds nothing). a handler that appears is a change, report it.

## essentials — against a baseline

run the `x:browser-headless` essentials on every touched route at 1280 and 390, the tab walk with `--deny 'nextjs-portal'` (the next dev-tools button, dev only).

main already fails these. they are the baseline, not a finding of your change — report only a count that grows or a new rule:

- `/` — axe `heading-order`, `landmark-one-main`, `landmark-unique` ×1 each, `region` ×7; tab walk: both «Figma file» rings painted over by their inner span
- `/tesla-landing` — cursor `default` on «Order Now», «View Inventory» (and «Menu» at 390); tab walk: «View Inventory» ring bottom painted over by the hero img
- `/clinique` — axe `color-contrast` ×12 at 1280, ×10 at 390; `landmark-unique` ×1 at 1280
- `/tesla-landing` at 390 — the hero ends near y 500 and the rest of the screen is white. main looks like this too.

## evidence

- a screenshot of every touched route at 1280 and 390
- the check counts above, one line each
- the line `essentials: <n> pass · <m> fail`, with baseline fails named as baseline

## known noise

- console warnings: `loading="eager"` on the LCP image (tesla, clinique) and «width or height modified» on clinique product images.
- the Next.js dev-tools button sits bottom left in every dev screenshot.
- `next dev` rewrites `AGENTS.md` and `next-env.d.ts` — `figmentation-run`'s gotchas say how to keep them out of a commit.
