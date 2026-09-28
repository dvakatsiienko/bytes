# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

next.js 16 (app router) + react 19 + tailwind v4 + typescript, `@ui/kit` for the theme toggle, `next-themes` for light and dark. inside the bytes monorepo, deployed on vercel.

## Users

- **recruiters and hiring managers** — they open the link from a message or a profile and want the facts in one screen: who, what role, which tools, where to write.
- **dima** — he sends the link and keeps the content true.

## Product Purpose

cv is dima's visit card: a one-page cv (brief, tools, portfolio) and a short cover letter, both inside a small browser window. success: a reader knows in under a minute who dima is and how to reach him.

## Positioning

a cv that shows its tools as a picture, not a list of words, and reads like a clean page rather than a pdf.

## Operating Context

- deployed on vercel, public, no auth, no data store
- all content lives in the source; changing a job or a tool is a code edit
- 📌 a redesign is pending; these docs describe the site as it is today and the redesign rewrites them

## Capabilities and Constraints

- two pages (`/`, `/cover`) plus a not-found page
- light, dark and system themes
- prints as a flat page: the frame's scroll area opens up for print
