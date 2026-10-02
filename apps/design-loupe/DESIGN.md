---
name: design-loupe
description: the designer's asks, pinned to live boards; one link lands on the spot, one key answers
colors:
  loupe: "#c2410c"
  loupe-ink: "#ffffff"
  loupe-dark: "#ff7a4d"
  loupe-ink-dark: "#1b0d07"
  lens: "#e2552b"
  lens-badge: "#1c1b19"
  desk: "#e9e7e2"
  desk-ink: "#6b6862"
  desk-dark: "#121212"
  desk-ink-dark: "#8d8a84"
  panel: "oklch(1 0 0)"
  panel-dark: "oklch(0.145 0 0)"
  ink: "oklch(0.145 0 0)"
  ink-muted: "oklch(0.556 0 0)"
  muted: "oklch(0.97 0 0)"
  hairline: "oklch(0.922 0 0)"
  picked: "oklch(0.205 0 0)"
typography:
  headline:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.4
  title:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
  body-strong:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.43
  label:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.33
  id:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
spacing:
  hair: "6px"
  row: "12px"
  gutter: "20px"
  inset: "16px"
  panel-width: "380px"
components:
  ask-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "12px 20px"
  ask-row-active:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    padding: "12px 20px"
  chip-open:
    backgroundColor: "{colors.loupe}"
    textColor: "{colors.loupe-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 6px"
  chip-settled:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 6px"
  option:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.lg}"
    padding: "8px 10px"
  option-picked:
    backgroundColor: "{colors.picked}"
    textColor: "{colors.panel}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.lg}"
    padding: "8px 10px"
  board-title:
    textColor: "{colors.desk-ink}"
    typography: "{typography.body-strong}"
---

# Design System: design-loupe

## Overview

**Creative North Star: "The Loupe on the Desk"**

boards lie on a quiet warm-grey desk; the operator's eye goes where the loupe colour is. the whole page is neutral kit chrome plus one hot orange, and that orange always means «here, now, you»: the ring around the pinned element, the rail on the open ask, the open chip, the framed board in the minimap.

two regions, nothing else: the pan/zoom surface fills the left, the ask panel is a fixed 380px column on the right. the surface belongs to the boards, so loupe draws as little as it can on it: a title above each board, a ring, a minimap. the panel is dense and text-first, read top to bottom, driven by the keyboard.

the page follows the system scheme live. the desk and the loupe colour swap per scheme; the boards keep their own colours in both.

**Key Characteristics:**
- one chromatic accent, the loupe orange, on a neutral kit panel and a warm-grey desk
- every control is a stock kit component; the app adds no variant
- lines drawn on the surface are zoom-proof, the same screen width at every zoom
- flat: depth is the desk below the boards, and one small shadow under each board

## Colors

neutral by default; colour is a pointer, never decoration.

### Primary
- **Loupe Orange** (`loupe` / `loupe-dark`): the ring, the active ask's left rail, the open chip, the brand glyph, the framed board in the minimap and its viewport border, the faint board hover wash (4%), text selection. light mode is a deep orange that holds 5.2:1 against white both ways, so 12px text on it or in it stays legible; dark mode lifts it to a brighter step for `#121212`.
- **Loupe Ink** (`loupe-ink` / `loupe-ink-dark`): text on a loupe fill, the open chip and the selection.
- **Lens Orange** (`lens`, with a `lens-badge` count dot): the favicon only. the tab icon keeps the brighter orange in both schemes, since it carries no small text; the dark badge holds the open count.

### Neutral
- **Warm Desk** (`desk` / `desk-dark`): the surface behind the boards, and the backdrop of every error state.
- **Desk Ink** (`desk-ink` / `desk-ink-dark`): board titles and placeholder labels lying on the desk.
- **Panel, Ink, Muted, Hairline, Picked**: kit's neutral shadcn tokens (`background`, `foreground`, `muted-foreground`, `muted`, `border`, `primary`), inherited unchanged. the picked option uses kit `primary`, near-black in light and near-white in dark, so a decision reads as settled, never as a loud accent.

### Named Rules
**The One Loupe Rule.** the loupe orange is the only hue loupe owns. it marks where the operator should look, and nothing else. a second accent, or orange as a plain decoration, breaks the pointer.

**The Desk Is Warm Rule.** the desk is a warm grey (`desk`), never a kit neutral, so the boards read as objects on a table and the panel reads as chrome.

## Typography

**Body Font:** Hanken Grotesk Variable (with system-ui)
**Label/Mono Font:** kit mono, only for ask ids and error text

**Character:** one plain grotesk at three sizes; hierarchy comes from weight and muted colour, never from size jumps.

### Hierarchy
- **Headline** (600, 20px): the full-page error cards, the job error and the root crash.
- **Title** (600, 16px): the `loupe` wordmark in the panel header, and the in-region fallback headings.
- **Body** (400, 14px): the question, the summary line, the why, the status line. inactive questions clamp to two lines.
- **Body Strong** (500, 14px): the open question, option labels, board titles on the desk.
- **Label** (400, 12px): chips, the board name under the open question, the round number (tabular), the key-hint footer, the `recommended` tag.
- **Id** (mono 12px): `ask-N` in each row, and error text.

### Named Rules
**The Muted Second Line Rule.** a secondary fact sits in `muted-foreground` at the same or one smaller size; it never gets its own colour.

## Layout

a full-viewport row: the surface flexes, the panel is fixed at 380px with a hairline left border. the panel is a column of header, summary (hidden while an ask is open), a scrolling ask list and a key-hint footer, each split by a hairline.

the panel's rhythm: 20px side gutter on every block, 12px vertical in rows and the header, 12px gap inside the open ask, 6px between options. on the surface, boards sit at their canvas coordinates; the minimap floats 16px from the bottom-left corner. there is no responsive layout: the page is local and desktop only.

## Elevation & Depth

flat. depth is two layers: the desk below, the boards on it with a small ambient shadow (`shadow-sm`), and the minimap card with the same shadow. the panel has no shadow; a hairline separates it.

### Named Rules
**The Zoom-Proof Line Rule.** any line loupe draws over the boards divides its width by the current zoom (`--zoom`), so the ring is a 2.5px outline with a 2px gap and a 6px halo at 22% loupe, at every zoom. a live board's outline is 2px kit `ring`, by the same rule.

## Shapes

kit's radius scale (base 10px). chips are 6px, the minimap card 10px, option buttons and the input kit's 10px, error cards 14px. the ring takes the pinned element's own corner radius plus its gap, so it hugs the shape it marks. boards are square-cornered.

## Components

### The Ring (signature)
- **Style:** loupe outline, zoom-proof (see Elevation), with a soft loupe halo; it fades in over 0.25s.
- **Placement:** over the pinned element's box inside the board, never inside the comp. a target missing from the board's current version draws no ring.

### Ask Row
- **Default:** id and state chip on a 12px label line, question below in body, 2px transparent left rail.
- **Active:** the rail turns loupe, the row and its detail take `muted` at 40%, the question goes 500 and unclamped.
- **Hover:** `muted` at 60%.

### State Chip
- **open:** loupe fill, loupe ink, 500.
- **answered / seen / applied in X:** kit `muted` fill, ink text.
- **target moved:** no fill, a dashed hairline border. the open ask shows the same dashed treatment as a status box with a pin-off icon.

### Options
- **Style:** kit outline buttons, full width, left-aligned, a kit `Kbd` number first.
- **Picked:** kit default (filled `primary`); the `Kbd` turns translucent primary-foreground.
- **Recommended:** a 12px `recommended` tag at the end of the option.

### Text Line
- kit `Input`; Enter sends, Esc leaves it.

### Minimap
- a kit-neutral card at 90% background, hairline border; boards drawn as muted blocks, the framed one in loupe, the viewport bordered in loupe.

### Board
- a square card on the desk with a desk-ink title kept at screen size above it, capped to the board's on-screen width and truncated, so zoomed-out titles never overlap. off-screen boards are a titled placeholder; a click makes one live (2px ring outline), Esc returns it to a cover.

## Do's and Don'ts

### Do:
- **Do** take every control from `packages/kit` as is: `Button`, `Input`, `Kbd`.
- **Do** spend the loupe colour only where the operator should look next.
- **Do** divide any line drawn on the surface by `--zoom`.
- **Do** keep secondary text in `muted-foreground`, not a new colour.

### Don't:
- **Don't** add a second accent hue, or use loupe orange as a background panel.
- **Don't** add app variants to kit, or brand values to kit.
- **Don't** add shadows beyond the small one under boards and the minimap.
- **Don't** add a looping animation on the surface; motion is one-shot (the ring fade, the 420ms frame ease).
