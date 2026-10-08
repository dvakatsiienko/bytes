#!/usr/bin/env bash
# Fails when the given file holds a CI-skip marker. Two callers read this one
# list: lefthook's commit-msg hook (a local commit message) and
# `skip-marker.yml` (a PR's title and body, which become the squash message on
# github.com, where no hook runs).
#
# The list is GitHub's documented set, read from their docs rather than
# recalled: the five bracketed forms plus the unbracketed `skip-checks:true`
# trailer. `***NO_CI***` is NOT one of them — that is Travis.
set -euo pipefail

[ -r "${1:-}" ] || { echo "usage: skip-marker.sh <file>" >&2; exit 2; }

if hits=$(grep -oiE '\[(skip[ -]?(ci|actions)|(ci|actions)[ -]?skip|no[ -]?ci)\]|skip-checks:[[:space:]]*true' "$1"); then
  echo "found: $(tr '\n' ' ' <<<"$hits")"
  echo "a CI-skip marker would stop deploy.yml — the only thing that deploys production. Write «the skip directive» in prose instead of the bracketed or skip-checks form."
  exit 1
fi
