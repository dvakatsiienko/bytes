# dima-review — trophy-sys shift, 2026-09-28

everything the shift decided without you, and the four questions it researched. each item has options and one ➡️ recommendation. 📌 this file is for the pr review — delete it before the merge, or say «keep» and it moves to `docs/`.

## built as a default — your eye wanted

### 1. journal day rows ([BYT-88](https://linear.app/x-com/issue/BYT-88))

- built: the progress text comes first and the bar holds the row's right edge (0 px to the edge, measured at 1280 and 390)
- built: the filled day band became a rule with the day set into it — `2026.09.25  fri ────── ●1 ●2 ●1  4 trophies` — in the panel's own colour, still sticky
- found on the way: at 390 the progress block squeezed the game title to nothing; the row now drops the progress under the title
- options:
  - a. keep it
  - b. the old filled band with the new tally and weekday in it
- ➡️ a — the rule matches how panel titles sit in their borders

### 2. «now playing» ([BYT-108](https://linear.app/x-com/issue/BYT-108))

- the rule: the title of the newest trophy, when it popped within **7 days** of the archive's last sync (the sync, not the clock: «as of the last sync», so the same archive always names the same title; the daily cron keeps the sync within a day of today)
- where it shows:
  - `▶ <name>` in the accent colour on «unfinished» and «time to platinum»
  - a dashed ring around its effort mark
  - `▶ now playing · <name>` on the /campaign status line, which is the key for the glyph
- options:
  - a. keep 7 days and these three places
  - b. also mark it in /library and /journal
- ➡️ a — the ticket asked for the charts; b is one more pass once you have lived with it

### 3. the 3-day grant warning ([BYT-85](https://linear.app/x-com/issue/BYT-85)) — 📌 one catch

- built as the ticket says: a yellow `[~]` note on /console while the grant has ≤ 3 days left
- the catch: when a grant ends, the server signs in again with the npsso **by itself**. a healthy npsso survives that with no paste. so the warning also shows on a fine token, about 3 days in every 10
- what it is good for: the grant's end is the first moment a token that died quietly (a logout on playstation web) gets found out, so 3 days' notice is real room
- options:
  - a. keep the warning as built
  - b. at ≤ 3 days the server re-mints early from the npsso. a live npsso gets a fresh 10-day grant and the warning disappears by itself; a dead one is caught 3 days early while the old grant still works, and the console shows it
- ➡️ b — it turns a weekly nag into a real check. it touches the auth path (`psn.ts`), so it wants its own small pr and your word

### 4. smaller calls

- **ci gate** — the chromium install step in `.github/workflows/ci.yml` now also fires for trophy-sys, because the chart-layout test runs in a real browser. one jq line
  - options: a. keep the two-name list · b. derive the list from which packages hold a `*.browser.test.*` file
  - ➡️ a — two packages; derive it when a third arrives
- **error reports** — a render error posts to `POST /api/client-error`, which only logs: every field clipped, at most 20 logs a minute per instance, nothing stored. read them with `vercel logs`
  - options: a. keep it · b. drop the server half and log to the browser console only
  - ➡️ a — a console log never reaches you from a production tab
- **a dead token polls** — while psn refuses the npsso, an open tab asks once a minute (paused in a hidden tab), and only a psn-backed success heals the rest, so a paste made anywhere lands with no reload. one psn call a minute per visible tab, only while dead
  - options: a. keep 60 s · b. 5 minutes
  - ➡️ a — it only runs while the app is already broken
- **ignoreBuildErrors** — nothing to remove: #67 took it out of the four next apps and trophy-sys never had it. the build passes. no choice to make

## research — the choice is yours

### 5. refetch misfire ([BYT-88](https://linear.app/x-com/issue/BYT-88))

- why: react-query v5 refetches on `visibilitychange` only (`focusManager.js:17` in the installed 5.103.2; the v5 migration guide says so). a tab visible on the second monitor never fires it — not on a desktop app switch, not on a url-bar click, not while parked. a browser-tab switch does, which is why that one works
- every refetch path: a new observer on stale data (why a route switch works) · the tab becoming visible · the network coming back · a timer · by hand. `staleTime` fetches nothing by itself
- on top of any client fix: the server memo holds an answer up to 60 s, and psn shows a trophy some minutes late (inference, from your «~10 min»)
- options:
  - a. add a window `focus` listener next to `visibilitychange` (~10 lines)
  - b. a 5-minute timer on `games` and `profile`, only while the tab is visible
  - c. both
- ➡️ c — covers all three cases you listed, at most 12 extra calls an hour per open tab. never poll faster than the 60 s server memo

### 6. journal % vs library % ([BYT-88](https://linear.app/x-com/issue/BYT-88))

- why: the library shows psn's `progress`, which weights trophies by grade (the best fit of psn's formula matches 92 of 109 titles, so the app cannot rebuild it). the journal counts trophies. for RL2: 45 % is psn's weighted score, 55 % is the share of trophies. both are right; they answer different questions
- options:
  - a. the journal shows psn's number too — but psn keeps no history, so a past day's «before» figure can never be psn's
  - b. the count is the headline everywhere; psn's figure becomes a small labelled second in the library (`45 % psn`)
  - c. keep both, label both
- ➡️ b — the count is the one number the app can compute for every day

### 7. MGS5, two skus ([BYT-88](https://linear.app/x-com/issue/BYT-88))

- measured on the local api: the trophy row «THE PHANTOM PAIN» (`NPWR08243_00`) matches the small sku, **49 m**. «THE DEFINITIVE EXPERIENCE» (`CUSA05597_00`) is a second, purchased row with **714 h**. no name rule can join them: the bundle name replaces the subtitle
- options:
  - a. an edition merge rule — needs a list of bundle names anyway, so it is c in disguise, plus a risk of merging two real games
  - b. an admin alias in /console — a new key, a new control, a new write route
  - c. an alias table in `playtime.ts`, one line per case, merged the way platform twins already are (~15 lines and a test)
- ➡️ c — one known case does not earn an admin screen; promote to b at the third case

### 8. non-game titles ([BYT-88](https://linear.app/x-com/issue/BYT-88))

- one read-only probe of all 318 entitlements:
  - `conceptId` is null on all 318, so the concept lookup has nothing to look up
  - `isDownloadable`, `isActive`, `isPreOrder` are the same on every row; `membership` only splits ps plus
  - the product id's publisher prefix `IP9100-` marks sony system apps — exactly SHAREfactory and Media Player
  - Headset Companion, Chorus Demo and the Ghost of Tsushima bonus content carry nothing that sets them apart
  - psn-api has no store or concept call; playstation's own store query is unpublished and hash-pinned (inference, not probed)
- options:
  - a. keep the name rule, add the `IP` publisher rule, and let the existing /console hide list cover the rest
  - b. a per-title store lookup through the unpublished query, cached in kv — breaks when sony rotates the hash, and unproven to return a type
  - c. more words in the name rule (`demo`, `bonus content`, `companion`) — the string search you called not ok, and `demo` can claim a real title
- ➡️ a — it adds the one real field the feed has, and one click hides the rest for good
