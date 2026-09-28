---
name: x-com-chat
description: a dark, quiet chat room — the friend's portrait on one side, the conversation on the other
colors:
  night-ground-1: "#070910"
  night-ground-2: "#141720"
  night-raised-4: "#222939"
  night-raised-5: "#293042"
  night-ink: "#eaeef6"
  night-accent: "#aec97f"
  night-accent-ink: "#1d250f"
  day-ground-1: "#fcfdfb"
  day-ground-2: "#f8faf7"
  day-raised-4: "#e7e9e5"
  day-raised-5: "#dfe2dd"
  day-ink: "#1d2219"
  day-accent: "#53488a"
  day-accent-ink: "#ffffff"
typography:
  body:
    fontFamily: "'Geist', ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontFamily: "'Geist', ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
  label:
    fontFamily: "'Geist', ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
  mono:
    fontFamily: "'Geist Mono', ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 400
rounded:
  md: "0.625rem"
---

# x-com-chat — design

the values above are the shipped ones: the gray and accent scales come from `@ui/kit`'s L1 styles (`packages/kit/src/styles/gray.css`, `accent.css`), mapped to the shadcn vocabulary in `src/theme/init.css` under the `brand` class. the app boots dark (`brand dark` on `<html>`); light and system are one click or ⌘P away.

- **the ground** is a soft diagonal gradient between gray 1 and gray 2 in dark, gray 4 and gray 5 in light; the header card carries the same gradient the other way, so it floats without a hard border.
- **the accent** is a green in dark and a violet in light. in light, accent 7 fills the primary button and the friend select; in dark those take gray 5 and the accent is left to links, the scrollbar and text selection.
- **the friend's portrait** is the one image: a tall, masked picture beside the chat from `md` up, gone on a phone.
- **type** is geist throughout, geist mono for code in replies; replies render as prose (tailwind typography).
- **shape**: one radius, 0.625 rem, on the header, the field and the buttons; the send button and the friend select sit flush in the field's bottom corners.
- **motion** is short fades (the sign-in button, the welcome card, the reasoning fold). two things spin for as long as they show: the reply spinner, and the conic gradient ring on the 🔑 button.
