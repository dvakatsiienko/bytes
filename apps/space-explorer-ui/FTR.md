# space-explorer-ui — ftr

- 🧭 asked, not built yet (a new ask, an experiment) · ⬜ built, not checked yet · 🐞 built, its check fails · ✅ passes in the app's verify recipe · 🔎 dima used it and it holds
- given/when/then lines are the verifier's exit lines
- makes: lines name what a feature leaves behind — a file, a take, a clipboard item
- decision: lines record a choice and its reason

## every page — header, footer, theme

- ⬜ the header names the page and the user
  - then a page title shows beside an avatar and the user's email
  - and the avatar is one of three dogs, picked by the email's first letter; a launch page shows its mission patch instead
- ⬜ the footer nav: Launches, Cart, Trips, Logout
  - then the current page's item is marked in blue
  - and Cart shows a count of seats on hold, Trips a count of booked trips, each only when above zero
- ⬜ theme: light, dark, auto
  - when the user picks one in the header toggle
  - then the palette switches; «auto» follows the OS and keeps following it when the OS flips
- ⬜ only a logged-in user reaches a page
  - given no token is stored
  - when the user opens `/launches`, `/launches/<id>`, `/cart` or `/profile`
  - then they land on `/login`; `/` and any unknown path go to `/launches` or `/login` by login state
- ⬜ a gone session ends itself
  - given the api answers `UNAUTHENTICATED` (its db was rebuilt)
  - then the token and the cart are dropped and the page returns to `/login`

## /login — boarding

- ⬜ log in with an email
  - when the user types an email in the «boarding» panel and presses «Log in»
  - then they land on «Upcoming launches»
  - and a bad email shows its error under the field, and the form keeps what they typed
  - decision: the email is the only ticket — the pair's auth is demo-grade on purpose
- ⬜ the theme toggle sits in the corner of the login page too

## /launches — upcoming launches

- ⬜ launches as boarding tickets
  - then each launch is a ticket: «mission» with its name, «rocket», «site», and a «flight» number on the stub
  - and a ticket's mission name opens its launch page
- ⬜ «Load more» pages further
  - given more launches exist
  - when the user presses «Load more»
  - then the next page joins the list below
- ⬜ a seat's state shows on its ticket
  - then an open seat offers «Add to cart», a held one shows an «in cart» stamp and «Remove», a booked one a «booked» stamp and a disabled «Trip booked»
- ⬜ add and remove a seat
  - when the user presses «Add to cart» or «Remove»
  - then the ticket's stamp and the footer's Cart count follow at once

## /launches/<id> — one launch

- ⬜ the launch page
  - then the header shows the mission patch and name, a «← all launches» link, and the full ticket with the rocket type
  - and an unknown id shows the error text

## /cart — my cart

- ⬜ «checkout» books every held seat
  - given seats are on hold
  - then a sticky «checkout» bar counts them and offers «Book all»
  - when the user presses «Book all»
  - then the seats become trips, the cart empties and «Trips booked.» shows
  - and a failed booking shows «Booking failed: <reason>» and keeps the seats that did not book
- ⬜ an empty cart says so
  - then «Nothing on hold. Add a launch and it shows up here.»
- ⬜ a seat booked elsewhere leaves the cart by itself

## /profile — my trips

- ⬜ every booked trip as a ticket
  - then each trip shows its launch with a «booked» date and a «Cancel trip» button
- ⬜ cancel a trip
  - when the user presses «Cancel trip»
  - then the trip leaves the list and its launch is open again
  - and a failed cancel shows «Cancel failed. Try again.»
- ⬜ no trips yet
  - then a «manifest» panel reads «No seats booked yet.» with a «Pick a launch» link

## footer — logout

- ⬜ «Logout» ends the session
  - when the user presses «Logout»
  - then the token, the cart and every per-user cache entry are dropped and they land on `/login`, even when the api does not answer within 3 s

## scripts

- ⬜ `pnpm dev` serves the app on `:5173` (plus the worktree offset), talking to the api on `:4000`
- ⬜ `pnpm graphql:codegen` regenerates the typed documents; it needs the api running
- ⬜ `pnpm build` typechecks and builds, `pnpm preview` serves the build
