# trophy-sys — the /campaign charts

loads with any chart module here; `src/web/campaign.tsx` (the route) and `campaign.fixture.ts` sit one level up — read this file before touching them.

Eleven charts and a KPI strip, all visx, all reading one payload — `GET /api/stats`, the trophy
fan-out cached in Upstash under `trophy-sys:stats`.

- **The archive is versioned.** `ARCHIVE_VERSION` in `stats.ts` gates it: a stored archive whose
  version does not match reads as empty, and the route's own "rescan trophies" button refills it.
  Bump it whenever the stored shape changes — cheaper and safer than migrating, because the scan
  is one button and eight seconds.
- It carries earned trophies (`trophies`) and, for titles still under way, the unearned ones
  (`remaining`) with their live counters. "Closest to done" is the only chart needing the second
  list, and it is why the payload roughly doubled.
- **Reach for the furniture before writing SVG.** `ChartFrame` gives the panel, the chart/table
  toggle and the accessibility floor; `ChartTooltip` + `TooltipLayer` give the one tooltip, which
  renders on the body in a portal; `BarRows` draws any ranked horizontal-bar chart, and four of the eleven are one
  call to it; `chart-theme.ts` holds the ink. A chart module exports its own derivation and its
  `*_COLUMNS`, so `campaign.tsx` only wires.
- **A margin that holds axis text is a token in `chart-theme.ts`, never a literal.** `AXIS_BOTTOM`
  (26), `AXIS_LEFT` (52), `MONTH_AXIS_RIGHT` (26). Each one replaced a set of hand-typed numbers
  that had drifted: bottom ran 36/26/22, left ran 38/42/38 — and 38 was too small for the
  progression's widest tick, so `2,000` drew as `,000` for months. `MONTH_AXIS_RIGHT` holds the
  half of a `YYYY-MM` label that hangs past the last tick.
  `campaign-layout.browser.test.tsx` holds the rule: it draws `/campaign` from
  `campaign.fixture.ts` in chromium at 1280 and 390, and goes red when an x-axis chart ends at a
  different distance above its panel edge, or a tick label on any axis leaves its chart's svg.
  📌 visx wraps each tick label in its own `<svg style="overflow: visible">` — measure against the
  chart's outer svg, never `closest('svg')`. A new x-axis chart bumps its `X_AXIS_CHARTS`.
- **A tick count is derived from the width, never asked for flat.** `monthTicks(innerWidth, n)`
  for the two month axes — both asked for 6 at every width and printed over each other at 390px.
  `decadeTicks` in `effort-scatter.tsx` pins one tick per power of ten: 📌 **d3 abandons the count
  you pass a log scale once the domain spans fewer decades than that count, and emits every minor
  tick instead** — hiding untouched titles narrowed the effort domain enough to print 26
  overlapping labels.

## Charts talking to each other

Clicking a day in the activity heatmap marks that month on the progression
timeline. **The two charts share one `YYYY-MM` string and nothing else** — the
route holds `focusMonth` state and a `ref` on the progression wrapper, the
heatmap emits a date, the progression takes a `focusMonth` prop and draws a
marker. Keep any future cross-chart link this shape: a value in the route, never
an import between chart modules.

The timeline draws every month it has at once, so "scroll to that date" is
`scrollIntoView` on the panel plus the marker. There is no horizontal scrolling
to drive.

## Six things measured the hard way

- 🚫 **Never put motion's `animate` transform and an SVG `transform` attribute on one node.**
  Motion writes its scale into the `transform` style, which replaces the attribute outright — the
  night-owl columns all drew at hour zero. Place with a plain `<g transform>`, animate with a
  `<motion.g>` inside it. `scatter-mark.tsx` is the reference shape.
- 🚫 **This palette carries two categorical series, not six.** gruvbox-material is desaturated by
  design; its purple and blue sit ΔE 1.5 apart under deuteranopia, measured with the `dataviz`
  validator. To separate many things use one hue at several strengths (the activity and night-owl
  grids) or position, never a hue per item. The one two-colour split — platinum against the rest —
  also carries a shape, so colour is never alone.
- 🚫 **No chart has two y axes.** The velocity band under the progression area is a second plot
  sharing the x axis, not a second scale on the same one.
- 🚫 **An overlay positioned inside a chart is clipped three times over.** visx's `ParentSize`
  wraps children in an `inset: 0; overflow: hidden` box — that one is invisible until you walk the
  computed styles — and the panel body and `<main>` both scroll. The tooltip is 177px tall inside a
  134px chart, so no flip can fit it; `TooltipLayer` portals to the body and positions against the
  viewport instead. Any future overlay (a popover, a menu) needs the same escape.
- 🚫 **A grid item needs `min-w-0`, or a wide chart stretches the page.** A grid item's
  `min-width` defaults to `auto`, so the heatmap's 783px SVG widened its own column instead of
  scrolling inside it. `ChartFrame` carries the class; so must any new wrapper around a panel.
- 📌 **A hidden pseudo-element still counts toward the page's scroll width.** `.hint::after` is
  `position: absolute` and up to 15rem wide, so the theme toggle at the end of the header pushed a
  390px viewport out to 498px — invisibly, because `querySelectorAll('*')` never sees a
  pseudo-element. Anything `.hint` near a right edge takes `hint-right` as well.

## Driving the page

`agent-browser` is the driver; it documents itself with `agent-browser skills get core`. Two
things about **this** page waste a run otherwise:

- A full-page screenshot comes out empty, because the page scrolls inside `<main>` rather than the
  document. Capture the viewport, or one panel by selector.
- A hover below the fold silently does nothing. Scroll the panel into view first, then move the
  mouse to a mark's centre — marks are bare SVG, so they carry no accessibility refs and their
  geometry has to come from `eval`.
