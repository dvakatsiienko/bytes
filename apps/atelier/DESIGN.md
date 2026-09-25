---
name: atelier
description: the fleet's art studio — the piece under the lamp, the tools close and quiet
colors:
  day-ground: "#eaf2f7"
  day-surface: "#ffffff"
  day-chip: "#dde8f0"
  day-ink: "#22324a"
  day-muted: "#56667c"
  day-line: "#cfdbe5"
  terracotta: "#c8553d"
  day-focus: "#3f6fb0"
  night-ground: "#121629"
  night-surface: "#1a2040"
  night-raised: "#222a50"
  night-chip: "#252c52"
  night-ink: "#e8ecf6"
  night-muted: "#9aa3c8"
  night-line: "#2c3460"
  lamp-gold: "#ffd978"
  lamp-ink: "#1a1f3a"
  night-focus: "#b3a6ee"
typography:
  display:
    fontFamily: "'Young Serif', Georgia, serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.15
  title:
    fontFamily: "'Young Serif', Georgia, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.25
  body:
    fontFamily: "'Figtree', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Figtree', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.08em"
  mono:
    fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  segment:
    backgroundColor: "{colors.day-chip}"
    textColor: "{colors.day-ink}"
    rounded: "{rounded.md}"
    padding: "3px"
  segment-active:
    backgroundColor: "{colors.day-surface}"
    textColor: "{colors.day-ink}"
    rounded: "{rounded.sm}"
  bench-action:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.day-surface}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  bench-action-night:
    backgroundColor: "{colors.lamp-gold}"
    textColor: "{colors.lamp-ink}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  field:
    backgroundColor: "{colors.day-surface}"
    textColor: "{colors.day-ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  canvas:
    backgroundColor: "{colors.day-surface}"
    rounded: "{rounded.lg}"
---

# Design System: atelier

## Overview

**Creative North Star: "the crafter and the lamp"**

a maker's bench at night. the piece being made sits under the lamp — it is the only lit, lifted thing on the screen. the tools lie close and quiet around it: small, exact, always within reach, never asking for attention. every decision in this system serves one loop: look at the piece, change it, look again.

the mood is calm, warm and precise. density is a craftsman's, not a dashboard's: controls are compact and grouped by the job they do, labels are short, numbers are exact. atelier's identity is its own — the starting palette borrows from the first art made in it, and may be tuned.

it must never look like a generic saas dashboard (grey cards, blue buttons, stat tiles) and never like neobrutalism (thick black borders, hard offset shadows, shouting type).

**Key Characteristics:**
- the canvas is the only lifted surface; everything else is flat tonal layers
- two accents, one per theme, both rare: the art carries the colour
- tools are quiet, compact and precise, with one tactile control
- the chrome barely moves; motion belongs to the art
- every control reachable by keyboard, in a sensible order

## Colors

a cool sky-and-navy field by day and a deep night indigo by night, each with one warm accent that appears only where it matters.

### Primary
- **Terracotta** (#c8553d): the day accent. the one action that matters in a region (bake, ship), the active take, and nothing else.
- **Lamp Gold** (#ffd978): the night accent, the lamp itself. same role as terracotta; text on it is **Lamp Ink** (#1a1f3a).

### Neutral — day
- **Sky Wash** (#eaf2f7): the ground, the bench surface everything sits on.
- **Paper White** (#ffffff): panels, fields and the canvas mat.
- **Chip Mist** (#dde8f0): segmented-control troughs and quiet fills.
- **Harbour Navy** (#22324a): ink — text and icons.
- **Slate Muted** (#56667c): secondary text, labels, hints.
- **Frost Line** (#cfdbe5): hairline borders and dividers.
- **Focus Blue** (#3f6fb0): the focus ring, day.

### Neutral — night
- **Night Indigo** (#121629): the ground.
- **Deep Surface** (#1a2040): panels.
- **Raised Indigo** (#222a50): popovers and the palette.
- **Trough Indigo** (#252c52): segmented troughs.
- **Moon Ink** (#e8ecf6): text.
- **Dusk Muted** (#9aa3c8): secondary text.
- **Night Line** (#2c3460): hairlines.
- **Focus Lilac** (#b3a6ee): the focus ring, night.

### Named Rules
**The One Lamp Rule.** each region of the screen has at most one accent-coloured element. the accent marks the action that matters, never decoration, never a section header.

**The Art Owns Colour Rule.** the chrome stays in its neutrals so a scene's palette is never judged against loud ui.

## Typography

**Display Font:** Young Serif (with Georgia)
**Body Font:** Figtree (with Helvetica Neue, Arial)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, Menlo)

**Character:** a warm, slightly old-world serif names things; a clean humanist sans does the work; mono carries every exact value — settings keys, numbers, seeds, hashes.

### Hierarchy
- **Display** (400, 28px, 1.15): the app name and a scene's title.
- **Title** (400, 18px, 1.25): section and take names.
- **Body** (400, 14px, 1.5): descriptions and notes.
- **Label** (500, 11px, 0.08em, uppercase): group labels on control rows (TIME, SHOW, README).
- **Mono** (400, 12px): settings keys under each control, numeric fields, seeds, file paths.

### Named Rules
**The Exact Value Rule.** anything a person might copy — a number, a key, a seed, a path — is set in mono.

## Layout

a bench layout: the canvas takes the centre and most of the width; tools dock at the edges (scenes and takes on one side, scene settings on the other) in resizable panels. control rows group by job with a label, 8px inside a group, 16px between groups. desktop-first; the app is a local tool on a large screen, and panels collapse rather than reflow below ~1100px.

## Elevation & Depth

flat by default. depth is tonal: ground, then surface, then raised, separated by hairline borders. exactly one thing is lifted: the canvas, the piece under the lamp, with one soft shadow. popovers, the command palette and toasts float with a short, tight shadow. there are no layered cards.

### Shadow Vocabulary
- **lamp** (`box-shadow: 0 18px 48px -18px rgb(10 14 30 / .45)`): the canvas only.
- **float** (`box-shadow: 0 6px 18px -6px rgb(10 14 30 / .35)`): popovers, palette, toasts.
- **hairline** (`box-shadow: 0 1px 2px rgb(0 0 0 / .12)`): the active segment in a segmented control.

### Named Rules
**The One Lifted Thing Rule.** only the canvas casts the lamp shadow. a second lifted surface means the design has drifted toward cards.

## Shapes

small, soft radii: 6px on controls, 8px on troughs and panels, 10px on the canvas mat. borders are 1px hairlines. no pills except tiny status chips, no sharp squares.

## Components

**tools on the bench** — quiet, compact, precise. every interactive element carries a pointer cursor on hover.

- **segmented control**: a Chip Mist trough, 3px inset; the active segment is Paper White with the hairline shadow. used for time, show, readme width, theme.
- **bench action** (bake, ship): the one accent button per region. **the tactile control:** a 2px bottom edge in a darker tone of the accent, like a key; on press it moves down 2px and the edge collapses — the one physical gesture in the chrome.
- **field**: mono text, hairline border, 6px radius. numeric fields accept only valid numbers; ↑/↓ step, shift ×10, alt ×0.1; the settings key shows in mono under the label; a copy button sits beside it.
- **take card**: a thumbnail on the mat with its name and note; the active take gets a terracotta / lamp-gold 2px outline, never a fill.
- **toasts, palette, popovers**: Raised surfaces with the float shadow; status text («copied `look: exact`») lives in toasts, never in inline text that shifts the layout.

## Do's and Don'ts

- **do** keep the canvas the brightest, most lifted thing on screen.
- **do** make every control reachable with tab / shift+tab in reading order — scenes, takes, canvas, settings — with a visible focus ring (Focus Blue / Focus Lilac, 2px, offset 2px).
- **do** give every hotkey a `Kbd` hint in the command palette.
- **do** keep chrome motion to 120–180 ms fades and slides; motion in the viewport only when the user presses play.
- **don't** add grey cards, blue primary buttons or stat tiles.
- **don't** use thick borders, hard offset shadows or neobrutalist type.
- **don't** loop any animation in the chrome (spinners, pulses, shimmer) — they peg the gpu on high-refresh displays.
- **don't** put more than one accent element in a region.
