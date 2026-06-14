#!/usr/bin/env bash

set -eux

prefix=$1
chill_days=7

if [ -z "${GITHUB_OUTPUT+x}" ] || [ -z "$GITHUB_OUTPUT" ]; then
  GITHUB_OUTPUT=/dev/stdout
fi

scratch=$(mktemp -d -t tmp.XXXXXXXXXX)
function finish {
  rm -rf "$scratch"
}
trap finish EXIT

offset=0
while true; do
  curl "https://api.flakehub.com/f/NixOS/nixpkgs/releases?offset=$offset" > "$scratch/releases.json"
  offset=$(cat "$scratch/releases.json" | jq 'map(.index) | last')

  if jq --exit-status \
    --argjson chill_days "$chill_days" \
    --arg prefix "$prefix" \
    --from-file ./chill.jq \
    "$scratch/releases.json" > "$scratch/chilled.json"; then
    break
  fi
done

if [ -s "$scratch/chilled.json" ]; then
jq -r --slurp 'first' "$scratch/chilled.json"
  jq -r --slurp 'first | "revision=" +.revision' "$scratch/chilled.json" >> "$GITHUB_OUTPUT"
fi
