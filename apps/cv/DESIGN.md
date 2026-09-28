---
name: cv
description: a visit card in a small browser window — calm grays, one violet link colour
colors:
  day-page-gradient-from: "#e7e9e5"
  day-page-gradient-to: "#fcfdfb"
  day-background: "#fcfdfb"
  day-ink: "#1d2219"
  day-header: "#161423"
  day-link: "#7c3aed"
  night-page-gradient-from: "#070910"
  night-page-gradient-to: "#141720"
  night-background: "#1d212d"
  night-ink: "#eaeef6"
  night-header: "#070910"
  night-link: "#b8e459"
  dot-close: "#ef4444"
  dot-minimize: "#eab308"
  dot-maximize: "#22c55e"
typography:
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.375
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "12px"
    fontWeight: 600
  mono:
    fontFamily: "'Geist Mono', ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
rounded:
  sm: "4px"
  md: "6px"
  lg: "16px"
  window: "12px"
---

# cv — design as shipped

📌 current state only; the pending redesign rewrites this file.

the page is a soft gray gradient with one window on it: a `max-w-3xl` card with a 12 px radius and a large shadow. the window's header carries the three traffic-light dots, a small tab bar («cv», «cover») and the theme toggle; the body scrolls inside the window with a thin rounded scrollbar.

text is manrope, set through tailwind's typography plugin (`prose`, `prose-sm` growing to `prose-base` at `md`). links are the one colour: violet in light, the kit accent in dark, semibold, underlined on hover. section headings are lowercase words («brief», «tools I use», «portfolio») with a faint link-tinted text shadow.

tools are small chips: an 18 px icon over a 12 px label on a gray-7 tile that lightens on hover, packed into a 4-column grid on phones and 9 columns from `sm`.

colours come from kit's 12-step gray and accent scales; the hex values above are kit's fallbacks (the p3 oklch values win on wide-gamut screens). the three dots are tailwind's red, yellow and green 500.
