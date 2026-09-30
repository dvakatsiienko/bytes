---
dies-when: the trophy-sys redesign (BYT-86) writes its map.md and design brief — what is still true moves there, then this file goes
---
Ticket: BYT-86

> the first Claude Design exploration of the trophy-sys redesign (2026-09-05/06), kept as prior art for the redesign's shape pass and designer interview. moved from `apps/trophy-sys/DESIGN-REQUEST.md`; nothing edited below this line.

# DESIGN.md — trophy-sys redesign brief

**Purpose of this file.** Carry-forward context for a fresh Claude Design thread. Everything here is already established — do not re-ask it. Read this, then read the steer that accompanies it, and start designing.

**Status:** exploration done, direction not chosen. Three Library directions were built and are being set aside; the approach is being reconsidered with better inputs. Treat the built work as evidence about the problem, not as a starting point to iterate on.

**Repo:** `dvakatsiienko/bytes`, branch `main`, app at `apps/trophy-sys`. Scope reads to that subtree — the monorepo root returns nine other apps and wastes context.

---

## 1. The product

**TROPHY.SYS** — a PlayStation Network trophy tracker. Personal project, deployed at `trophy-sys.vercel.app`, not in production use by anyone else yet. Audience answer given: **"public someday."**

**Stack:** Vite + React 19 + Tailwind v4, TanStack Router (real paths, not search params), TanStack Query. API is plain `node:http` locally, the same handler as a Vercel function in production. `src/shared/types.ts` is the contract.

**Three routes.**

- `/library` — two-pane: the whole PSN library on the left, the selected game's trophy set on the right. Sort by last played / name / playtime; a platinum filter mode. Deep-linked as `/library/$gameId`.
- `/stats` — eleven visx charts plus a KPI strip, all from one `/api/stats` payload.
- `/log` — every earned trophy, newest first, grouped by day. A day runs to 05:00, so a past-midnight trophy stays with the evening it came from.

**Real numbers to design against:** 109 titles synced · 2 126 trophies · level 301, tier 4, 8% to next · 34 platinum / 171 gold / 434 silver / 1 487 bronze · 79 titles played · 61% average completion.

**Features are fixed.** This is a UI expression problem, not a product problem. Do not propose new features.

---

## 2. The brief, as answered

| Question | Answer |
| --- | --- |
| Depth of redesign | **Everything but the feature set** — including navigation and information architecture |
| What must survive | **Nothing.** All of it explicitly up for grabs |
| Themes | **Both, equal weight** — light is not an afterthought |
| First screen | **Library** |
| Density | **As now** (mid-point; the current density is not the complaint) |
| Audience | Public someday |
| Charts ambition | **Make them legible** — same charts, proper colour scale and hierarchy. Not a chart cull, not an editorial rethink |
| References | *"i like x-com vibe, aliens, space, hi tech, games, simplicity, minimalism, not screaming gradients. simpler - better. smaller - better (mostly)."* |
| What annoys him in use | *"too screaming design looks that tries to sell no matter what, old crap archaic looks and tech, bad ux"* |

**Critical clarification he issued mid-build, which resolves an apparent contradiction:**

> "i mean crappy legacy designs. opus created genuinely cool crt effect for sline. correction: hi quality, thoughtful retro = good. crap retro legacy - not good."

So: **retro is not the enemy. Unconsidered retro is.** A CRT effect done with craft is a feature. A DOS pastiche worn as a costume is not. The current app is the latter drifting toward the former, and he can tell the difference — his own `sline` statusline is the reference for retro done well.

---

## 3. Current design, and what is actually wrong with it

**Present look:** a DOS terminal. Gruvbox-material palette matched to his `sline` statusline. JetBrains Mono for the entire app. Progress bars are `█`/`░` character runs. CRT scanlines. Every region is a `.panel` — a 1px box whose uppercase label sits absolutely positioned *outside* the top border.

**Diagnosed problems, in order of importance:**

1. **Orange does every job at once.** Headings, values, progress fills, chart series, active tab, rarity bars, the level number. Nothing can be emphasised because everything is. This is the complaint he led with.
2. **The palette cannot spend hues — and this is the root cause, not a taste issue.** His own `chart-theme.ts` records: gruvbox-material "carries two categorical series, not six"; its purple and blue sit **ΔE 1.5 apart under deuteranopia**, measured with a dataviz validator. A palette that cannot carry categories forces one hue to carry everything. Fixing the symptom without widening the gamut will not work.
3. **Light theme is a naive inversion.** Gruvbox light is not the dark palette flipped. `#c35e0a` orange on `#fbf1c7` beige does not hold — this is the specific failure he named. Light accents need to go substantially darker, not merely swap.
4. **Charts inherit the brand colour** instead of having a purpose-built scale. The rarity-tier bars are the one place a real scale exists and are the best-reading chart on the page.
5. **Trophy grade is semantic, ordered data with natural colours** (platinum / gold / silver / bronze) and that structure is under-used.

---

## 4. Decisions already made — and which are *his*, from source

Three of these are lifted from comments in his own code, not invented. They should be treated as settled, and citing them back is how to earn trust quickly.

**From `src/web/helpers/format.ts`:**

- **Progress has exactly two states**, under way and complete. His comment: the three-colour version "had to be explained to be read."
- **A metre cannot answer "how far along" and "did you platinum" at once.** Platinum is carried by a `◆` beside the title, never by the progress colour.

**From `src/web/helpers/chart-theme.ts`:**

- **Colour is never the only cue.** The one two-colour split (platinum vs the rest) also carries a shape.
- **Many things separate by one hue at several strengths, or by position** — never a hue per item.
- **No chart has two y axes.**
- A single-hue ordinal ramp for the five rarity tiers **was tried and rejected on sight (2026-09-04)**: it validated on contrast but read worse than hues. Five bands is few enough that identity beats magnitude. *(Useful signal: he judges by eye and overrides validators.)*

**Added during exploration, open to challenge:**

- **Grade is the only thing allowed to spend colour.** The accent does interaction only.
- **Mono for numerals only**, not as body text. Mono-everything is the archaic tell.
- **Real DOM progress bars** instead of `█`/`░` character runs. *This is a genuine departure from his code and he has not ratified it.*

---

## 5. What was built, and what it taught

Three full Library screens, dark and light, on one canvas — `Library Redesign.dc.html` in the previous thread. Typefaces and accents were chosen by RNG from candidate sets to avoid defaulting.

**1a Tactical** — Saira + Chivo Mono, hazard amber `#ffb340`, slate-black `#0e1116`. X-COM console: angular, near-black, chrome recedes, one honest 3px-pitch scanline at 6% opacity in dark only. Amber appears exactly four times on the screen. Grade is a small solid square when earned, outlined when not.

**1b Observatory** — Schibsted Grotesk + Spline Sans Mono, xenon violet `#a68cff`, warm graphite `#121110`. Restraint as the argument: no cover tiles, no chips, no boxes. Progress is a hairline under each row rather than a column. The four grade colours appear exactly once, in a single stacked bar.

**1c Manifest** — Familjen Grotesk + Martian Mono, sodium orange `#ff7a45`. The IA move: the two-pane split is dropped, the library becomes a sortable table with count-bearing filter chips (All / Platinumed 34 / Under way 45 / Untouched 30), and the game detail leaves for its own page. Real cost: comparing two games now requires navigation.

**Unresolved at the point of setting this aside:**

- Whether the answer is one direction or a graft. 1a's frame with 1b's rows is plausible.
- Whether 1c's table is worth losing side-by-side detail — a usage question only he can answer.
- Whether `barRender`'s character bars should genuinely die.

**Candidate pools used, if a fresh roll is wanted:** display — Saira, Schibsted Grotesk, Familjen Grotesk, Archivo, Chivo, Space Grotesk, Barlow Condensed, Oxanium, Sora, Public Sans, Instrument Sans, Anybody, Syne, Bricolage Grotesque. Mono — Chivo Mono, Spline Sans Mono, Martian Mono, IBM Plex Mono, Space Mono, DM Mono, Azeret Mono, Geist Mono, Sometype Mono.

---

## 6. Data realities that must shape the design

Edge cases are not garnish here; they are most of the library.

- **Playtime is missing for ~13% of titles.** PSN serves playtime from a separate endpoint keyed by `titleId` while trophies are keyed by `npCommunicationId`, and nothing bridges them — the join is on **name** and is lossy by design (94 of 108 when measured). A `—` means the join missed, **not** that the title was never played. The current UI explains this in a hover hint. **Any design must have a considered empty state for this, not a blank cell.**
- **Two different "last played" values exist.** `lastPlayedAt` is when trophy data last changed; `playedAt` is the true last-played time and is `null` when the join missed.
- **~30 of 109 titles are at 0%** — untouched. A library view dominated by empty bars is the normal case, not the exception.
- **Dead platforms are present:** PS3, PSVITA, PSPC alongside PS4/PS5. Current UI inverts PSN's own convention so the current generation reads first: PS5 filled, PS4 outlined, dead platforms muted.
- **Progress trophies ("collect 30 relics") show live counters — PS5 only**, because that is the only place PSN counts. Example: `96 935 / 100 000`.
- **Cover art is a remote PSN `iconUrl`**, not a repo asset — nothing to import, and it is inconsistent: PSN serves square 512² art for some titles and a 320×176 banner for others. The current code uses `object-contain`, not `cover`, because `cover` cuts ~45% off every banner. **Any design using cover art must survive both aspect ratios.**
- **A game's trophies split into groups** — base game, then each DLC pack — each with its own completion figure. Titles with one group render flat.
- **`rarity` is a global PSN earn rate as a percent**, not PSNProfiles' member rate. The tier boundaries differ from that site's, deliberately.

---

## 7. Working notes — how he operates

- **He judges by eye and will override a validator.** The rejected ordinal ramp passed contrast and lost anyway.
- **He gives corrections as precise deltas, not rewrites.** Take them literally and narrowly.
- **He notices dead controls.** A tweak that renders nothing will be found.
- **His code comments are the best available design documentation.** They record what was measured, what broke, and what he rejected. Read them before proposing anything.
- **"smaller - better (mostly)"** — the parenthetical is doing work. Restraint by default, not asceticism as dogma.
- Chrome is deliberately unselectable (`user-select: none` on body); only real names — game titles, trophy names, group names — opt back in. Preserve that intent.
- He works in Claude Code alongside this, with a coordinator/coder split. Designs should be handoff-ready: tokens and annotated reference screens, not vibes.

---

## 8. Constraints

- **Fluid, not fixed.** This is an app, viewed at the preview pane's width. `max-width`, wrapping grid tracks, no fixed heights on text boxes.
- **Both themes, designed together.** Light is a first-class deliverable and the current light theme is the sharpest existing failure.
- **Reduced motion must be honoured** — the current app does it globally in CSS, not per-library.
- **Tailwind v4 token indirection.** `@theme` bakes values at build time, so runtime theme swapping goes through raw `--p-*` variables mapped by `@theme inline`. Any token scheme has to survive that mechanism.
- **visx charts take colour as prop strings** and cannot use Tailwind classes, which is why all chart ink lives in one file. A palette proposal must include the chart scale explicitly, not leave it to be derived.
- Grid items need `min-w-0` or wide charts stretch the page — a lesson already paid for.

---

## 9. Source files worth reading first

In this order, for a fresh thread:

1. `apps/trophy-sys/CLAUDE.md` — the design rationale and six hard-won lessons
2. `src/web/theme.css` — both palettes, the token indirection, the panel system
3. `src/web/helpers/chart-theme.ts` — all chart ink and the measurements behind it
4. `src/web/helpers/format.ts` — `barRender`, `progressTone`, `GRADE_MARK`, the playtime dash
5. `src/shared/types.ts` — the real data shapes
6. `src/web/library.tsx`, `components/game-list.tsx`, `components/game-panel.tsx` — the Library composition
7. `src/web/stats.tsx` and `src/web/charts/` — only when moving on to `/stats`

---

## 10. Still open

- **Which direction, or which graft.** The one blocking decision.
- **Which screen is the app.** If `/stats` is opened 80% of the time, the Library is a menu and was the wrong thing to design first.
- **What he actually does here** — hunt the next platinum, check what popped overnight, or admire the collection. The Library's shape depends entirely on this, and it is the question that separates 1a from 1c.
- **Whether the character-run progress bars die.** A real departure from his code, unratified.
- **Whether `trophy-sys` adopts `packages/kit` primitives.** See the companion architecture review; it affects what a design can assume exists. Resolved in Linear BYT-25 (design system unification) before the build starts — design the screens, not the kit; the coder maps them onto whatever the kit decision produces.
- **Brand identity.** The app has a name and a `.sys` suffix and nothing else — no wordmark, no favicon beyond a default, no defined voice. If branding is in scope, that is a separate deliverable from the UI redesign.
