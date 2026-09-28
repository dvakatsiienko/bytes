---
name: space explorer
description: a departures board for rocket launches — boarding tickets on gruvbox paper, one cold blue accent
colors:
  day-ground: "#fbf1c7"
  day-surface: "#f2e5bc"
  day-lift: "#ebdbb2"
  day-line: "#d5c4a1"
  day-dim: "#928374"
  day-muted: "#665a50"
  day-ink: "#654735"
  day-ink-strong: "#4f3829"
  day-red: "#c14a4a"
  day-green: "#6c782e"
  day-yellow: "#b47109"
  day-blue: "#45707a"
  day-purple: "#945e80"
  night-ground: "#1d2021"
  night-surface: "#282828"
  night-lift: "#32302f"
  night-line: "#504945"
  night-dim: "#928374"
  night-muted: "#a89984"
  night-ink: "#d4be98"
  night-ink-strong: "#bdae93"
  night-red: "#ea6962"
  night-green: "#a9b665"
  night-yellow: "#d8a657"
  night-blue: "#7daea3"
  night-purple: "#d3869b"
typography:
  title:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 400
    letterSpacing: "0.01em"
  label:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "0.18em"
  number:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1
rounded:
  none: "0px"
  full: "9999px"
---

# Design System: space explorer

## Overview

a departures board in gruvbox-material, the palette trophy-sys and the sline statusline share. light is the base, dark rides kit's `.dark` class. the page is a narrow column (max 3xl) with a sticky footer nav; every launch is a boarding ticket.

## Colors

- **blue is the one accent** — links, the current nav item, buttons, focus rings. it reads as vacuum, where trophy-sys's orange read as a crt.
- **purple is selection only**, mixed at 35 % so it never reads as a second accent.
- **green and yellow are seat states**: a green «booked» stamp, a yellow «in cart» stamp. red is errors only.
- neutrals step from ground to surface to lift, with one line colour for every border.
- only the raw `--p-*` values change per theme; every token points at them (`src/theme.css`).

## Typography

one face, jetbrains mono variable, everywhere. labels are 12 px uppercase with 0.18em tracking («mission», «rocket», «site», «flight»). the flight number is the loudest type on a ticket, bold and tabular.

## Components

- **ticket** — a body with the mission art luminosity-blended onto the blue, a dashed perforation with two round bites, and a stub with the flight number and the action. the stamp sits tilted at −6° in the body's corner.
- **panel** — a boxed frame whose label sits on its top border (`panel-title`), used for «boarding», «checkout» and «manifest».
- **footer nav** — four equal cells, icon over label, a blue top border on the current page, a square count badge.

## Shape and texture

- corners are square (`--radius: 0`); only the user avatar is round.
- the login page sits on a static dot-grid starfield.
- dark adds a static crt scanline overlay (16 % black lines every 3 px); nothing is animated, and reduced motion zeroes every transition.
- chrome is not selectable; only real names (mission, rocket, site, email) opt back into selection.
