---
dies-when: the design-system project's shape pass folds what is still true into BYT-25 / the kit tickets, then this file goes
---
Ticket: BYT-25

> a Claude Design read-only review of the kit and every app's ui wiring, as of 2026-09-06 (tree `69aaf29c8330`). counts and wiring may have moved since — re-measure before acting on a number. moved from `apps/trophy-sys/UIKIT-ARCHITECTURE-REVIEW.md`; nothing edited below this line.

# UI Kit Architecture Review — `bytes` monorepo

**Author:** Claude Design (designer perspective)
**Date:** 2026-09-06
**Repo:** `dvakatsiienko/bytes` @ `main`, tree `69aaf29c8330`
**Audience:** CC coordinator + coder session, 2026-09-07
**Method:** read-only scan via GitHub connector — `apps/` (563 files, 140 matched on a UI/theme/component filter), `packages/` (27 files, full), all eight app `CLAUDE.md`/`components.json`, root `CLAUDE.md`, `GLOSSARY-MAP.md`, `pnpm-workspace.yaml`. No code was executed. All file sizes and blob hashes quoted below are from that tree.

---

## 0. The owner's brief, in his own framing

Folded in verbatim in intent, so the coordinator does not need the chat log.

**What he wants**

- Take care of the pet-project apps in `bytes` — none are in production yet.
- Give **each app a real brand**: identity, UI look, UX. Not a reskin.
- Keep a **unified stack**: Next/Vite + Tailwind + shadcn.
- He *likes and wants* a single source of truth. `packages/uikit`-style. He explicitly values reusability and does not want to keep re-deriving buttons per app.

**What he fears**

- **Component shape lock-in.** Not styling — he is explicit that styling is a solved CSS problem and is *not* his concern. The fear is **structure and composition**.
- Concretely: what happens when an app wants to be genuinely unique or to stand out — a Select with lazy search and dynamically dropped-down results, a tooltip with app-specific behaviour, a component whose *shape* differs, not just its skin.
- He anticipates ending up "dancing around" the kit, accumulating workarounds every time he builds something truly unique.
- He frames it as a two-sided coin: kit → too-similar-component lock-in and lost customisability. No kit → full freedom but shadcn duplicated in every app.

**The resolution he arrived at during the conversation, which this document assumes**

> Accept ejectability. Kit-sourced is the default. When dancing around a unique component starts to smell, eject it into the app and own it.

This review's job is to make that principle operational: what goes in kit, what the eject procedure is, and what has to be fixed first regardless.

**One correction to his premise, made early and worth restating:** shadcn is not a component library, it is a code generator with copy-ownership semantics. Ejecting is not a workaround or an abandonment of the abstraction — it is the tool's native mode. This is why the trap he fears is avoidable in a way it would *not* be with MUI or Mantine, where the escape hatch is genuinely lossy.

---

## 1. Executive summary

Five findings, in priority order.

1. **`packages/kit` is not a stub. It works, and two apps are already correctly wired to it** (`cv`, `figmentation`). Kit ships five real components and a token stylesheet. The architecture question is largely already answered in the affirmative; what remains is enforcement.
2. **The most expensive duplication in the repo is not philosophical, it is a config typo.** `x-com-chat` has locally re-derived `button`, `toggle` and `toggle-group` — three components kit already ships — because its `components.json` points `ui` at `@/components/ui`. No design decision caused this. A four-line config change prevents the next occurrence.
3. **Five Buttons exist across the repo.** Kit's, plus four app-local ones. This is the single clearest measurable cost of the current state.
4. **Token contract drift is already live.** Kit is `baseColor: stone`; `cv` and `figmentation` declare `neutral` while pointing their CSS at kit's `globals.css`; `proto-lab` is `slate`. Apps consuming kit components under a different base scale is exactly how "shared components look wrong in my app" begins — and it will be misdiagnosed as lock-in.
5. **The lock-in he fears is already solved in his own repo, once.** `x-com-chat` has both `components/ui/select.tsx` (6 399 B, the shadcn/Radix primitive) and `components/Select.tsx` (2 473 B, an app-specific composition on top). That two-level split *is* the answer to the lazy-search-Select question. It is currently an accident of one app rather than a documented convention. Promote it to a rule.

**Headline recommendation:** keep kit, keep it deliberately small, fix the wiring, write down the eject rule, and do not promote anything to kit until its third consumer.

---

## 2. What is actually in `packages/kit` today

Package name `@ui/kit`, private, `type: module`.

**Components (5)**

| File | Size | Backed by |
| --- | --- | --- |
| `src/components/button.tsx` | 2 167 B | `@radix-ui/react-slot` |
| `src/components/drawer.tsx` | 4 074 B | `vaul` + `@radix-ui/react-dialog` |
| `src/components/tabs.tsx` | 1 953 B | `@radix-ui/react-tabs` |
| `src/components/toggle-group.tsx` | 1 958 B | `@radix-ui/react-toggle-group` |
| `src/components/toggle.tsx` | 1 498 B | `@radix-ui/react-toggle` |

**Supporting**

- `src/hooks/useIsMounted.ts` (232 B)
- `src/icons/ExternalLinkSvg.tsx`, `src/icons/FigmaSVG.tsx`, `src/icons/types.ts`
- `src/lib/utils.ts` (169 B — almost certainly `cn`), `src/lib/index.ts`
- `src/styles/globals.css` (4 438 B)

**Exports are already well shaped** — subpath exports per concern (`./components/*`, `./hooks/*`, `./icons/*`, `./lib/*`, `./globals.css`, `./postcss.config`). This is the right surface for an ejectable kit: consumers import individual files, so nothing forces a barrel and tree-shaking is not a question.

**Two dependency notes for the coder**

- `cva: 1.0.0-beta.3` — a **beta**, and note this is `cva`, not `class-variance-authority`. Upstream shadcn generates against `class-variance-authority`. Every `shadcn add` into kit will need its import rewritten, or a shim. Decide which, once, and record it.
- `zod: 4.5.4` sits in kit's dependencies. Nothing in the five components plausibly needs schema validation. Either a form primitive is planned, or this is a leftover — worth confirming rather than inheriting.
- **`packages/fonts` does not exist.** Root `CLAUDE.md` lists it in the Core Packages table ("Variable font assets — Manrope, Roboto Flex"). `packages/` contains only `biome-config-polished`, `kit`, `prettier-config-polished`, `typescript-config`, `utils`. Either it was removed or never landed; the doc is stale. This matters for branding, because per-app typography is exactly the kind of thing that wants a shared font-asset package.

---

## 3. Wiring state — three regimes, not one

`components.json` reveals each app's actual relationship to kit. There are three distinct regimes and no convention.

| App | `ui` alias | `utils` alias | `tailwind.css` | `baseColor` | Regime |
| --- | --- | --- | --- | --- | --- |
| `kit` | `@ui/kit/components` | `@ui/kit/lib/utils` | `src/styles/globals.css` | `stone` | source |
| `cv` | `@ui/kit/components` | `@ui/kit/lib/utils` | `../../packages/kit/src/styles/globals.css` | `neutral` | **consumes kit** |
| `figmentation` | `@ui/kit/components` | `@ui/kit/lib/utils` | `../../packages/kit/src/styles/globals.css` | `neutral` | **consumes kit** |
| `x-com-chat` | `@/components/ui` | `@/utils/cn` | `src/theme/theme.css` | `stone` | **fully local** |
| `proto-lab` | `@/components/ui` | `@/lib/utils` | `src/frame/theme.css` | `slate` | **fully local** |
| `trophy-sys` | — | — | — | — | **no shadcn at all** |
| `space-explorer-ui` | — | — | — | — | no shadcn |
| `financial` | — | — | — | — | no shadcn |

`cv` and `figmentation` have **byte-identical** `components.json` (blob `29eb76d5c057`).

**Reading of this table.** The kit-consuming path exists and is proven. Two apps opted out by config, and both then re-derived components kit already had. `trophy-sys` opted out on principle — see §6.

---

## 4. Measured duplication

### 4.1 Button × 5

| Location | Size |
| --- | --- |
| `packages/kit/src/components/button.tsx` | 2 167 B |
| `apps/x-com-chat/src/components/ui/button.tsx` | 2 303 B |
| `apps/proto-lab/src/components/ui/button.tsx` | 2 407 B |
| `apps/space-explorer-ui/src/components/Button.tsx` | 2 107 B |
| `apps/financial/src/ui/Button.tsx` | 628 B |

The three ~2.1–2.4 KB files are near-certainly the same shadcn template at different generation dates. `financial`'s is a different, much smaller thing.

### 4.2 Components kit already ships, re-derived locally

| Kit | Duplicate | Note |
| --- | --- | --- |
| `toggle.tsx` (1 498 B) | `x-com-chat/ui/toggle.tsx` (1 766 B) | same Radix primitive |
| `toggle-group.tsx` (1 958 B) | `x-com-chat/ui/toggle-group.tsx` (2 013 B) | same Radix primitive |
| `button.tsx` (2 167 B) | `x-com-chat/ui/button.tsx` (2 303 B) | same Radix primitive |

**This is the finding to lead with tomorrow.** Three components, already solved, re-solved — with no design intent behind it. The cause is one alias in one config file.

### 4.3 Token stylesheets duplicated byte-for-byte

- `apps/cv/src/theme/accent.css` and `apps/x-com-chat/src/theme/accent.css` — **identical**, blob `3ad338a6d483`, 4 752 B each.
- `apps/cv/src/theme/gray.css` and `apps/x-com-chat/src/theme/gray.css` — **identical**, blob `ccc4dcb373a8`, 4 519 B each.

Provable duplication, zero behavioural risk in consolidating, ~9.3 KB of copy-paste. The sizes and names suggest Radix Colors scales. **Move to `packages/kit/src/styles/` on day one** — this is the safest possible first commit and it demonstrates the pattern with no argument attached.

### 4.4 Theme plumbing × 3

| App | File | Size |
| --- | --- | --- |
| `cv` | `components/service/ThemeProvider.tsx` | 293 B |
| `x-com-chat` | `components/service/ThemeProvider.tsx` | 418 B |
| `cv` | `components/service/ThemeSwitcher.tsx` | 1 881 B |
| `x-com-chat` | `components/AppSidebar/ThemeSettings.tsx` | 1 864 B |
| `trophy-sys` | `web/components/theme-toggle.tsx` | 2 729 B |

Three apps, one problem. Note `cv` and `x-com-chat` even share the `components/service/` folder convention — the convention is already shared, only the code is not.

### 4.5 Theme entry file — eight names for one concept

`kit/src/styles/globals.css` · `cv/src/theme/init.css` · `figmentation/src/theme/init.css` · `x-com-chat/src/theme/init.css` · `financial/src/theme/global.css` · `proto-lab/src/frame/theme.css` · `space-explorer-ui/src/theme.css` · `trophy-sys/src/web/theme.css`

Cheap to fix, disproportionately valuable for agent navigation — an agent asked to "change the palette" currently has to guess.

Note also that `x-com-chat`'s `components.json` points `tailwind.css` at `src/theme/theme.css`, but the tree shows `src/theme/init.css` (9 402 B) and no `theme.css`. **The path in the config appears to be wrong.** Verify locally; a stale `tailwind.css` path is a known cause of `shadcn add` writing tokens into a file nobody imports.

### 4.6 Component frequency across apps — the empirical kit boundary

Applying "promote on the third consumer, not the second":

| Component | Apps | Verdict |
| --- | --- | --- |
| Button | 4 (+kit) | **promote — already in kit; delete the duplicates** |
| Theme provider / switcher | 3 | **promote the plumbing** (provider + hook); leave the *visual* switcher per-app |
| Radix color token scales | 2, byte-identical | **promote now** — no risk |
| `cn` / utils | 3 declared (2 → kit, 2 local) | **promote — already in kit; repoint aliases** |
| Icon strategy | fragmented — see below | **decide, then promote** |
| Toggle / ToggleGroup | 2 (kit + x-com-chat) | already in kit; delete duplicate |
| Select | 2 (`x-com-chat/ui/select.tsx`, `trophy-sys/select-control.tsx`) | **wait** — and see §5 |
| Tooltip | 2 (`x-com-chat/ui/tooltip.tsx`, `trophy-sys` CSS-only `.hint`) | **wait** — implementations are philosophically incompatible |
| Table | 2 apps, 3 files (`financial` Customer/Invoice, `trophy-sys` `bar-rows`) | **wait** — data tables and chart tables are not one component |
| Sidebar / nav | 2 (`x-com-chat/ui/sidebar.tsx` 20 480 B, `financial` `Sidenav`) | **wait** — see risk note |
| Progress | 2 (`proto-lab/ui/progress.tsx`, `trophy-sys` `barRender`) | **never, as one component** — see §6 |
| Card | 1 (`proto-lab`) | app-local |
| Badge | 2 (`proto-lab/ui/badge.tsx`, `trophy-sys/platform-badge.tsx`) | **wait** — the second is domain-specific, not a primitive |
| Skeletons | 1 (`financial`, 6 990 B) | app-local until a second consumer |
| Forms / inputs | 2 (`financial` AmountInput/SearchField/InvoiceForm, `space-explorer-ui` LoginForm) | **wait** |

**Honest kit v1 is therefore small:** the five components already there, plus token scales, theme plumbing, `cn`, and an icon decision. Roughly a day of work, and it removes real duplication rather than speculative duplication.

**Risk note on `sidebar.tsx` (20 480 B).** It is the largest UI file in the repo and the most tempting promotion. It is also the one most likely to prove his lock-in thesis correct, because a sidebar is nine-tenths app-shaped composition. Recommend it stays local in `x-com-chat` and is promoted only if a third app genuinely needs the same *structure*.

**Icon strategy is the quiet mess.** Four `components.json` declare `iconLibrary: lucide`. Meanwhile `space-explorer-ui` hand-rolls ten SVG components (`CartSvg`, `HomeSvg`, `LogoutSvg`, `ProfileSvg`, `RocketSvg` at 20 048 B, `CurveSvg`, `LogoSvg`), `x-com-chat` has `LogoSvg` + `SpinnerIcon`, `financial` has `AcmeLogo`, and kit has two icons. Decide: lucide for UI icons, hand-authored SVG for brand marks only, brand marks per-app, never in kit. Then delete the hand-rolled UI icons.

---

## 5. The answer to the lock-in question — and it is already in his repo

`x-com-chat` contains both:

- `src/components/ui/select.tsx` — **6 399 B** — the shadcn/Radix primitive
- `src/components/Select.tsx` — **2 473 B** — an app-level composition over it

That is precisely the structure that dissolves the lazy-search-Select problem. Generalised:

**Layer 1 — primitive (kit).** Radix-wired, minimally styled, behaviour and accessibility only. Kit's `package.json` already declares the right dependencies for this: `react-slot`, `react-dialog`, `react-tabs`, `react-toggle`, `react-toggle-group`.

**Layer 2 — composition (app).** The app assembles primitives into the thing it actually needs. Lazy search, dynamic dropdown results, async loading states, domain-specific keyboard handling — all live here. The app is not fighting kit; it is *using* kit at the layer kit is good at.

**Layer 3 — eject (app).** When even the primitive's structure is wrong, copy it into the app and own it. This is shadcn's native mode, not a defeat.

**The rule that keeps this from rotting:** when an app needs different *behaviour*, it composes (layer 2). When it needs different *structure*, it ejects (layer 3). It never asks kit for a new prop to accommodate one app.

### The actual trap — and it is not lock-in

It is **prop explosion.** One Button trying to serve eight brands through `variant × size × tone × shape × elevation × density` is the failure mode that produces both unmaintainable kit code *and* apps that look identical anyway. A component that can express anything expresses nothing.

**Suggested hard limits, to be argued about tomorrow rather than accepted:**

- Variants per component: **≤ 4**. A fifth is a signal to eject, not to extend.
- No app-name-conditional logic inside kit, ever. No `if (app === 'trophy-sys')`.
- Kit components take no `className` overrides that redefine layout — only `cn`-merged surface styling. Layout changes are an eject.
- If two apps want opposite defaults, kit has no default: the prop becomes required.

### On ejection hygiene

Ejection is cheap to do and expensive to forget. Two things make it survivable:

1. **A provenance header.** When a component is ejected, the copy carries a comment: which kit component, which date, why. Without it, nobody can tell an ejected component from an accidentally-duplicated one — which is exactly the state `x-com-chat`'s button/toggle/toggle-group are in right now, and why they read as drift rather than as decisions.
2. **A one-way door.** Ejected components do not sync back. Do not build a mechanism to reconcile them; the whole point is that the app has taken ownership.

---

## 6. `trophy-sys` is the load-bearing counter-example

It has **no `components.json`** and no shadcn. Fourteen hand-rolled components, `theme.css` at 7 232 B, Tailwind v4 `@theme inline` token indirection, visx charts.

This is not neglect. Its `CLAUDE.md` and its code comments record deliberate, measured decisions:

- Progress bars are `█`/`░` character runs from `barRender`, **not DOM elements**.
- Colours are Tailwind theme tokens only — no hex in components.
- Chart colour lives in one file, `chart-theme.ts`, because visx takes colour as prop strings and cannot use Tailwind classes.
- The palette "carries two categorical series, not six" — measured, with a ΔE figure under deuteranopia.
- A single-hue ordinal ramp was tried for rarity tiers and rejected on sight, with the date recorded.
- `.panel` + `.panel-title` is a boxed-with-a-label frame where the title is positioned *outside* the border.
- Chrome is unselectable by default; only real names opt back in.

**Why this matters for the kit decision.** A shared `Progress` component cannot serve both `proto-lab`'s DOM-node progress bar and `trophy-sys`'s character-run bar. Not because of styling — because they are different *media*. This is the clearest existing proof that the eject rule is necessary rather than defensive.

**Recommendation:** `trophy-sys` stays outside kit for now and is the deliberate stress test. If kit v1 lands well, revisit whether `trophy-sys` adopts kit *primitives* while keeping its own compositions — the layer-1/layer-2 split makes that a real possibility rather than an all-or-nothing.

**A caution for the branding programme.** `trophy-sys` is the only app in the repo with a genuine, documented visual point of view. It would be a mistake to flatten it toward a house style. It is the app most likely to *set* the house standard for rigour.

---

## 7. Which apps are actually in scope for branding

Eight registered apps; not eight branding problems.

| App | UI? | Branding priority | Note |
| --- | --- | --- | --- |
| `trophy-sys` | yes | **high** | strongest existing POV; redesign already in flight |
| `x-com-chat` | yes | **high** | most components, most local shadcn, active dev |
| `cv` | yes | **high** | Production status; it *is* his public face |
| `proto-lab` | yes | medium | a harness for prototypes — its chrome should recede by design |
| `financial` | yes | **low / caution** | see below |
| `space-explorer-ui` | yes | low | tutorial-derived GraphQL demo |
| `figmentation` | yes | **exempt** | CSS Modules, deliberately bespoke experiments |
| `space-explorer-api` | no | n/a | server |

**`financial` needs a decision before it needs a design.** It contains `src/ui/AcmeLogo.tsx`, route-colocated `ui/` folders, `InvoiceStatus`, `LatestInvoices`, `RevenueChart`, `CustomerTable`, `Pagination`, `Skeletons` — this is the shape of the Next.js Learn dashboard tutorial. Branding tutorial scaffolding is wasted effort. Either it becomes a real product with its own brief, or it stays a reference implementation and is explicitly excluded. **Do not brand it by default.**

**`figmentation` should be formally exempt from kit**, not accidentally outside it. Its whole purpose is CSS experiments (`clinique/styles.module.css`, `theme-tesla-landing.css`). Writing the exemption down prevents a future agent "fixing" it into consistency.

**A structural observation on `proto-lab`.** It already does per-proto theme scoping — `protos/current-memory-visualization/` carries `theme.css`, `theme-b.css`, and `theme-scope.tsx`. That is a working pattern for *multiple themes coexisting in one running app*, which is strictly harder than one theme per app. Whatever tokening scheme the branding programme lands on should be checked against that file, because it is the hardest case already solved.

---

## 8. Recommended sequence

**Phase 0 — fix wiring. No design work. Reversible, uncontroversial.**

1. Move the identical `accent.css` / `gray.css` into `packages/kit/src/styles/`; import from both `cv` and `x-com-chat`. *(Safest possible first commit; proves the pattern.)*
2. Reconcile `baseColor`: pick one (`stone`, per kit) and set it everywhere that consumes kit. `cv` and `figmentation` currently say `neutral` while importing kit's CSS.
3. Verify `x-com-chat`'s `tailwind.css` path — config says `src/theme/theme.css`, tree shows `src/theme/init.css`.
4. Settle the `cva` vs `class-variance-authority` question and record it, so `shadcn add` into kit is repeatable.
5. Adopt one theme-entry filename across all apps. Suggest `src/theme/theme.css`, since three apps are already near it.
6. Confirm whether `packages/fonts` should exist; fix or remove the root `CLAUDE.md` entry either way.

**Phase 1 — collapse the proven duplication.**

7. Repoint `x-com-chat`'s `components.json` `ui` alias at `@ui/kit/components`; delete its local `button`, `toggle`, `toggle-group`. Keep `select`, `sheet`, `sidebar`, `textarea`, `tooltip` local for now.
8. Promote theme provider + mount hook to kit. Leave each app's switcher *UI* local.
9. Decide the icon rule; delete hand-rolled UI icons; keep brand marks per-app.
10. Add the provenance-header convention and backfill it onto anything already ejected.

**Phase 2 — write the rules down.** Into root `CLAUDE.md`, so agents inherit them:

- Promote on the third consumer.
- Kit holds no brand — no hex, no font names, no logos, no copy voice.
- Behaviour → compose. Structure → eject. Never a new kit prop for one app.
- Variant cap, and what to do when you hit it.
- Which apps are exempt (`figmentation`; `space-explorer-api` has no UI).

**Phase 3 — branding, one app at a time.** Per-app: name, wordmark, palette, type pairing, density, motion character, copy voice. None of it in kit. `trophy-sys` is furthest along and should go first as the template for the rest.

---

## 9. A concept worth adopting: the distinctness budget

The unstated risk in "unified stack" is eight apps that are siblings by accident rather than by design. The counter-risk is eight unrelated apps that share nothing but a lockfile.

Give each app **2–3 declared axes** on which it is allowed to deviate, and share the rest:

- `trophy-sys` — type (mono-forward), density (high), one signature component (the character-run progress bar)
- `x-com-chat` — motion, colour temperature, the sidebar
- `cv` — typography and layout rhythm; near-zero chrome
- `proto-lab` — deliberately neutral; the harness should disappear

Written down, this turns "can this app be unique?" from an argument into a lookup. It also gives the coder a principled answer to the question that will otherwise recur every sprint.

---

## 10. Open questions for the session

1. Is `financial` a product or a reference implementation? Everything else about it follows from that answer.
2. Does `trophy-sys` eventually adopt kit primitives while keeping its own compositions, or stay fully independent? Decide the *intent* now; execute later.
3. `cva` beta or `class-variance-authority`?
4. Does `packages/fonts` come back? It matters for per-app typography.
5. Is `space-explorer-ui` worth branding at all, or is it archived-in-place?
6. What is the promotion *ritual*? Who or what notices that a component just gained its third consumer? Without a trigger, "promote on the third" quietly becomes "promote never."

---

## 11. Caveats on this review

- Read-only, from a single tree (`69aaf29c8330`). I did not run the apps, install anything, or execute a build.
- I did **not** read the bodies of every component. Duplication claims for Button, Toggle and ToggleGroup are inferred from filename, location, size band and the shared shadcn generator — not from a line-level diff. **Have the coder confirm with a real diff before deleting anything.**
- The two byte-identical claims (`accent.css`, `gray.css`) *are* certain: identical blob hashes.
- `69aaf29c8330` is a **tree** hash, not a commit sha. Do not cite it as a commit.
- App counts come from `CLAUDE.md`'s registry plus the directory listing; if an app exists but is gitignored, I cannot see it.
- I read no dotfiles beyond what the tree exposed, and nothing outside the repo.
