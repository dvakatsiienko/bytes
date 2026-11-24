# speak — feature map

- 🧭 asked, not built yet · ⬜ built, not checked yet · 🐞 built, its check fails · ✅ passes in `speak-verify` · 🔎 dima used it and it holds
- given/when/then lines are sixth sense's exit lines
- makes: lines name what a feature leaves behind
- decision: lines record a choice and its reason

## every control — the page and the pill

- 🧭 every icon-only control names itself on hover and on keyboard focus, and to a screen reader
  - given an icon-only control (close, volume, speed, pause, stop, stick) on the page or the pill
  - when the pointer rests on it, or Tab lands on it
  - then a short hint shows its name and its key («pause ⇧F4»), and VoiceOver reads the same name
  - decision: app-wide, not per control (dima, 2026-10-01: «hover also has to be present across the app (a11y)»); the look is the merge canvas board «T1 merge · pill · hover tooltips»

## / — voices

> states: all live, the big card plays, unsaved edits, a rejected save, no key, «set key» open, benched (no quota), a chain of one, the sample line edited, the daemon down, night, wide 1728 / standard 1440 / narrow 900, the speechify card, the Siri favourite mark

- ✅ one column per language, in the order english, українська, русский
  - decision: the order is dima's; it lives in an array so a key sort cannot reorder it
- ✅ a chain card per engine, in the order the daemon tries them
  - given a language's chain in the settings file
  - when the page loads
  - then its cards show in that order, each labelled «1st / 2nd / … in the <lang> chain», and the engines outside the chain follow as dashed cards
- ✅ a toggle puts an engine in or out of a chain
  - given an engine outside the en chain
  - when the user ticks «in the en chain»
  - then its card joins the end of the chain with its voice, speed and gain controls
- ✅ ↑ / ↓ move a card one place
  - when the user presses ↓ on the first card
  - then it becomes the second card, and focus stays on its ↓
- ✅ a card drags to a new place in its chain
  - given the chain elevenlabs, kokoro, macOS voice
  - when the user drags elevenlabs's handle onto the macOS voice card
  - then the chain reads kokoro, macOS voice, elevenlabs
  - decision: the handle is also a keyboard drag (space, arrows, space; esc cancels); ↑ / ↓ stay for one-press moves
- ✅ a voice per engine and language
  - given the macOS voice card
  - then its list holds only installed female voices of that language, «Spoken Content voice (Siri)» for en, «best installed» for uk and ru
- ✅ a ♥ on each voice marks it a favourite, per engine
  - makes: a `favourites` list per engine in the settings file
  - given the voice list of a card is open
  - when the user presses ♡ beside a voice
  - then it turns ♥ and the voice moves to the top of that engine's list in every language
  - and it is saved at once, outside the save button: pending edits stay unsaved, and save does not light up
  - and two quick ♥ both land, and a slider moved meanwhile stays where it is
  - decision: a ♥ is a bookmark, not a setting — dima wants it kept the moment he clicks
- ✅ «only ♥ favourites» filters a voice list to the favourites
  - given an engine with at least one favourite
  - when the user ticks «only ♥ favourites»
  - then only the favourites stay in the list; with none, the filter is disabled
- ✅ a voice list opens as a popover and closes on a pick, on Esc, or on a click outside
  - then focus returns to the voice button, which shows ♥ before a favourite
- ✅ speed and gain sliders per engine, shared by every language
  - decision: the macOS voice has no gain — its synthesizer cannot go above its own level
- 🔎 an «i» beside every setting explains it in one line: what it does, which way to move it, a value to try
  - when the user hovers or focuses the «i» beside pill flow
  - then «how fast the wave travels outward. too fast → raise it first. try 70» shows, below the «i»
- ✅ ▶ previews a card through the daemon
  - given x-speak is running
  - when the user presses ▶ on a card
  - then the daemon speaks the column's sample line with that card's unsaved settings, and the status line reads «▶ <engine> · <lang>»
- ✅ while a card plays, its ▶ becomes ⏸ and ■
  - given a card's preview is speaking
  - when the user presses ⏸
  - then the speech pauses and the button reads ▶ (resume); ■ stops it, and the card shows ▶ again
  - the controls also return to ▶ when the speech ends on its own, when it never starts, and when another read takes over: the card plays exactly while the daemon names its read
- ✅ a sample line per language, editable
- ✅ a status badge per engine: live, benched until a time, no key, or no quota
- 🧭 each provider card expresses its provider, and the controls read as part of the app
  - decision: dima, 2026-09-30 — «each card to represent the provider in a beautiful and expressive way»; the cards read heavy and the controls disconnected today. sharpened into given/when/then at the designer's pick
- ✅ an engine out of quota locks its ▶ and says so on the card
  - given the daemon's quota probe finds elevenlabs under 100 credits — at daemon start, on a status older than 10 min, or right after a refused request
  - when the page shows its cards
  - then each elevenlabs card's badge reads «no quota» in a quiet colour and its ▶ is disabled
  - and hovering the badge shows «<n> of <m> credits left, refills <date> — the chain skips it until then»
  - and the daemon benches it until that refill date, so a press never waits on its refusal
  - given fish runs a paid model and its api balance is $0 → fish reads «no quota» the same way, benched for an hour
  - decision: quiet, not red — the chain already skips it; dima found the red line «a bit too much» (2026-09-29)
  - given the provider refuses a sentence over its balance, with credits left (150 for a sentence of 203), then the engine sits out an hour, and the badge keeps the provider's words while the balance stays the same
  - and the state clears when the probe sees more credits than at the refusal, when the refill date passed, or after the engine's next success
  - decision: the chain already falls through on a quota refusal; the card only has to make it visible (dima, 2026-09-29)
- ✅ the header shows the daemon's accessibility state and whether it is speaking
- 🔎 «infinite waveform» plays the pill's wave with no voice, to tune glide and flow by eye
  - given the playback panel under the header
  - when the user turns on infinite waveform
  - then the pill shows and animates speech-shaped levels, following the unsaved glide and flow as they change
  - and it stops when turned off, when the tab closes, when a real read starts, or after 5 minutes without an update
  - given only the waveform runs, then the pill's ▶ stays dim: nothing plays
  - given a read plays, when the user turns it on, then it does not start, the status line says why, and the read keeps its pill
- 🔎 «pill glide» and «pill flow» tune the pill's wave, each a slider and a number box in ms
  - makes: `meterGlideMs` and `meterFlowMs` in the settings file
  - given the settings row under the header
  - when the user types 55 in the pill flow box and saves
  - then the settings file reads meterFlowMs 55, the slider moves to 55, and the daemon reloads
  - glide: how long a bar takes to reach a new level (0 jumps). flow: how long the wave holds before moving one bar outward
  - decision: a slider, not a fixed number — dima tuned it by feel over six rounds (70 → 1 ms)
- ✅ ■ stop ends any speech
- ⬜ a voice that hangs or breaks off hands over once, and no sentence is read twice
  - given kokoro, or a cloud voice that began the read, answers nothing while nothing plays, then after 3 s the next voice of the chain reads the sentence, a cloud one on what its sentence has left of the first audio budget (kokoro gets more for a sentence over 300 characters); the last of a chain is waited for
  - given a cloud voice refuses one sentence (a 400 or a 422), or answers it with no sound, then the next voice reads that sentence, and the next one asks it again
  - given gemini sits before another voice in a chain and has no sound within the first audio budget, then that voice reads the sentence, as for every cloud voice
  - given a voice breaks off in the middle of a sentence, then the read goes on with the next sentence, and no other voice starts that one again
  - given the daemon's main thread stuck for over a minute, then `status` no longer says speaking, so relaunch, rollback and try are open
- ⬜ the first audio budget, in ms, 100 to 3000
  - given the budget reads 900
  - when the user clears its box, or types 0
  - then the setting stays 900, and the box reads 900 again when the caret leaves it
- ⬜ a number the daemon refuses cannot be set in the page: the sliders and boxes take their ranges and defaults from `contract/config.schema.json`
  - given the speed slider
  - then it runs from 0.5 to 3, as the daemon does

- ⬜ the logo goes home without a reload
  - given the page scrolled down, with an unsaved edit
  - when the user clicks the speak logo, top-left
  - then the page scrolls to the top, the url drops its #column, and the edit is still there; under reduced motion the jump is instant

## keys and settings

> states: the settings popover open, the waveform switcher

- 🧭 a key typed in the admin is stored in the macOS keychain, never in config.json; when the keychain and 1password both hold one, the keychain wins (dima, 2026-10-01)
- 🧭 one waveform setting (bars by default; thin, wide, dots, curve, blocks) draws every card and the pill
  - makes: a `waveform` key in config.json

## stats — the quick view

> states: the week strip in the save bar, the week hover, the per-app hover, the cut hover, the detail on click

- 🧭 every read leaves one record
  - makes: `~/.local/share/x-speak/reads.jsonl`, one line per read: time, source app, words, characters the normalizer cut, seconds listened, engine
  - given a read that plays to its end, or is stopped by F5 or a new F4
  - then one line lands with the seconds actually heard
  - decision: every stat derives from this one record, nothing is stored twice (shape-lite, 2026-10-01)
- 🧭 one compact quick view shows the stats in the admin
  - given a week of records
  - when the admin loads
  - then one compact view shows: minutes listened, reading time saved, the top source apps, and what the normalizer cut — as kinds and counts, never real text (dima, 2026-10-01)
  - and hovering a figure may open a popover with its detail
  - decision: compact, one view, no dashboard and no stats page yet; peak hours dropped (dima, 2026-10-01: «let's try compact without breeding a lot of additional views»)
- 🧭 reading time saved = words heard ÷ 238 wpm
  - decision: 238 wpm is the default silent reading speed (Brysbaert 2019, unchecked); a one-time «measure me» is later, not in the cut

## save

> states: clean, unsaved (save lit), rejected

- ⬜ save writes the settings file
  - makes: `~/Library/Application Support/speak/config.json`, in biome's own format with its keys sorted; bytes stays clean
  - given an unsaved change
  - when the user presses save
  - then the file changes by exactly that edit, and the status line reads «saved · the daemon loaded it»
- ⬜ the daemon writes the settings file, and a save lands whole or not at all
  - given a save the daemon refuses, one that names no change, or one over settings that changed since
  - then the file keeps every byte and the reply says why
  - given an accepted save
  - then the file's diff is that change only, a key the daemon does not read stays, and the log line «config: saved …» names the keys
- ⬜ a page left open never writes over newer settings
  - given the settings changed since the page read them: a hand edit, a save or a ♥ from another tab
  - when the page saves
  - then the status line reads «rejected — the settings changed since this page read them · reset loads them» and the file keeps every byte
- ⬜ a request that fails says why
  - given the admin server is down
  - when the user presses save, ♥, ▶, ⏸ or ■
  - then the status line reads «the admin server is not answering — …», and an unsaved edit stays
  - given the settings file cannot be read when the page opens
  - then the page shows the daemon's reason in place of the columns
- ✅ reset drops every unsaved edit
  - given an unsaved change
  - when the user presses reset
  - then the page shows the settings as they are on disk now, save and reset disable, and nothing is written
- ✅ a rejected save shows the daemon's own line
  - given a config the daemon cannot read
  - when it is saved
  - then the status line reads «rejected — config.json: unknown name «…» …» and the daemon keeps its last good config

- ✅ only the admin page can write: another web page's request is refused
  - given a POST or PUT to the api without `content-type: application/json`
  - then the server answers 415, nothing is saved and the daemon hears nothing
  - given a request under a name that is not this mac's own (a page that points its name at 127.0.0.1)
  - then the server answers 403 and the daemon hears nothing
- ⬜ a worktree's server plays but never saves
  - given the admin started from a worktree with no socket of its own
  - when the page saves or hearts
  - then the status line reads «… a worktree never saves the live settings …»

## x-speak — hotkey + pill

> states: reading, the word highlight, paused, idle with stick on, a long line, fell through to the next engine, the code block cue, hover tooltips, the volume popover, the speed popover, on a light and a dark desktop

- ✅ F4 reads the selected text aloud, cutting off whatever plays
  - given text selected in any app
  - when the user presses F4
  - then the daemon speaks it through the chain for its language, and the pill shows
  - given two presses before the first one's selection came, then one read starts, the newer one's
  - and a read already playing stops before the new one's first audio, on every engine, with a clean hand-off: no stumble, no second voice
  - decision: Slack grabs with ⌘C, never accessibility — its focused element is the empty message box, not the selection (36 «nothing selected» presses, 2026-10-01); a read costs ~20–50 ms, F4-to-pause with nothing selected waits 300 ms there
  - decision: an empty accessibility answer means «nothing selected» only while something plays (F4 = pause, no wait); idle, F4 tries ⌘C — a selection inside a page's canvas or frame is not the focused element's (Chrome on a claude.ai artifact, 2026-10-01)
- ⬜ F4 with nothing selected pauses, then resumes
  - given speech playing and no text selected
  - when the user presses F4
  - then the speech pauses; F4 again resumes it where it stopped
- ⬜ ⇧F4 pauses, then resumes, whatever is selected
  - given speech playing
  - when the user presses ⇧F4
  - then the speech pauses and the pill's button reads ▶; ⇧F4 again resumes it where it stopped
  - and nothing sounds until the resume, on any engine, whatever chunk arrives meanwhile; a pause before the first sound holds too
  - decision: pause has two doors — F4 on an empty selection and ⇧F4 always — so a selection left on screen never blocks a pause (dima, 2026-09-30)
- ⬜ the control socket's `read` reads a given text the way F4 reads a selection
  - given the daemon runs
  - when a client sends `{"op":"read","text":"…"}` to `~/.local/share/x-speak/control.sock`
  - then the text plays through the chain for its language, cutting off whatever plays; `pause` and `stop` act on it as on any read
  - decision: a door for text no selection reaches — a mod's pane text can't be selected on the desktop ([claude-code#101090](https://github.com/anthropics/claude-code/issues/101090)), so x-mod-stash orbit's 🔊 sends its ask here (FRM-381)
- ✅ F5 stops the speech
  - given a read playing on any engine
  - when the user presses F5
  - then every voice goes silent at once, and none keeps talking
  - given an F4 whose selection is still being fetched, when the user presses F5, then no read starts
- ✅ tech text reads as words: a path says its last part, ids are cut
  - given selected text holding a path, a file link, a pid, a git hash or a long id
  - when the user presses F4
  - then the voice says «exa dot md» for `docs/test-drive/exa.md`, «a markdown file link», «pid», «a commit», «an id» — never a full path or the digits
- ✅ selected lines read as sentences
  - given several selected lines with no end punctuation
  - when the user presses F4
  - then each line ends with a short pause, never one run-on sentence
  - and a numbered line says its number first («one: merge»), even when the app hands its lines over glued together
  - and list markers («■», «•», «★») are never spoken; a bulleted item glued to the one above on an opening «/“ still gets its pause
- ⬜ the pill floats while speech plays: its wave, ⏸ / ▶, ■, stick and close
  - then the ⏸ / ▶ button follows the speech, and the pill never takes focus from the app in front
  - and paused, the wave keeps its last shape in grey and the sentence line takes the same grey, the held word on its pad; only stopped is the wave flat (dima, 2026-10-01, merge v1.14)
- ⬜ the mac voice can play through the one audio output, like every other voice
  - given `"oneOutput": true` under `engines.system` in the settings file, when the mac voice reads, then it plays through the audio engine: its wave runs on the pill, its gain counts, and it starts no gap after the sentence before
  - given the key is absent or false, then macos plays it itself, as before; `status` says which in `macVoice`: «player» or «synth»
  - decision: the old way out stays until dima's ear says the Spoken Content voice sounds the same
- ⬜ the pill drags anywhere and keeps its spot per display
  - given the pill dragged on one display
  - when speech next plays on that display
  - then the pill opens at the same spot; a display it never sat on gets bottom centre, above the dock
- ⬜ stick keeps the pill up after speech ends; unstick lets it go
- 🧭 the pill's volume and speed icons open a slider and a number box
  - given the pill showing
  - when the user clicks its volume or its speed icon
  - then a slider and a number box open; a typed value applies on Enter; ↑ / ↓ step by 1, ⇧ by 4, ⌥ fine
  - and the next F4 keeps the value
  - decision: two icons, not a panel — the pill stays a pill (dima, 2026-09-30 re-shape)
  - decision: the volume is a master level, a config key on top of each engine's gain (dima, 2026-10-01)
- 🧭 the pill shows the sentence being read, the spoken word lit, in step with the audio
  - given speech playing through kokoro, elevenlabs or the macOS voice
  - then the pill shows the current sentence with the spoken word lit, in step with the audio
  - decision: timings come from the engines — kokoro's word timestamps (mlx-audio drops them today), elevenlabs' stream/with-timestamps, the macOS voice's willSpeakWord; whisper alignment only as a last resort (the highlight research, 2026-09-30)
  - decision: the line shows the normalized text, so the lit word matches what is heard; an engine without word timings (kokoro today) gets a char-proportional estimate (dima, 2026-10-01)
- 🧭 in native apps the spoken word gets a click-through highlight over the source text — an experiment
  - given text read from TextEdit, Notes or Safari
  - then the spoken word gets a click-through overlay over the source text
  - and where the app gives no text bounds, nothing draws and the pill carries it
  - decision: an experiment — dima «I often follow a text that is read aloud and read myself in parallel»; dropped if it does not land. terminals, pdf and chrome-by-default are out

## scripts

- ✅ `x-speak-admin` (launchd, always on) serves the built page and the api on 127.0.0.1:7386; `pnpm --filter speak admin` runs the same server by hand when the job is stopped
- ✅ `pnpm dev:speak` runs vite on 7387, proxying /api to 7386
- ✅ `pnpm --filter speak admin:build` builds `dist/`
- ✅ `pnpm --filter speak test` runs the admin server's tests over a fake daemon: the write guard, the host, the page folder's jail, each route, the page's requests and its draft
- ✅ `pnpm --filter speak daemon:build` installs the signed daemon to `~/.local/libexec/x-speak/x-speak`, with no launchd change
  - makes: `~/.local/libexec/x-speak/x-speak`, signed «x-speak local signing»
  - given no settings file at its place, or a change in the old file since the move, then it refuses in one line and installs nothing
- ⬜ `apps/speak/script/settings-move.sh <sha256>` copies the settings out of the tracked tree
  - makes: the settings file, and `config.json.moved-from` beside it (the old path and its hash)
  - given the file the launchd job names has that hash, when it runs, then the copy has it too and the old file is untouched
  - given a change the old file got since, when it runs with that file's hash, then the change is brought and the settings it went over are kept as `config.json.before-move`; with `seen` nothing is copied
  - given another hash, a copy that differs, or settings there with a change of their own, then it refuses in one line and nothing moves
- ⬜ `pnpm --filter speak daemon:relaunch` restarts the launchd job onto the installed binary, and refuses while the daemon is speaking
  - given no settings at their place, or a change in the old file since they moved that nobody brought, then it refuses in one line, names the way, and stops nothing
- ✅ `pnpm speak:rollback` (`daemon:rollback`) puts back the daemon the last build replaced and starts it; a second run comes forward again
  - makes: `~/.local/libexec/x-speak/x-speak.prev`, kept by each build from the binary that was running (the installed one, when nothing is kept yet)
  - given a build that was relaunched, when the rollback runs, then the daemon that ran before it answers `status`, named by its hash, with its settings and config argument held against the ones it ran with at the build
  - given a kept daemon from before the settings moved, then the file its argument names gets today's settings, only while it is as the move left it; changed since, the rollback refuses before anything moves
  - given nothing kept, a kept binary with another signature, a daemon reading aloud, or another build or rollback running, then it refuses in one line and the binaries stay as they were
- ✅ `pnpm speak:try "<text>"` (`daemon:try`) speaks one text with this tree's daemon, built beside the live one
  - makes: `daemon/build/x-speak-try`, in the tree
  - given the live daemon quiet, when it runs, then the text is heard with this mac's live settings (the tracked seed, when it has none), and the live daemon answers `status` before and after and keeps its keys
  - given the live daemon reading aloud, then it refuses in one line; given a live read that starts while it speaks, then it goes quiet within about a second
  - given no text, an empty one or one that opens with a dash, then it refuses in one line and starts nothing
  - decision: it is handed no cloud keys and never starts the kokoro server; with no kokoro running, the chain goes on to its next engine — a server started by a process that leaves would be nobody's, and the keys are the live daemon's (run on the built binary with kokoro's port denied by a sandbox; the macOS voice's sound after it was not heard)
- ✅ `pnpm --filter speak daemon:test` runs the daemon's tests on the mac: the normalizer's golden cases, the argv parser, the settings' schema and store, the read path's rules, the presses, the socket's ops, the pill and the meter, the core's imports, the module-level values, the places named outside `core/paths.swift`, the build's way back and the try run on stubs, after a typecheck of the whole daemon
- ⬜ x-speak takes `--config <config.json>` (a one-shot's settings; the daemon's have one place) and `--keys-run <script>`
  - given the daemon started with `--config <path>` alone
  - then it stays up as the daemon, logs «config: loaded <the full path>» with each engine's voices, speed and gain, and speaks nothing
  - and with no `--config`, an empty one or a flag it does not know, it exits at once with one usage line
  - and a config file that is not there logs «running on the built-in defaults» with the full path
