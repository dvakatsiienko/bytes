# Product

<!-- impeccable:product-schema 1 -->

## The want

dima, 2026-10-02, in his words:

> «when you respond to me, you print a link and I click it. It directly opens your comment so I could see where it is located on a canvas and reply to you there. It could even be a live queue … you leave them all at once and they become auto-visible in some of my stashes that I can keep always on so I see if you want something from me. It should be very close to me in the UI, like a Speak pill.»
>
> «I want easy access and good UX for design comps because the current approach is ugly.»

## Platform

web, local only — shown in the designer's Code-tab Browser pane

## Stack

vite + react + typescript inside the bytes monorepo, every control from `packages/kit`, motion.dev for motion. the surface is `react-zoom-pan-pinch` (zoom to an element, minimap, off-screen unmount); board frames follow tldraw's iframe recipe as a pattern, never its sdk. boards and asks are read from the studio files on disk, served from the app's own origin.

## Users

- **dima** — the operator. he answers the designer's asks, one round at a time, without hunting a canvas.
- **the designer** (a `~/projects/studio` session dima drives) — writes the asks, reads the answers, applies them.

## Product Purpose

the Claude Design canvas lets only a person open a comment, so a designer's questions get lost on a big canvas. design-loupe carries them the other way: the designer ends a round with its asks pinned to elements on its boards; dima clicks a link, lands on the exact spot with the question beside it, and answers in place.

success: a design round costs dima minutes of deciding, not an hour of canvas juggling, and no ask is ever lost.

## Positioning

the canvas stays where dima explores and comments natively; design-loupe is where he decides. one link, one spot, one keystroke.

## The cut — v1

- in: one job (speak) · live boards on pan/zoom · a deep link `/#ask-N` that zooms and rings · a moved target says so · the ask panel (question, outcome buttons, the recommendation and why, `1`–`4`, Enter, `j`/`k`, a text line) · `answers.json` · open → answered → seen → applied · the open count in the tab title and favicon · one push per round, sent by the designer
- out: several jobs, tabs or filters · dima's own canvas threads · asks from cclio or coders · any cloud store · mobile · editing boards · a pill or menubar presence
