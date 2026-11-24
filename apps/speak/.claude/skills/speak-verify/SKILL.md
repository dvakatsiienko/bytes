---
name: speak-verify
description: Load BEFORE you verify a change to speak, the voice admin — «verify speak», «check the voice admin», a codie or sixth sense round on `apps/speak/`, an ftr line under speak to flip.
---

# speak-verify

run the app with `speak-run`, copy the settings file (`~/Library/Application Support/speak/config.json`) aside, then run each check below at 1280 wide. every check reads
the page AND the state behind it: a drag or a save is proven by the ranks the page renders and by the file.

## checks

1. **order** — each column's cards follow its chain in the settings file, labelled «1st / 2nd / … in the <lang> chain»,
   then the dashed cards
2. **↓** — ↓ on the first card makes it second; focus stays on its ↓; save enables
3. **mouse drag** — `agent-browser mouse` down on the first card's handle, eight moves to the last chain card's
   bottom, up: the dragged card's label reads the last rank, every other card moved up one
4. **keyboard drag** — focus the first handle, space, ArrowDown, space: that card reads «2nd in the en chain».
   again with esc instead of the last space: the order is back
5. **save** — after one change, save: the status line reads «saved · the daemon loaded it», `diff` of the settings
   file against the copy shows exactly that one change, `git status` stays clean. move it back, save, `cmp`
6. **reject** — `GET /api/config` gives a version; `PUT /api/config` with it and `{"patch":{"chain":{"en":["koko"]}}}`
   answers the daemon's «unknown name «…»» line, an empty body «a save needs the version it edits», a page opened before a hand edit
   «the settings changed since this page read them · reset loads them»; the file `cmp`s equal to a copy taken right before
   each. a worktree:
   the same over a fake daemon's socket (`pnpm admin <socket>`); without one a save answers «a worktree never saves …»
7. **preview** — ▶ on the kokoro card: the status line reads «▶ kokoro · en» and the daemon log gets a
   `first audio: kokoro` line
8. **«i»** — every setting has one (budget, glide, flow, speed, gain); focusing it shows its one line; the
   playback panel's open below the «i», clear of the header
9. **favourites** — open elevenlabs's voice list, ♡ Lily: she moves to the top as ♥; tick «only ♥ favourites»:
   only Lily stays; focus her row, Enter: the button reads «♥ Lily» and holds focus; Esc on a reopened list closes
   it with focus back on the button. save: the diff adds `"favourites": [...]` and the daemon logs «config: loaded»
10. **favicons** — `/speak-32.png` answers 200 image/png; `/../package.json` answers 404
11. **no quota** — while elevenlabs holds under 100 credits, the daemon's probe benches it with no preview needed:
    `{"op":"status"}` on the control socket reads `"no quota"` with the note «<n> of <m> credits left, refills
    <date>»; its badges read «no quota» in the muted colour, ▶ is disabled, the badge's title leads with that note.
    credits back → skip and say so
12. **glide / flow** — type 55 in the pill flow box, save: the settings file reads `meterFlowMs` 55 and the slider sits
    at 55; restore the value
13. **infinite waveform** — toggle it on: a window owned by «x-speak» is on screen (`CGWindowListCopyWindowInfo`)
    and a `screencapture -l` of it shows moving bars across two shots; toggle off: the daemon stops feeding it
    (the pill hides unless its pin is on)
14. **the daemon's scripts** — `pnpm --filter speak daemon:test`: every family's line, from golden to try, reads whole («n/n»). a rollback or a try run on the live mac only on dima's word, announced
15. **the admin's tests** — `pnpm --filter speak test`: green

## essentials

```bash
~/.claude/plugins/cache/x/x/<version>/skills/browser-headless/essentials/run.sh http://127.0.0.1:7386/ --wait '[data-engine]'
```

one line, both widths; clean on main with no allows (2026-09-29). with a voice list open, «covered» names what the
popover sits on — run `essentials.js` alone for that state and read it as expected.

## evidence

- the check lines above, one each, and `errors: 0` from the console
- `essentials: <n> pass · <m> fail`, the baseline fail named as baseline
- `pnpm --filter speak typecheck` and `pnpm --filter speak admin:build`, read by exit code
- the settings file back byte-for-byte
