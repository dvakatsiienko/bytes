#!/usr/bin/env bash
# smoke.sh [port] [email] — every query and mutation once, against a running api.
# writes a user and a trip: point the server at a scratch DATABASE_URL first.
set -euo pipefail
PORT=${1:-4010}
EMAIL=${2:-smoke@example.com}
URL="localhost:${PORT}/"

gql() {
  local auth=${2:-}
  local out
  out=$(curl -sS -H 'content-type: application/json' ${auth:+-H "authorization: ${auth}"} "$URL" -d "$1")
  echo "$out"
  if jq -e '.errors' >/dev/null <<<"$out"; then echo "✗ graphql error" >&2; exit 1; fi
}

echo "▸ launches"
LAUNCHES=$(gql '{"query":"{ launches(pageSize: 2) { cursor hasMore list { id mission { name } rocket { name } } } }"}')
echo "$LAUNCHES"
ID=$(jq -r '.data.launches.list[0].id' <<<"$LAUNCHES")

echo "▸ launch(id)"
gql "$(jq -nc --arg id "$ID" '{query:"query($id:ID!){ launch(id:$id){ id isBooked mission { name missionPatch(size: SMALL) } } }",variables:{id:$id}}')"

echo "▸ login"
TOKEN=$(gql "$(jq -nc --arg e "$EMAIL" '{query:"mutation($e:String){ login(email:$e){ id email token } }",variables:{e:$e}}')" | tee /dev/stderr | jq -r '.data.login.token')

echo "▸ bookTrips"
TRIP=$(gql "$(jq -nc --arg id "$ID" '{query:"mutation($ids:[ID!]!){ bookTrips(launchIds:$ids){ id launch { id isBooked } } }",variables:{ids:[$id]}}')" "$TOKEN" | tee /dev/stderr | jq -r '.data.bookTrips[0].id')

echo "▸ userProfile"
gql '{"query":"{ userProfile { email trips { id launch { mission { name } } } } }"}' "$TOKEN"

echo "▸ cancelTrip"
gql "$(jq -nc --arg t "$TRIP" '{query:"mutation($t:ID!){ cancelTrip(tripId:$t) }",variables:{t:$t}}')" "$TOKEN"

echo "✓ smoke passed on :${PORT}"
