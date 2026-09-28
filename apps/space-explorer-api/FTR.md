# space-explorer-api — ftr

- 🧭 asked, not built yet (a new ask, an experiment) · ⬜ built, not checked yet · 🐞 built, its check fails · ✅ passes in the app's verify recipe · 🔎 dima used it and it holds
- given/when/then lines are the verifier's exit lines
- makes: lines name what a feature leaves behind — a file, a take, a clipboard item
- decision: lines record a choice and its reason

no ui: the features are the graphql surface, and every check reads as what a client sees in the response.

## queries

- ⬜ `launches` pages through every launch
  - when a client asks `launches(pageSize, after)`
  - then `list` holds up to `pageSize` launches (10 by default), oldest first, after the flight number `after`
  - and `cursor` is the last launch's flight number, `hasMore` says whether a later page exists
  - and an empty page answers `cursor: 0`, `hasMore: false`
- ⬜ `launch` answers one launch by id
  - when a client asks `launch(id)` with a known id
  - then it gets the site, flight number, mission, rocket and `isBooked`
  - and an unknown id answers an error «Launch <id> was not found!»
- ⬜ a launch carries its mission and rocket
  - then `mission.name` and `rocket.name` + `rocket.type` are filled
  - and `mission.missionPatch(size: SMALL)` gives the small patch url, anything else the large one
- ⬜ `isBooked` is per user
  - given a logged-in caller holds a trip on a launch
  - then that launch answers `isBooked: true` for them and `false` for anyone else or an anonymous caller
- ⬜ `userProfile` answers the caller and their trips
  - given the authorization header carries a valid token
  - then the client gets the email, id and every trip with its launch
  - and a trip whose launch left the gateway's window is dropped, the rest stay
- ⬜ a gone session answers `UNAUTHENTICATED`
  - given the token names no user (the db was rebuilt by a deploy)
  - when the client asks `userProfile` or writes
  - then the error carries `extensions.code: UNAUTHENTICATED`, so the ui can end the session
  - decision: a code, never a message string — the ui acts on it, and a stale token is the normal state after every deploy

## mutations

- ⬜ `login` by email
  - makes: a user row in the sqlite db, the first time an email logs in
  - when a client sends `login(email)` with a valid email
  - then it gets the user with a `token` (the email, base64) and their trips
  - and an invalid email answers «A valid email is required.»
  - decision: auth is demo-grade on purpose — the token is the email, nothing is stored
- ⬜ `logout` always answers true
  - then the client drops its token; the server keeps no session to end
- ⬜ `bookTrips` books seats on launches
  - makes: one trip row per new launch for the caller
  - given a logged-in caller
  - when they send `bookTrips(launchIds)`
  - then they get a trip per launch, each with its launch
  - and booking a launch twice gives the same trip, never a second one
  - and one unknown id rejects the whole call before any trip is written
- ⬜ `cancelTrip` cancels the caller's own trip
  - when a logged-in caller sends `cancelTrip(tripId)`
  - then it answers true and the trip is gone
  - and a trip that is not theirs, or already gone, answers false and nothing changes
- ⬜ writes need a login
  - given no token, or a token for an unknown user
  - when a client sends `bookTrips` or `cancelTrip`
  - then the error is `UNAUTHENTICATED` and nothing is written

## scripts

- ⬜ `pnpm dev` serves the schema on `:4000` (plus the worktree offset), reloading on change
- ⬜ `pnpm graphql:codegen` regenerates the resolver types from `src/graphql/schema.graphql`
- ⬜ `pnpm db:studio` opens prisma studio on the sqlite db
- ⬜ `pnpm start` is what railway runs in production
