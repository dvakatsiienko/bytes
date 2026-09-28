# space-explorer-api

the graphql server of space explorer: it reads real launches and lets a user hold seats on them. it owns every shared word of the pair; the ui's glossary points here.

## Language

### what flies

**Launch**:
One scheduled or past flight, read from the gateway, with its site, mission and rocket.
_Avoid_: flight (as the object), event

**Flight number**:
A launch's place in the date order, counted from 1; it is also the paging cursor.
_Avoid_: launch number, index

**Mission**:
What a launch carries out, known by its name and its patch.
_Avoid_: payload, objective

**Mission patch**:
The mission's emblem image, in a small or a large size.
_Avoid_: logo, badge

**Rocket**:
The vehicle a launch flies on, known by its name and its type.
_Avoid_: vehicle, booster

**Site**:
Where a launch lifts off.
_Avoid_: launchpad, pad, location

**Gateway**:
The public data source every launch and rocket is read from; it holds a rolling window of recent flights plus the next one.
_Avoid_: spacex api (it is dead), upstream

### who books

**User**:
One person, known only by their email; created at first login.
_Avoid_: account, customer, member

**Token**:
The proof a client sends with each request: the user's email, base64.
_Avoid_: session, jwt, api key

**Trip**:
One seat a user booked on one launch; a user holds at most one trip per launch.
_Avoid_: booking, reservation, ticket

**Booked**:
A launch is booked for a user when that user holds a trip on it.
_Avoid_: reserved, taken

**Gone session**:
A token that names no user the server knows, which is what every token becomes after a deploy rebuilds the db.
_Avoid_: expired token, logged out
