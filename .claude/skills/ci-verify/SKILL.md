---
name: ci-verify
description: Load BEFORE verifying a change to bytes ci — the workflows and scripts under `.github` — «verify a workflow», «deploy.yml», «preview.yml», «pull_request_target», «workflow_run», a guard script, a jq filter in ci, a sixth sense round on a ci pr.
---

# ci-verify

prove a ci change against what github really sends, not against how the yaml reads. the deploy shape and the `[skip ci]` hazards: see `docs/agents/deploy.md`.

## scripts and guards

- a guard fix's test runs against main's copy of the script, not the branch's (BYT-100 sixth sense)
- a script's jq filter is pulled out and fed crafted inputs (BYT-95 sixth sense)
- a fake of a remote read honours its arguments, or the arguments get a mutant of their own (BYT-130 sixth sense)
- a rewrite after a clean voids its live proofs: each one reruns on the head's code (BYT-130 sixth sense)

## events

- a workflow event field is checked against real run history: `gh api repos/dvakatsiienko/bytes/actions/runs --jq '.workflow_runs[] | {event, head_branch, head_sha}'` (BYT-95 sixth sense)
- a read script runs free against real statuses from the mac: `DEADLINE_SECONDS=0 .github/scripts/deploy-read.sh` (BYT-130 sixth sense)

## secrets

- every program that runs while a secret is in scope is run once against a planted tree with a fake secret (BYT-96 sixth sense)
- a `pull_request_target` job is audited per job, not per step (BYT-96 sixth sense)
