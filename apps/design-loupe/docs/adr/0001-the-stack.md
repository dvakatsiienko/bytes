# A local Vite page that shows live boards as iframes on a zoom surface, with json files as the store

design-loupe is a Vite + React 19.3 page with Tailwind and `@ui/kit`, run on dima's mac only: no deploy, no auth, no database. The surface is `react-zoom-pan-pinch` 4.2 (its `Virtualize`, `KeepScale` and `MiniMap`), and each board is the designer's own `.dc.html` file in an iframe, served from the app's origin with the Claude Design runtime as `./support.js`. The store is two json files in the studio job — `asks.json`, written by the designer, and `answers.json`, written by design-loupe — read and written by a small Vite-side api. It was chosen because the boards must be the comp itself, live and unchanged, and because the designer and dima are two sessions on one mac that already share the studio folder.

## Considered options

- **tldraw's sdk** — a full canvas editor for a page that only pans, zooms and rings. its iframe recipe is taken as a pattern instead: a frame takes no pointer until it is clicked, and Esc returns to panning.
- **png renders of the boards** (`design:comp-render`) — cheaper to pan, but a picture cannot hover or play, and a board revision would need a render step before dima sees it.
- **the ring injected into the board** — exact by construction, but then the board is no longer the comp; the app measures the pin through the same-origin frame and draws the ring over it.
- **a cloud store or a database** — two sessions on one machine; a file each side owns needs no locking across processes.

## Consequences

- the wheel is design-loupe's own (`wheelView`): the library's wheel zoom adds to the scale, so one mouse notch could jump from 0.5 to the floor.
- the runtime file is pinned per Design release and read from the canvas, never committed (`AGENTS.md`).
