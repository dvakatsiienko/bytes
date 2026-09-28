---
name: cv-verify
description: Verify a cv change against the running site — drive `/` and `/cover` in a headless browser, capture evidence. Use after any change under apps/cv, before its report or commit.
---

# verify cv

## the handle

- **nothing serves cv by default.** start it with the **start** steps of `cv-run`, stop it with its **stop** steps when the pass ends.
- **main** is `http://localhost:3000`, **a worktree** is `3000 + offset` — `.worktree-offset` holds the offset (`:3010` for the first tree). all four next apps share that base port; check it is free first.
- two routes: `/` (brief, photo, tool grid, portfolio) and `/cover`.

## drive

- `agent-browser` with a named session: `export AGENT_BROWSER_SESSION=verify-cv-<topic>`; `close` it at the end.
- desktop `set viewport 1280 800`, phone `set viewport 390 844`.
- `open <url>` → `wait --load load` → probe → `console` (healthy: `[HMR] connected`, zero error lines) → `screenshot <path>`.

## checks — each prints a count, never a payload

1. **the tool grid is whole** — `document.querySelectorAll("h5").length` is `11` (one per tool group), `svg` count is `65`, and no image has `complete && naturalWidth === 0`. a changed count is a finding unless the change meant it.
2. **links open safely** — every `a[target=_blank]` carries `noopener` or `noreferrer` in `rel`: the count without it is `0`. `/` has 26 such links, `/cover` 6.
3. **the inner scroller reaches the end** — `<html>` is `overflow-y-hidden`; the page scrolls inside one `SECTION` (`max-h-[calc(var(--browser-height)-…)]`). set its `scrollTop` to `scrollHeight`, then the last external link («Uplay») must be the `elementFromPoint` at its own centre. no `scrollIntoView` — it hides a clipped scroller.
4. **no sideways scroll at 390** — `scrollWidth - innerWidth` is `0` at 390 and 1280. at 390 the photo hides and the grid folds to two columns — expected.
5. **both themes** — click «Dark», then «Light»; `document.documentElement.classList` ends in `dark` / `light`. screenshot the touched view in each. click «System» to reset — the pick sticks in `localStorage` for the session.
6. **print** — `agent-browser pdf <path>` gives a multi-page pdf (3 pages on main in dev); a 1-page pdf means `print:overflow-visible` stopped working and the rest is cut.

## essentials — against a baseline

run the `x:browser-headless` essentials on every touched route at 1280 and 390, the tab walk with `--deny 'nextjs-portal'` (the next dev-tools button, dev only).

main already fails axe. these are the baseline, not a finding of your change — report only a count that grows or a new rule:

- `/` — `color-contrast` ×38 (the tool-group headings), `heading-order` ×1, `page-has-heading-one` ×1
- `/cover` — `landmark-main-is-top-level`, `landmark-no-duplicate-main`, `landmark-unique`, `page-has-heading-one`, ×1 each
- tab walk `/cover` — two external links whose ring is painted over by the next link

## evidence

- a screenshot of every touched route at 1280 and 390, in the theme the change touched
- the check counts above, one line each
- the line `essentials: <n> pass · <m> fail`, with baseline fails named as baseline

## known noise

- the portfolio section renders in dev only (`__DEV__` in `src/frags.ts`) — production has no portfolio.
- the Next.js dev-tools button sits bottom left in every dev screenshot.
- `next dev` rewrites `apps/cv/AGENTS.md` and `next-env.d.ts` — `cv-run`'s gotchas say how to keep them out of a commit.
