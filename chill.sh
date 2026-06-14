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
iterations=0
max_iterations=1000
while [ "$iterations" -lt "$max_iterations" ]; do
  iterations=$((iterations + 1))

  curl --fail --max-time 30 "https://api.flakehub.com/f/NixOS/nixpkgs/releases?offset=$offset" > "$scratch/releases.json"

  if jq --exit-status \
    --argjson chill_days "$chill_days" \
    --arg prefix "$prefix" \
    --from-file ./chill.jq \
    "$scratch/releases.json" > "$scratch/chilled.json"; then
    break
  fi

  offset=$(cat "$scratch/releases.json" | jq 'map(.index) | last')
  if [ -z "$offset" ] || [ "$offset" = "null" ]; then
    echo "Reached end of pagination without finding a chilled release" >&2
    exit 1
  fi
done

if [ "$iterations" -ge "$max_iterations" ]; then
  echo "Exceeded maximum pagination iterations ($max_iterations) without finding a chilled release" >&2
  exit 1
fi

if [ ! -s "$scratch/chilled.json" ]; then
  echo "::error::No matching release found after successful jq filter (empty output)" >&2
  exit 1
fi

jq -r --slurp 'first' "$scratch/chilled.json"
jq -r --slurp 'first | "revision=" +.revision' "$scratch/chilled.json" >> "$GITHUB_OUTPUT"

