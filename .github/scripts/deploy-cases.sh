#!/usr/bin/env bash
# Proves the Deploy scripts against saved status rows, with fake `gh`, `curl` and
# `npx` on PATH, so no case reads github or fires a hook. A planted git repo
# stands in for the checkout. The rows copy the real `Vercel – <app>` statuses
# of f73efd09, the 2026-11-04 node 26 push: 6 errored while Deploy read green.
set -euo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
echo "  jq $(jq --version)"

work=$(mktemp -d)
mkdir -p "$work/bin"
failed=0

FIRE=2026-11-04T09:24:00Z
DONE='Deployment has completed'
BUILDING='Vercel is deploying your app'
ERRORED='Deployment has failed — run this Vercel CLI command: npx vercel inspect dpl_u1UcMVawqqoZjsnXo2sJd4y98qC6 --logs'
# Inference: no real row exists. main's last 100 commits hold no vercel cancel,
# and vercel keeps no canceled deployment to read one from (2026-11-06).
CANCELED='Deployment has been canceled'
ALL_APPS='cv figmentation financial space-explorer-ui trophy-sys x-com-chat'

# Each call answers the next saved history; the last one repeats. Like github, a
# rev that names a commit starts the history there, so its descendants are out.
cat >"$work/bin/gh" <<'EOF'
#!/usr/bin/env bash
[ ! -e "$FAKE/gh-down" ] || { echo 'HTTP 502' >&2; exit 1; }
echo x >>"$FAKE/gh-calls"
n=$(wc -l <"$FAKE/gh-calls" | tr -d ' ')
[ -e "$FAKE/history.$n.json" ] || n=$(cat "$FAKE/history-last")
rev=main
for arg in "$@"; do
  case "$arg" in rev=*) rev=${arg#rev=} ;; esac
done
jq --arg rev "$rev" '.data.repository.object.history.nodes |=
  ((map(.oid) | index($rev)) as $i | if $i then .[$i:] else . end)' "$FAKE/history.$n.json"
EOF
# Answers the way turbo does: a root lockfile marks all, an app path marks its app.
cat >"$work/bin/npx" <<'EOF'
#!/usr/bin/env bash
[ ! -e "$FAKE/npx-down" ] || exit 1
changed=$(git diff --name-only "$TURBO_SCM_BASE" HEAD)
for f in apps/*/package.json; do
  dir=$(dirname "$f")
  if grep -q '^pnpm-lock.yaml$' <<<"$changed" || grep -q "^$dir/" <<<"$changed"; then
    jq -n --arg p "$(jq -r .name "$f")" '{package: $p, command: "build"}'
  fi
done | jq -s '{tasks: (. + [{package: "no-build", command: "<NONEXISTENT>"}])}'
EOF
cat >"$work/bin/curl" <<'EOF'
#!/usr/bin/env bash
echo "${!#}" >>"$FAKE/fired"
echo '{"job":{"id":"job1","state":"PENDING"}}'
EOF
chmod +x "$work/bin/"*

export PATH="$work/bin:$PATH" GH_TOKEN=fake REPO=owner/repo
export GIT_AUTHOR_NAME=case GIT_AUTHOR_EMAIL=case@example.com GIT_COMMITTER_NAME=case GIT_COMMITTER_EMAIL=case@example.com

# Every case gets its own empty state.
reset() {
  fake=$(mktemp -d "$work/state.XXXXXX")
  export FAKE=$fake
}

# One history per argument list, newest commit first: `sha|app|STATE|description|createdAt`.
# `sha||||` is a commit with no status.
history() {
  local n=$1
  shift
  printf '%s\n' "$@" | jq -Rn '[inputs | split("|")] as $rows
    | {data: {repository: {object: {history: {nodes: [
        $rows | map(.[0]) | reduce .[] as $s ([]; if index($s) then . else . + [$s] end) | .[]
        | . as $sha | {oid: $sha, status: {contexts: [
            $rows[] | select(.[0] == $sha and .[1] != "")
            | {context: ("Vercel – " + .[1]), state: .[2], description: .[3], createdAt: .[4],
               targetUrl: ("https://vercel.example/" + .[1])}
          ]}}
      ]}}}}}' >"$fake/history.$n.json"
  echo "$n" >"$fake/history-last"
}

# Railway's row on the same commit must never count: it shares the words, not the context.
plant_railway() {
  jq '.data.repository.object.history.nodes[0].status.contexts += [{
    context: "space-explorer-api - space-explorer-api", state: "ERROR",
    description: "Deployment cancelled", createdAt: "2026-11-04T09:25:00Z", targetUrl: "x"}]' \
    "$fake/history.1.json" >"$fake/h" && mv "$fake/h" "$fake/history.1.json"
}

# check <name> <want exit> <text the output must hold, or -> [text it must not hold]
# Reads `$got` and `$out`, which the step helpers set.
check() {
  local name=$1 want=$2 needle=$3 absent=${4:-}
  if [ "$got" != "$want" ] ||
    { [ "$needle" != - ] && ! grep -qF -- "$needle" <<<"$out"; } ||
    { [ -n "$absent" ] && grep -qF -- "$absent" <<<"$out"; }; then
    echo "FAIL $name: exit $got wanted $want, text «$needle»"
    sed 's/^/    /' <<<"$out"
    failed=1
  else
    echo "  ok $name"
  fi
}

read_step() {
  got=0
  out=$(COMMIT=$1 APPS=$2 FIRED_AT=$FIRE DEADLINE_SECONDS=${3:-0} POLL_SECONDS=0 \
    "$here/deploy-read.sh" 2>&1) || got=$?
}

# --- the read step

reset
history 1 "c1|cv|FAILURE|$ERRORED|2026-11-04T09:24:36Z" "c1|figmentation|SUCCESS|$DONE|2026-11-04T09:25:00Z"
read_step c1 'cv figmentation'
check 'an errored app reds the run and is named' 1 'cv — Error' 'figmentation — Error'

reset
history 1 "c1|cv|SUCCESS|$DONE|2026-11-04T09:28:51Z" "c1|figmentation|SUCCESS|$DONE|2026-11-04T09:29:28Z"
plant_railway
read_step c1 'cv figmentation'
check 'all apps Ready is green, and railway does not count' 0 'cv — Ready' 'Error'

reset
read_step c1 ''
check 'nothing to deploy is green with no vercel read' 0 'nothing deployed'
[ ! -e "$fake/gh-calls" ] || { echo 'FAIL nothing to deploy still read github'; failed=1; }

reset
history 1 "c1|cv|PENDING|$BUILDING|2026-11-04T09:24:23Z"
read_step c1 cv
check 'still building past the deadline is red' 1 'cv — still building'

reset
history 1 "c1|cv|FAILURE|$CANCELED|2026-11-04T09:25:00Z"
read_step c1 cv
check 'a Canceled deploy is red and named' 1 'cv — Canceled'

reset
history 1 "c2|cv|SUCCESS|$DONE|2026-11-04T09:28:51Z" "c1||||"
read_step c1 cv
check 'a status on a descendant commit counts' 0 'cv — Ready'

reset
history 1 "c2||||" "c1|cv|SUCCESS|$DONE|2026-11-04T09:28:51Z"
read_step c1 cv
check 'Ready on this commit counts after main moved on' 0 'cv — Ready'

reset
history 1 "c2|cv|SUCCESS|$DONE|2026-11-04T09:28:51Z" "c1|cv|FAILURE|$CANCELED|2026-11-04T09:25:00Z"
read_step c1 cv
check 'a descendant outranks a cancel on this commit' 0 'cv — Ready'

reset
history 1 "c2|cv|SUCCESS|$DONE|2026-11-04T09:28:51Z" "c1||||" "c0|figmentation|SUCCESS|$DONE|2026-11-04T09:25:00Z"
read_step c1 figmentation
check 'an ancestor status does not count, and main moved on: superseded is green' 0 'figmentation — superseded'

reset
history 1 "c2||||" "c1||||"
got=0
out=$(GITHUB_EVENT_NAME=workflow_dispatch COMMIT=c1 APPS=cv FIRED_AT=$FIRE DEADLINE_SECONDS=0 POLL_SECONDS=0 \
  "$here/deploy-read.sh" 2>&1) || got=$?
check 'a manual run with no record is red even when main moved on' 1 'cv — no record'

reset
history 1 "c2||||" "c1|cv|FAILURE|$CANCELED|2026-11-04T09:25:00Z"
read_step c1 cv
check 'a cancel with a later push and no later status is still red' 1 'cv — Canceled'

reset
history 1 "c1|cv|FAILURE|$CANCELED|2026-11-04T09:25:00Z"
history 2 "c1|cv|SUCCESS|$DONE|2026-11-04T09:25:30Z"
read_step c1 cv 30
check 'a cancel then Ready on one commit is green' 0 'cv — Ready'

reset
history 1 "c1|cv|FAILURE||2026-11-04T09:25:00Z"
jq '.data.repository.object.history.nodes[0].status.contexts[0].description = null' \
  "$fake/history.1.json" >"$fake/h" && mv "$fake/h" "$fake/history.1.json"
read_step c1 cv
check 'a failed status with a null description is red' 1 'cv — Error'

reset
echo '{"data":{"repository":{"object":{"history":{"nodes":[{"oid":"c1","status":{"contexts":[{"context":"Vercel – cv","state":"FAILURE","createdAt":"2026-11-04T09:25:00Z","description":3,"targetUrl":"x"}]}}]}}}}}' >"$fake/history.1.json"
echo 1 >"$fake/history-last"
read_step c1 cv
check 'a status jq cannot read is red, never green' 1 'cv — unreadable'

reset
history 1 "c1|cv|SUCCESS|$DONE|2026-11-04T09:20:00Z"
read_step c1 cv
check 'a status older than the fire is no record' 1 'cv — no record'

reset
history 1 "c1||||"
read_step c1 cv
check 'no record on the tip is red' 1 'cv — no record'

reset
history 1 "c1|cv|PENDING|$BUILDING|2026-11-04T09:24:23Z"
history 2 "c1|cv|SUCCESS|$DONE|2026-11-04T09:28:51Z"
read_step c1 cv 30
check 'it waits through pending to Ready' 0 'cv — Ready'

reset
touch "$fake/gh-down"
read_step c1 cv
check 'a status read that never answers is red' 1 'could not read'

# --- the base and the hooks, in a planted checkout

repo=$work/repo
mkdir -p "$repo"
cd "$repo"
git init -q -b main
echo '{"devDependencies":{"turbo":"2.10.12"}}' >package.json
for app in $ALL_APPS; do
  mkdir -p "apps/$app"
  echo '{}' >"apps/$app/vercel.json"
  echo "{\"name\":\"pkg-$app\"}" >"apps/$app/package.json"
done
commit() { echo "$1" >>"$2" && git add . && git commit -qm "$1" && git rev-parse HEAD; }
p0=$(commit p0 pnpm-lock.yaml)
p1=$(commit p1 pnpm-lock.yaml)
p2=$(commit p2 docs.txt)
p3=$(commit p3 docs.txt)
p4=$(commit p4 docs.txt)

hooks=$(jq -n --arg a "$ALL_APPS" '$a | split(" ") | map({key: ., value: ("https://hook.example/" + .)}) | from_entries')

base_step() {
  got=0
  out=$(COMMIT=$1 "$here/deploy-base.sh" 2>&1 >"$fake/base-output") || got=$?
  bases=$(sed -n 's/^bases=//p' "$fake/base-output")
}

main_step() {
  got=0
  out=$(BASES=${1:-} REQUESTED=${2:-} HOOKS=$hooks GITHUB_OUTPUT=$fake/output "$here/deploy-main.sh" 2>&1) || got=$?
  fired=$(sed 's|.*/||' "$fake/fired" 2>/dev/null | sort | tr '\n' ' ' || true)
}

want_fired() {
  [ "$fired" = "$2" ] && echo "  ok $1" || { echo "FAIL $1: fired «$fired», wanted «$2»"; failed=1; }
}

want_base() {
  local app=$2 sha=$3 have
  have=$(jq -r --arg a "$app" '.[$a] // ""' <<<"$bases")
  [ "$have" = "$sha" ] && echo "  ok $1" || { echo "FAIL $1: $app base «$have», wanted «$sha»"; failed=1; }
}

rows() { # rows <sha> <STATE> <description> <createdAt> <apps…>
  local sha=$1 state=$2 desc=$3 at=$4 app
  shift 4
  for app in "$@"; do printf '%s|%s|%s|%s|%s\n' "$sha" "$app" "$state" "$desc" "$at"; done
}

# One app fails across 3 pushes: only it refires, the others hold their base.
reset
healthy='figmentation financial space-explorer-ui trophy-sys x-com-chat'
p0_rows=$(rows "$p0" SUCCESS "$DONE" 2026-11-04T08:00:00Z $ALL_APPS)
p1_healthy=$(rows "$p1" SUCCESS "$DONE" 2026-11-04T09:00:00Z $healthy)
p1_failed=$(rows "$p1" FAILURE "$ERRORED" 2026-11-04T09:00:00Z cv)
known="$p1_healthy
$p1_failed
$p0_rows"
for p in "$p2" "$p3" "$p4"; do
  known="$p||||
$known"
  IFS=$'\n' read -r -d '' -a lines <<<"$known" || true
  history 1 "${lines[@]}"
  base_step "$p"
  want_base 'a failed app keeps its last Ready commit' cv "$p0"
  for app in $healthy; do want_base "healthy $app holds its base" "$app" "$p1"; done
  git checkout -q "$p"
  : >"$fake/fired"
  main_step "$bases"
  want_fired "only the failed app refires on $(git log -1 --format=%s)" 'cv '
  known="$p|cv|FAILURE|$ERRORED|2026-11-04T10:00:00Z
${known#*$'\n'}"
done
git checkout -q main

reset
history 1 "$p1|cv|SUCCESS|$DONE|2026-11-04T09:00:00Z" "$p0|cv|SUCCESS|$DONE|2026-11-04T08:00:00Z"
base_step "$p1"
want_base 'the newest Ready commit is the base' cv "$p1"

reset
history 1 "$p2|cv|SUCCESS|$DONE|2026-11-04T10:00:00Z" "$p1|cv|SUCCESS|$DONE|2026-11-04T09:00:00Z"
base_step "$p1"
want_base 'a Ready commit after this one is no base' cv "$p1"

reset
history 1 "$p1|cv|SUCCESS|$DONE|2026-11-04T09:00:00Z"
base_step "$p1"
main_step "$bases"
want_fired 'an app with no Ready commit in reach deploys' 'figmentation financial space-explorer-ui trophy-sys x-com-chat '

reset
touch "$fake/gh-down"
base_step "$p1"
check 'a failed base read fails open' 0 'deploying every app'
[ "$bases" = '{}' ] && echo '  ok a failed base read answers no bases' || { echo "FAIL bases «$bases»"; failed=1; }
main_step "$bases"
want_fired 'no bases deploys every app' 'cv figmentation financial space-explorer-ui trophy-sys x-com-chat '

reset
main_step '{"cv":"0000000000000000000000000000000000000000","figmentation":"'"$p4"'","financial":"'"$p4"'","space-explorer-ui":"'"$p4"'","trophy-sys":"'"$p4"'","x-com-chat":"'"$p4"'"}'
want_fired 'a base git cannot resolve deploys that app alone' 'cv '

reset
same=$(jq -n --arg s "$p4" --arg a "$ALL_APPS" '$a | split(" ") | map({key: ., value: $s}) | from_entries')
main_step "$same"
want_fired 'nothing affected fires nothing' ''
grep -qx 'apps=' "$fake/output" && echo '  ok nothing affected hands the read no apps' || { echo 'FAIL apps output'; cat "$fake/output"; failed=1; }

reset
main_step '' cv
want_fired 'a manual run deploys the pick' 'cv '
grep -qx 'apps=cv' "$fake/output" && echo '  ok a manual run hands the read its pick' || { echo 'FAIL manual apps output'; failed=1; }
grep -q '^fired_at=20' "$fake/output" && echo '  ok the fire time reaches the read' || { echo 'FAIL fired_at'; failed=1; }

# A turbo that fails stops the run before any hook fires.
reset
touch "$fake/npx-down"
main_step "$same"
check 'a failed turbo reds the run' 1 -
want_fired 'a failed turbo fires no hook' ''

# A broken turbo pin stops a diff, never the deploy that needs no diff.
reset
cp package.json "$fake/package.json"
echo '{"devDependencies":{"turbo":"^2"}}' >package.json
main_step '{}'
want_fired 'no base needs no turbo pin' 'cv figmentation financial space-explorer-ui trophy-sys x-com-chat '
main_step "$same"
check 'a range in the turbo pin reds a diff' 1 'not an exact version'
cp "$fake/package.json" package.json

# --- 2026-11-04 replayed: 6 errored, the read reds, the next push retries those 6

reset
at=2026-11-04T09:24:36Z
p0_rows=$(rows "$p0" SUCCESS "$DONE" 2026-11-04T08:00:00Z $ALL_APPS)
p1_rows=$(rows "$p1" FAILURE "$ERRORED" "$at" $ALL_APPS)
IFS=$'\n' read -r -d '' -a lines <<<"$p1_rows
$p0_rows" || true
history 1 "${lines[@]}"
read_step "$p1" "$ALL_APPS"
check '11-04 replay: the run is red' 1 'x-com-chat — Error'
for app in $ALL_APPS; do
  grep -qF "$app — Error" <<<"$out" || { echo "FAIL 11-04 replay did not name $app"; failed=1; }
done
reset
history 1 "${lines[@]}"
base_step "$p1"
git checkout -q "$p2"
main_step "$bases"
want_fired '11-04 replay: the next push retries those 6' 'cv figmentation financial space-explorer-ui trophy-sys x-com-chat '
check '11-04 replay: the hooks alone read green, so the read is what reds' 0 -
git checkout -q main

# --- the workflow wires it

cd "$here/../.."
# Grep, since no case runs a workflow: losing one of these reads green over a failed deploy.
for wire in 'statuses: read' 'id: deploy' 'APPS: ${{ steps.deploy.outputs.apps }}' \
  'FIRED_AT: ${{ steps.deploy.outputs.fired_at }}' 'run: .github/scripts/deploy-read.sh'; do
  grep -qF "$wire" .github/workflows/deploy.yml && echo "  ok deploy.yml holds $wire" ||
    { echo "FAIL deploy.yml lost $wire"; failed=1; }
done
job_minutes=$(sed -n 's/^    timeout-minutes: //p' .github/workflows/deploy.yml)
deadline=$(sed -n 's/^deadline=${DEADLINE_SECONDS:-\([0-9]*\)}$/\1/p' "$here/deploy-read.sh")
[ "${deadline:-9999}" -lt "$((job_minutes * 60))" ] && echo "  ok the ${deadline}s deadline sits under the job's ${job_minutes} min" ||
  { echo "FAIL deadline «$deadline» is not under the job's «$job_minutes» min"; failed=1; }

[ "$failed" = 0 ] && echo 'all deploy cases pass'
exit "$failed"
