# design-loupe — ftr

- 🧭 asked, not built yet (a new ask, an experiment) · ⬜ built, not checked yet · 🐞 built, its check fails · ✅ passes in the app's verify recipe · 🔎 dima used it and it holds
- given/when/then lines are the verifier's exit lines
- makes: lines name what a feature leaves behind — a file, a take, a clipboard item
- decision: lines record a choice and its reason

## / — the boards and the ask panel

> purpose: a job's live boards on one pan/zoom surface, the open asks beside them
> states: an ask opened by link · target moved · a board made interactive · every ask answered

- ✅ a deep link opens an ask at its pin
  - given a job's boards and asks.json with 3 asks
  - when dima opens `/speak/ask/2`, cold or from another ask
  - then the view zooms to its board and a ring frames the pin within 2 px, at zoom 0.37 and 2.0, in Chrome
  - decision: the ring is drawn by the app over the board, never injected into the comp — the board stays the comp
  - decision: the link is a path (`/speak/ask/2`, `/speak/board/<name>`), the job in its first segment — an ask is a place (bytes AGENTS.md, url shape); moves are client-side, so the boards never reload (dima, 2026-10-02)
- ✅ a moved target says so
  - given an ask whose pin is gone from its board
  - when design-loupe loads
  - then the ask says «target moved» and the view frames the whole board, never an empty zoom
  - and the ask is locked until the designer pins it again: no pick, no note, no reopen; it is left out of the open count, the bar, «send to designer» and «all answered», and an answer it already had stays on file, unsent
  - decision: a moved ask is locked, not answered blind (dima, 2026-10-02)
- ✅ answering an ask
  - makes: an answer in `studio/jobs/<job>/answers.json`: the ask id, the pick, its notes and the board revision
  - given an open pick ask
  - when dima presses Enter
  - then the recommended option is the answer and the ask shows «answered»; pressing `2` picks option 2
  - decision: buttons name the outcome («use header A»), never approve/reject — prior art: approve/reject confuses reviewers
- ✅ an ask's question is text
  - given an open ask
  - when dima selects or drags across its question
  - then it selects as text, ready to copy or have read aloud; only the ask's header line and its board line jump the view
  - decision: a link never wraps a sentence (dima, 2026-10-02; x:guide-ui-ux)
- ✅ notes on an ask
  - makes: every note in the ask's answer in `answers.json`, oldest first, each with its time; nothing is overwritten
  - given an ask with option 2 picked
  - when dima adds a note, then another
  - then option 2 stays picked and both notes show under the ask, oldest first, each with its time
  - decision: an answer is the pick plus a thread of notes; a note never clears the pick, and a reopen keeps the notes (dima, 2026-10-02)
- ✅ an ask's life is visible
  - given an answered ask
  - when the designer marks it seen, then applied
  - then the ask shows «seen», then «applied in vN» with a link to its board
- ✅ the open count
  - given 3 open asks
  - then the tab reads `(3) speak · design loupe` and the favicon carries 3
  - when all are answered, then the count is gone
- ✅ only nearby boards are live
  - given 20 boards
  - when dima pans
  - then only the boards in view, plus one ring of neighbours, are live frames; the rest are placeholders
- ✅ a board reached by Tab comes into view
  - given a board that sits half under the panel
  - when dima tabs onto it
  - then the view pans until the whole board is on screen; focus is never hidden (dima, 2026-10-02)
- ✅ a board's own links stay inside it
  - given a live board whose comp has a link (the speak logo points at «/»)
  - when dima clicks it
  - then the board stays on screen as it was; design loupe never opens inside a board
- ✅ a board made interactive
  - when dima clicks a board
  - then it takes hover and play; Esc returns to panning

## the designer's side

- ✅ the designer wakes once per round: all answered, or send to designer
  - makes: a handover in `answers.json` (`sent`), one per round handed over
  - given the designer watches `answers.json` and 2 asks are open
  - when dima answers the first, then the last
  - then nothing wakes on the first; one block with both answers wakes the designer within 5 s of the last
  - decision: the designer reads a round as one batch, never one answer at a time (dima, 2026-10-02)
- ✅ send to designer
  - given every ask was handed over, and dima adds a note after it
  - when he presses «send to designer» in the panel
  - then the bar reads «1 of 2 answers staged» until the press (a moved ask is locked and left out), the press hands it over as one block, and the bar says «sent to the designer at HH:MM»; each answer still shows «answered» at once
- ✅ one push per round
  - given the designer writes a round of 4 asks
  - then exactly one push arrives
