#!/usr/bin/env bash
# Manual rollback, run by a person, never by CI: starts the last good image again.
# If the last deploy failed its smoke check, that is the image that was running before it;
# otherwise it is the previous one.
#
# Usage: bash ~/personal-crm/deploy/rollback.sh
set -euo pipefail

readonly APP_DIR="$HOME/personal-crm"

current=$(cat "$APP_DIR/current-tag" 2>/dev/null || true)
previous=$(cat "$APP_DIR/previous-tag" 2>/dev/null || true)
running=$(docker ps --filter label=com.docker.compose.project=prod \
  --filter label=com.docker.compose.service=crm-app --format '{{.Image}}')
running="${running##*:}"

if [[ -n "$current" && "$running" != "$current" ]]; then
  target="$current"
elif [[ -n "$previous" ]]; then
  target="$previous"
else
  echo "Nothing to roll back to: no previous image recorded" >&2
  exit 1
fi

echo "==> Rolling back from ${running:-nothing} to $target"
exec bash "$APP_DIR/deploy/deploy.sh" "$target"
