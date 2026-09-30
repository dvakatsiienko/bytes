---
name: atelier
description: the fleet's art studio — the piece as large as it fits, smoked glass hugging its edges
colors:
  lamp: "#f2f5f7"
  lamp-ink: "#0e1216"
  lamp-hover: "#ffffff"
  smoke: "rgb(14 18 22 / 0.76)"
  smoke-hover: "rgb(38 45 51 / 0.84)"
  smoke-popover: "rgb(20 25 30 / 0.9)"
  ink: "#f2f5f7"
  ink-muted: "#b9c3c9"
  fill: "rgb(242 245 247 / 0.06)"
  fill-on: "rgb(242 245 247 / 0.16)"
  glass-edge: "rgb(242 245 247 / 0.1)"
  key-line: "rgb(185 195 201 / 0.4)"
  ground-day: "#d3d9dc"
  ground-ink-day: "#2b3236"
  ground-muted-day: "#4a5358"
  ground-dark: "#0e1216"
typography:
  title:
    fontFamily: "'Hanken Grotesk Variable', system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.56
    letterSpacing: "-0.01em"
  action:
    fontFamily: "'Hanken Grotesk Variable', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "'Hanken Grotesk Variable', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.43
  body:
    fontFamily: "'Hanken Grotesk Variable', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
  value:
    fontFamily: "'Azeret Mono Variable', ui-monospace, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
    fontFeature: "tnum"
  key:
    fontFamily: "'Azeret Mono Variable', ui-monospace, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1
rounded:
  key: "4px"
  control: "9.6px"
  glass: "12px"
  bake: "16.8px"
spacing:
  inner: "8px"
  stack: "12px"
  gutter: "16px"
components:
  glass-card:
    backgroundColor: "{colors.smoke}"
    textColor: "{colors.ink}"
    rounded: "{rounded.glass}"
    padding: "12px 14px 14px"
    width: "300px"
  edge-chip:
    backgroundColor: "{colors.smoke}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.glass}"
    padding: "0 14px"
    height: "48px"
    width: "300px"
  edge-chip-hover:
    backgroundColor: "{colors.smoke-hover}"
  bake-button:
    backgroundColor: "{colors.lamp}"
    textColor: "{colors.lamp-ink}"
    typography: "{typography.action}"
    rounded: "{rounded.bake}"
    padding: "0 16px"
    height: "52px"
  bake-button-hover:
    backgroundColor: "{colors.lamp-hover}"
  segment:
    textColor: "{colors.ink-muted}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "28px"
  segment-on:
    backgroundColor: "{colors.fill-on}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  fill-button:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 8px"
    height: "32px"
  fill-button-hover:
    backgroundColor: "{colors.fill-on}"
  field:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.glass}"
    padding: "4px 10px"
    height: "32px"
  key:
    textColor: "{colors.ink-muted}"
    typography: "{typography.key}"
    rounded: "{rounded.key}"
    padding: "3px 5px"
---

# Design System: atelier

## Overview

**Creative North Star: "The Lens Ring"**

The piece is the room. It is fitted whole, as large as the window allows, and everything else is smoked glass laid over its edges: dark, blurred, a little saturated, so the art reads through the controls instead of beside them. One smoke serves both themes. The theme only picks the ground a day piece sits on; a night piece always sits on the dark ground, because a pale surround reads its darks darker.

The ui is quiet and exact. Text is one grotesk at 14 px, numbers and keys are one mono at 12 px, and every control prints the key it answers to. There is exactly one loud surface on screen: the bake, opaque ink on the smoke. State is carried by shape and weight (a dashed edge, a filled segment, a word), never by a hue, and the palette has no hue to spend anyway: it is ink on smoke over the art's own colour.

Density is low by rule. Four folded edges and four corner cards are all that cover the piece at rest; one edge opens at a time.

**Key Characteristics:**
- the piece fitted whole and biggest; all the glass shares one frame, the window's 16 px inset
- one smoked glass (blur 28 px, saturate 1.3) in both themes
- achromatic: ink, muted ink and ink-alpha fills; colour belongs to the art
- the bake is the single opaque control
- every control shows its key in a 4 px mono key cap
- state by shape and weight, never by colour alone

## Direction

The world was picked by dima on 2026-09-30 after three studio design rounds (`docs/adr/0002-the-lens-ring.md`, studio job `jobs/atelier/`).

**Thesis.** The piece is as large as it fits whole. Four smoked-glass edges hug it, one per setting group: light on top, lens on the right, atmosphere at the bottom, toggles on the left. Every glass piece shares one frame, the window's 16 px inset: the top and bottom edges sit on the corner cards' line, over the art wherever it reaches the window's edge. One edge is open at a time (`1`–`4` open, `esc` folds), and the film strip (`g`, the takes stack opened) counts as the bottom edge: opening one folds the other. The four corners hold actions: the piece and its seed top-left, time and commands top-right, the takes bottom-left, the view tools and the bake bottom-right.

**The don'ts.**
- two edges open at once
- colour-only state
- the piece anywhere but biggest
- `/` firing inside a text field

## Colors

An achromatic system of ink on smoke: every ui colour is one cool near-white or a translucency of it over a near-black glass, so the only hue on screen is the art's.

### Primary
- **Bake Ink** (`lamp`, hover `lamp-hover`): the bake button and its note form's submit, filled opaque with `lamp-ink` text. It is the only opaque ink surface at control size; while a bake runs it drains to smoke and refills from the left as progress.

### Neutral
- **Smoke** (`smoke`): the glass. Every corner card, edge chip, open edge, the takes strip, and through the kit's L2 names every menu, dialog, select and toast. Hover lifts it to **Lifted Smoke** (`smoke-hover`); floating popovers use the denser **Popover Smoke** (`smoke-popover`).
- **Ink** (`ink`): all primary text on glass, the slider's range and blade, a checked switch, the focus ring, text selection.
- **Muted Ink** (`ink-muted`): secondary text inside a panel (row labels, counts, hints), key caps, an unchecked switch's outline and knob, an unpressed segment.
- **Ink Wash** (`fill`) and **Ink Wash, On** (`fill-on`): the resting and hover/pressed fills of in-glass buttons, fields and the segmented trough.
- **Glass Edge** (`glass-edge`): the 1 px border of every glass surface and of the kit's `border`.
- **Key Line** (`key-line`): key caps, field and select strokes, the slider track.
- **Day Ground** (`ground-day`) with **Ground Ink** (`ground-ink-day`) and **Ground Muted** (`ground-muted-day`): the light theme's surround behind a fitted day piece, and all a flat piece sits on; captions on the ground use these.
- **Dark Ground** (`ground-dark`): the dark theme's surround, and every night piece's surround in either theme; ground text there switches to `ink` / `ink-muted`.

### Named Rules
**The One Smoke Rule.** The glass is the same smoke in light and dark. A theme changes the ground, never the glass.

**The One Loud Moment Rule.** Opaque ink fills exactly one control on screen: the bake. Everything else in the glass is ink text on smoke or an ink wash.

**The Night Ground Rule.** A night piece sits on the dark ground whatever the theme.

## Typography

**Body Font:** Hanken Grotesk (with system-ui)
**Label/Mono Font:** Azeret Mono (with ui-monospace, Menlo)

**Character:** A plain, slightly warm grotesk for every word, and a wide mono that only ever holds a number or a key, so values line up and scan as data.

### Hierarchy
- **Title** (600, 18 px, 1.56, −0.01em): the piece's name in the top-left corner. One per screen.
- **Action** (600, 16 px, 1.5): the bake button's label; the piece name in the unrolled bar.
- **Label** (600, 14 px, 1.43): edge names, open-edge and takes headings, a pressed segment.
- **Body** (400, 14 px, 1.43): every other word: row labels, hints, buttons, captions on the ground.
- **Value** (Azeret Mono 400, 12 px, tabular): setting values, seeds, take ids, sizes, the build badge. A folded edge chip shows its one value at 13 px.
- **Key** (Azeret Mono 500, 12 px, line-height 1): the key cap.

### Named Rules
**The Mono Is Data Rule.** Azeret Mono holds values and keys only. A word, a label or a heading in mono is a defect.

**The Floor Rule.** Text is never below 14 px; values and keys never below 12 px. No uppercase, no tracking-wide labels.

## Layout

The piece is fitted whole into the window (`min(100cqh, 100cqw × ratio)`), centred, with the ground above and below a wide scene. The ring floats over it on a **16 px gutter**.

- **Corners:** four 300 px cards pinned 16 px from each window corner. Each reports its height, so the edges open in the room the corners leave.
- **Folded edges:** the top and bottom chips are 300 × 48 px, centred, 16 px from the window's top or bottom edge, on the same line as the corner cards; they sit over the art wherever it reaches that edge. The side chips are 48 × 240 px, vertical text, centred between their corners.
- **Open edges:** a side edge becomes a 300 px column under its corner; the top or bottom edge becomes a band between the corners (332 px in from each side), pinned 16 px from the window's top or bottom edge on the corners' line and growing toward the piece. It lays its rows in auto-fill columns of ≥13 rem. A band never reaches the corners across from it.
- **Stacking:** cards under a corner sit 12 px below it. Inside glass, rows breathe at 12–16 px, controls at 8 px.
- **The takes:** `g` turns the bottom-left stack into a film strip that runs from the left gutter to the tools column (332 px from the right) and takes the bottom edge's place.
- **Flat pieces:** a flat piece sits on the plain ground at a whole zoom, with a seed-only card centred on top in place of the ring; a favicon shows a row of «as it lands, at true size» previews (16, 32, 64 px) under it, and a pixel grid from 8×.
- **Below 1100 px** the ring unrolls into a scrolling column: a glass bar, the art in a 12 px-rounded frame (≤62 dvh), the four edges as segmented tabs, the takes, then the tools and the bake. Below 520 px the tab keys hide.

### Named Rules
**The Biggest Thing Rule.** At every width the piece is the largest element on screen. A panel that would shrink it overlaps it or unrolls below it instead.

**The One Frame Rule.** Every glass piece sits on one frame, the window's 16 px inset. The top and bottom pills keep the corner cards' line, so the chrome reads as one horizontal rhythm; where the art reaches the window's edge, they sit over it exactly as the corners do.

## Elevation & Depth

Depth is glass, not stacking: every surface over the art is the same smoke, lifted by one ambient shadow and a backdrop blur. There is one level. A popover, a dialog or a toast is the same glass, denser, with the same blur.

### Shadow Vocabulary
- **Glass** (`box-shadow: 0 12px 32px rgb(0 0 0 / 0.28)`, with `backdrop-filter: blur(28px) saturate(1.3)`): every glass surface and the bake.
- **Flat-piece lift** (`box-shadow: 0 18px 48px -18px rgb(0 0 0 / 0.35)`): a flat piece on the ground, so the sheet reads as set down.
- **Blade halo** (`box-shadow: 0 0 0 3px rgb(242 245 247 / 0.25)`): a slider blade on hover.

### Named Rules
**The Blur Is The Glass Rule.** Smoke without its blur reads as grey paint; any new floating surface takes the full blur.

**The Keyboard Ring Rule.** Focus is a 2 px ink outline, offset 2 px, shown only after keyboard input. Anything that covers the art draws it inset (−4 px), because the piece reaches the window's edges.

## Shapes

Soft, even rounding, three steps from the glass down: 12 px on every glass surface, field and select; ~10 px (9.6 px, the kit's scale) on in-glass buttons and segments; 4 px on key caps. The bake rounds a step further (16.8 px). The slider is a 2 px line with a 3 × 14 px blade (1 px radius); a switch is a 32 × 18 px ink outline. A stashed take's thumbnail wears a dashed muted-ink edge, the one dashed line in the system.

## Components

### Buttons
Quiet ink-wash buttons inside the glass, one loud ink button for the bake.
- **Shape:** 9.6 px in-glass, 12 px for the corner's larger fill buttons.
- **Fill button:** `fill` with ink text, 32 px tall, 8 px sides; hover `fill-on`. Carries its key cap after the label («new», «commands»).
- **Text button:** no fill, muted ink, 1 px × 4 px padding; hover `fill-on` and ink («copy json», «reset»).
- **Bake:** full corner width, 52 px, `lamp` with `lamp-ink`, action type, key cap outlined in 35 % lamp-ink; hover pure white. Pressing asks for a one-line note first («note, optional — what this take tries»). While baking, the button is its progress: smoke, with an ink fill growing from the left and the label drawn twice so it reads on both.

### Segmented control
A `fill` trough with 3 px inset; segments 28 px tall, muted ink; the pressed one gets `fill-on`, ink and semibold, so it differs in weight as well as fill. Used for day/night, the view tools (each with its key under the label) and the unrolled edge tabs.

### Inputs / Fields
- **Style:** `fill` background, 1 px `key-line` stroke, 12 px radius, 32 px tall. The find field on an open edge is the same at the control radius (9.6 px) and reads «find any of n settings».
- **Row value fields:** borderless mono numbers, right-aligned, showing a `key-line` stroke on hover or focus.
- **Focus:** the keyboard ring only; after a pointer press a field's stroke stays `key-line`.

### Edge chip (signature)
A folded edge: a glass chip naming its group in label type, one live value in mono, and its number key. The side chips run their text vertically (the left one reads bottom-up). Clicking or pressing the number opens the edge in its place.

### Open edge (signature)
A glass panel: a header with the name, its key, the count («n settings», «n found» while finding), a fold button with `esc`; the find field; the rows; and a footer with the row keys (`↑↓` row, `←→` value) and the text tools. Rows fade out at the scroll edge over 20 px. A row is a muted label, its exact value, a copy button that appears on hover, and the control: slider, switch, colour field or select.

### Key cap
A 4 px-rounded `key-line` outline around a 12 px mono key in muted ink, 3 × 5 px padding. Printed beside every control that has a key, in chips, panels, menus and the palette.

### Takes
A stack of 136 px-tall fanned thumbnails over a glass caption card («01-day ● current of 1» with `[` `]` `g`). Opened, a strip of 136 × 84 px thumbnails, each with its mono id; the current take is named in words, a stashed one gets the dashed edge and the word «stashed».

## Do's and Don'ts

### Do:
- **Do** fit the piece whole and keep it the biggest thing on screen, at every width.
- **Do** build every new surface over the art from the glass: `smoke`, the glass edge, the glass shadow, blur 28 px, saturate 1.3, 12 px radius.
- **Do** print the key a control answers to, in a key cap, on the control.
- **Do** carry state in shape, weight or words (a dashed edge, a semibold pressed segment, «current», «stashed») with any fill change.
- **Do** keep Azeret Mono for values and keys, Hanken Grotesk for every word, in the app's lowercase voice.
- **Do** keep loaders still; a long step shows its progress as a fill and a word, not a spin.

### Don't:
- **Don't** open two edges at once; the film strip is the bottom edge.
- **Don't** signal state by colour alone.
- **Don't** place the piece anywhere but biggest, or crop it to make room.
- **Don't** let `/` (or any single-key command) fire inside a text field.
- **Don't** give a second control the opaque ink of the bake.
- **Don't** introduce a hue into the ui; colour belongs to the art.
- **Don't** set text below 14 px or a value or key below 12 px.
- **Don't** make the smoke differ between themes, or float glass without its blur.
