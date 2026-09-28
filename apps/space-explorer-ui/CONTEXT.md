# space-explorer-ui

the client of space explorer: a user logs in with an email, puts seats on hold and books them as trips. the shared words (launch, mission, rocket, site, flight number, user, token, trip, booked, gone session) are defined once in [space-explorer-api's CONTEXT.md](../space-explorer-api/CONTEXT.md); this file holds only the words the ui adds.

## Language

**Ticket**:
How the ui shows one launch: a body with the mission, a stub with the flight number and the seat's action.
_Avoid_: card, tile

**Stamp**:
The tilted label on a ticket that names its seat state: «in cart» or «booked».
_Avoid_: badge, tag

**Seat state**:
Where the user stands on one launch: open, in cart, booked, or a trip they can cancel.
_Avoid_: status, booking state

**Cart**:
The seats a user holds in this browser before booking; it lives only on the client and empties at logout.
_Avoid_: basket, selection

**Seat on hold**:
One launch in the cart, not booked yet.
_Avoid_: cart item, pending booking

**Checkout**:
The bar on the cart page that books every seat on hold at once.
_Avoid_: order, purchase
