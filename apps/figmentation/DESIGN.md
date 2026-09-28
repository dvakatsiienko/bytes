---
name: figmentation
description: a quiet gallery shell around studies that each bring their own brand
colors:
  clinique-ink: "#101014"
  clinique-paper: "#f7f5f2"
  clinique-lab: "#e8f0ee"
  clinique-accent: "#b8d8cf"
  clinique-shade-bone: "#f6dfc8"
  tesla-primary: "#3e6ae1"
  tesla-gray-200: "#f2f2f2"
  tesla-gray-300: "#eeeeee"
  tesla-gray-400: "#e2e3e3"
  tesla-gray-600: "#5c5e62"
  tesla-gray-950: "#171a20"
typography:
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "60px"
    fontWeight: 600
    lineHeight: 1.05
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0.2em"
rounded:
  sm: "4px"
  lg: "8px"
  2xl: "16px"
---

# figmentation — design

two layers, on purpose.

## the shell — the home page

a neutral gallery that stays out of the way of the studies: white study cards with a soft shadow on a plain page, tailwind's gray scale for text (`gray-900` titles, `gray-600` copy), a `prose` header in inter. cards round at 16 px, their buttons at 8 px: a dark «Visit» and an outlined «Figma file». hover lifts the card and zooms its image; nothing else moves.

## the studies — each brings its own

- **clinique** — warm paper (`#f7f5f2`) and near-black ink (`#101014`), a pale lab green (`#e8f0ee`) as the halo behind products, a faint 88 px grain grid in the hero. square corners, hairline borders at 10–20 % ink, uppercase labels with wide tracking (0.18–0.35 em). motion is slow and eased: cards lift 6 px and the product tilts on hover, and the ticker slides in a 32 s loop.
- **tesla-landing** — tesla's blue (`#3e6ae1`) as `--primary` and its gray ramp as tailwind tokens, two custom breakpoints (`tesla-tablet` 600 px, `tesla-desktop` 1200 px), a photo hero with white type and 4 px buttons. unfinished.

a study never borrows another study's palette; the shell never borrows either.
