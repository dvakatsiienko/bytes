---
name: sketchbook
description: the prototype surface — a quiet bone page, cobalt for done, amber for in flight
colors:
  bone: "#f4f5f2"
  ink: "#16181c"
  cobalt: "#2743e0"
  amber: "#e8a317"
  mist: "#98a0b0"
  rule: "#e3e4df"
  card: "#ffffff"
  muted: "#eceef0"
  muted-ink: "#6b7280"
  accent: "#e8ebfd"
  destructive: "#c8372d"
  night-bone: "#121212"
  night-ink: "#e8e9e6"
  night-cobalt: "#7d8ff0"
  night-amber: "#f0b83a"
  night-mist: "#7b8290"
  night-rule: "#2a2b2e"
  night-card: "#1b1c1e"
  night-muted: "#232427"
  night-muted-ink: "#a0a5ae"
  night-accent: "#232a4a"
  night-destructive: "#e06a60"
typography:
  display:
    fontFamily: "'Bricolage Grotesque Variable', 'Inter Variable', sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1
  title:
    fontFamily: "'Bricolage Grotesque Variable', 'Inter Variable', sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.25
  body:
    fontFamily: "'Inter Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace"
    fontSize: "10.4px"
    fontWeight: 400
    letterSpacing: "0.2em"
  mono:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
---

# sketchbook — design

the frame stays out of the proto's way. a bone ground, ink text, white cards, hairline rules. the
palette is named after the thing, not the role, and the shadcn variable set is mapped onto it in
`src/frame/theme.css`, so a palette change is one edit.

## colour

- **cobalt** means done and primary — the settled verdict, the «done» dot, a link on hover.
- **amber** means in flight — the «in progress» dot.
- **mist** means queued — the «touched» dot.
- light by default. the bench nav toggle sets `data-theme="dark"` on `<html>`, which lifts the
  surfaces a step and desaturates the accents.

## type

three faces: bricolage grotesque for the wordmark and the question, inter for body text, jetbrains
mono for data and labels. frame labels («prototype platform», «answering», «bench», «pages»,
«tickets») are small mono uppercase with wide tracking, so they read as chrome and never compete
with the proto.

## layout and motion

- the frame content sits in a 5xl column with 24 px gutters; the nav and header are translucent
  cards with a backdrop blur.
- the variant switcher is a pill fixed at the bottom centre; the state panel is fixed at the bottom
  left.
- motion is small and quick, under ~400 ms, and the theme honours `prefers-reduced-motion`.
- a proto may carry its own theme file; the frame's tokens are the default, never a cage.
