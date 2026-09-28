# trophy-sys

The owner's PlayStation trophy tracker: his owned library, every trophy he has earned, and the charts and journal read from them, kept alive by one token he renews by hand.

## Language

### signing in to PSN

**NPSSO**:
The 64-character token the owner copies from Sony while signed in, and the one secret the app cannot renew itself.
_Avoid_: token (alone), cookie, sso code

**Grant**:
The refresh grant one NPSSO exchange buys: ten days of sessions without spending the NPSSO again. At three days left it is re-minted from the NPSSO while it still works, so a dead NPSSO is found early.
_Avoid_: refresh token, session (for the grant)

**Session**:
One short-lived PSN access, rebuilt from the grant, or from the NPSSO when no grant is held.
_Avoid_: login, auth

**Paste**:
The owner putting a fresh NPSSO into the console; the only way a dead one is replaced.
_Avoid_: renewal (for the act), upload

**Death**:
The moment PSN first refuses an NPSSO or a grant, recorded once so its lifetime can be measured.
_Avoid_: expiry (a death is observed, an expiry would be published)

**Lifetime**:
How long an NPSSO lived from its paste to its death; only a token that died in use has one.
_Avoid_: TTL, validity

**Seed**:
An NPSSO given to a deploy through its environment, used only until the first paste.
_Avoid_: fallback, default token

### the library

**Library**:
Every title the owner owns on PS4 and PS5, played or not.
_Avoid_: collection, games list, played list

**Title**:
One entry in the library; usually a game, sometimes a soundtrack, an artbook or an app.
_Avoid_: game (for any entry), product

**Entitlement**:
A purchase record from PSN; the source of the unplayed half of the library.
_Avoid_: purchase, license

**Non-game**:
A title the auto-hide rule claims by its name, such as a soundtrack or an artbook, or by Sony's system-app publisher prefix (`IP9100-`), such as SHAREfactory.
_Avoid_: junk, DLC

**Hidden**:
A title the owner does not want to see anywhere: gone from the library, the charts and every count.
_Avoid_: excluded, archived, deleted

**Auto-hide rule**:
The default that hides a non-game with nothing written for it; one press in the console overrules it for good.
_Avoid_: filter, blocklist

### trophies over time

**Archive**:
Every trophy the owner has earned, with its moment, plus the ones still missing from titles under way.
_Avoid_: history, stats (for the archive itself)

**Baseline**:
The trophies already seen at the last snapshot, so the next read can tell what is new.
_Avoid_: state, cache

**Snapshot**:
The owner's explicit «remember this as seen»; the only thing that moves the baseline.
_Avoid_: sync (a sync refreshes the archive, a snapshot moves the baseline)

**News**:
The trophies earned since the baseline.
_Avoid_: feed, recent

**Gaming day**:
A day that ends at 05:00, not at midnight, so a late session counts as the evening it began in.
_Avoid_: calendar day (the heatmap's day), date

**Progress**:
PSN's own figure for a title, weighted by trophy grade — not the share of trophies earned. Shown only as a small second in /library, labelled `psn`.
_Avoid_: completion, percent done

**Completion**:
Trophies earned of trophies defined, floored to a whole percent — the figure every view leads with.
_Avoid_: progress (that is PSN's weighted figure), percent done

**Now playing**:
The title of the newest trophy inside the sync window.
_Avoid_: current game, active title

### the places

**Campaign**:
The page of charts over the whole archive.
_Avoid_: stats page, dashboard

**Journal**:
The archive told day by day, newest first.
_Avoid_: log, diary, timeline

**Console**:
The owner's admin page: paste an NPSSO, hide titles, flip a setting. It must work while PSN is refusing everything.
_Avoid_: admin panel, settings page
