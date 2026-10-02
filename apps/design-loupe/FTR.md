# design-loupe — ftr

- 🧭 asked, not built yet (a new ask, an experiment) · ⬜ built, not checked yet · 🐞 built, its check fails · ✅ passes in the app's verify recipe · 🔎 dima used it and it holds
- given/when/then lines are the verifier's exit lines
- makes: lines name what a feature leaves behind — a file, a take, a clipboard item
- decision: lines record a choice and its reason

## / — the boards and the ask panel

> purpose: a job's live boards on one pan/zoom surface, the open asks beside them
> states: an ask opened by link · target moved · a board made interactive · every ask answered

- 🧭 a deep link opens an ask at its pin
  - given a job's boards and asks.json with 3 asks
  - when dima opens `/#ask-2`
  - then the view zooms to its board and a ring frames the pin within 2 px, at zoom 0.37 and 2.0, in Chrome and Safari
  - decision: the ring is drawn by the app over the board, never injected into the comp — the board stays the comp
- 🧭 a moved target says so
  - given an ask whose pin is gone from its board
  - when design-loupe loads
  - then the ask says «target moved» and the view frames the whole board, never an empty zoom
- 🧭 answering an ask
  - makes: an answer in `studio/jobs/<job>/answers.json`, with the ask id and the board revision
  - given an open pick ask
  - when dima presses Enter
  - then the recommended option is the answer and the ask shows «answered»; pressing `2` picks option 2
  - decision: buttons name the outcome («use header A»), never approve/reject — prior art: approve/reject confuses reviewers
- 🧭 an ask's life is visible
  - given an answered ask
  - when the designer marks it seen, then applied
  - then the ask shows «seen», then «applied in vN» with a link to its board
- 🧭 the open count
  - given 3 open asks
  - then the tab reads `(3) speak · loupe` and the favicon carries 3
  - when all are answered, then the count is gone
- 🧭 only nearby boards are live
  - given 20 boards
  - when dima pans
  - then only the boards in view, plus one ring of neighbours, are live frames; the rest are placeholders
- 🧭 a board made interactive
  - when dima clicks a board
  - then it takes hover and play; Esc returns to panning

## the designer's side

- 🧭 the designer wakes on an answer
  - given the designer watches `answers.json`
  - when dima answers
  - then its session wakes within 5 s
- 🧭 one push per round
  - given the designer writes a round of 4 asks
  - then exactly one push arrives
