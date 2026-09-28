---
name: financial
description: greenbar ledger paper — banded rows, a seal-green stamp, figures in mono
colors:
  paper: "#f5f6f1"
  bar: "#e2eadd"
  ink: "#171c18"
  ink-soft: "#5c665e"
  rule: "#c9d2c6"
  seal: "#0b5d3b"
  flag: "#b4441f"
typography:
  display:
    fontFamily: "'Archivo', sans-serif"
    fontWeight: 600
  body:
    fontFamily: "'Inter', sans-serif"
    fontSize: "14px"
    fontWeight: 400
  caption:
    fontFamily: "'Inter', sans-serif"
    fontSize: "10px"
    letterSpacing: "0.18em"
    textTransform: uppercase
  figures:
    fontFamily: "'IBM Plex Mono', monospace"
    fontWeight: 500
rounded:
  none: "0px"
  full: "9999px"
---

# financial — design

the tokens live in `src/theme/global.css` (`@theme`), the fonts in `src/theme/fonts.ts`.

## the idea

greenbar: the pale-banded continuous-feed paper line printers used for ledgers and statements. the bands let the eye carry a figure across a wide row. the landing page and the dashboard are one sheet: both carry the same perforated tractor-feed edge down the left.

## colour

- `paper` is the ground, `bar` the pale green band on every other row (`.greenbar`) and the tint behind the sidenav
- `ink` for text, `ink-soft` for secondary text and captions, `rule` for every border and the ledger lines behind the revenue bars
- `seal` is money in: the paid stamp, the collected card, the primary button, focus outlines
- `flag` is money owed: the pending stamp, the pending card, error lines

## type

- `display` (archivo 600/700) for page titles and the landing headline
- `body` (inter) for everything else
- `caption` — 10 px uppercase with wide tracking, the printed column heading on a statement
- `figures` (ibm plex mono) for every amount and count, tabular, so columns of money line up

## shape

corners are square: tables, cards, inputs and buttons sit on the sheet like printed boxes. only customer pictures are round. the status is a rubber stamp, not a pill: a 2 px bordered caption, and «Paid» sits rotated −3° because a hand-pressed stamp never lands straight.

## motion

one: the skeleton shimmer while a block loads.
