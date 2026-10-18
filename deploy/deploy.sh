#!/usr/bin/env bash
# Deploys one image tag on the server: migrations -> new app container -> smoke /health.
# CI runs it after every push to main; rollback.sh runs it for a manual rollback.
# Never rolls back on its own: a failed step stops here and the script exits with an error.
#
# Usage: deploy.sh [--registry-user <name>] <image-tag>
#   --registry-user  log in to GHCR as <name> with a token read from stdin, only for this pull
set -euo pipefail

readonly IMAGE=ghcr.io/mvrlrd7/personal-crm
readonly APP_DIR="$HOME/personal-crm"
readonly ENV_FILE="$APP_DIR/.env"
readonly CURRENT_FILE="$APP_DIR/current-tag"
readonly PREVIOUS_FILE="$APP_DIR/previous-tag"
readonly HEALTH_URL=http://127.0.0.1:3000/health
readonly COMPOSE=(docker compose -p prod -f "$APP_DIR/deploy/compose.yml")

log() { printf '\n==> %s\n' "$*"; }
fail() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

registry_user=""
if [[ "${1:-}" == --registry-user ]]; then
  registry_user="${2:?--registry-user needs a name}"
  shift 2
fi
tag="${1:-}"
[[ "$tag" =~ ^[0-9a-f]{40}$ ]] || fail "usage: deploy.sh [--registry-user <name>] <commit-sha>"

[[ -f "$ENV_FILE" ]] || fail "$ENV_FILE is missing: create it as described in README.md"
[[ "$(stat -c %a "$ENV_FILE")" == 600 ]] || fail "$ENV_FILE must be readable by its owner only: chmod 600 $ENV_FILE"

export APP_TAG="$tag"
last_good=$(cat "$CURRENT_FILE" 2>/dev/null || true)
before_last_good=$(cat "$PREVIOUS_FILE" 2>/dev/null || true)

log "Image $IMAGE:$tag"
if docker image inspect "$IMAGE:$tag" >/dev/null 2>&1; then
  echo "already on the server"
elif [[ -n "$registry_user" ]]; then
  # Temporary credentials: the token lives only as long as this pull.
  docker_config=$(mktemp -d)
  trap 'rm -rf "$docker_config"' EXIT
  if ! output=$(docker --config "$docker_config" login ghcr.io -u "$registry_user" --password-stdin 2>&1); then
    fail "could not log in to GHCR: $output"
  fi
  docker --config "$docker_config" pull --quiet "$IMAGE:$tag"
  rm -rf "$docker_config"
else
  docker pull --quiet "$IMAGE:$tag"
fi

log "Database"
"${COMPOSE[@]}" up -d --wait crm-db

log "Migrations"
"${COMPOSE[@]}" run --rm -T crm-migrate </dev/null \
  || fail "migrations failed: the new image was not started, the running app was left as it was"

log "App"
"${COMPOSE[@]}" up -d --no-deps crm-app

log "Smoke check $HEALTH_URL"
# The app needs a few seconds to start, so early attempts may fail; only the last answer is shown.
healthy=false
for _ in $(seq 1 30); do
  if response=$(curl -fsS --max-time 5 "$HEALTH_URL" 2>&1); then
    healthy=true
    break
  fi
  sleep 2
done
echo "$response"
if ! $healthy; then
  "${COMPOSE[@]}" logs --tail 50 crm-app >&2 || true
  fail "smoke check failed: $HEALTH_URL did not answer 200. Nothing was rolled back. To go back to ${last_good:-the previous image} run: bash ~/personal-crm/deploy/rollback.sh"
fi

# Remember the last two good images; a redeploy of the same tag keeps the history as it is.
if [[ "$tag" != "$last_good" ]]; then
  previous="$last_good"
  [[ -n "$previous" ]] && echo "$previous" >"$PREVIOUS_FILE"
  echo "$tag" >"$CURRENT_FILE"
else
  previous="$before_last_good"
fi

log "Old images (keeping current and previous)"
docker image ls "$IMAGE" --format '{{.Tag}}' | while read -r old; do
  if [[ "$old" == "$tag" || "$old" == "$previous" || "$old" == "<none>" ]]; then
    continue
  fi
  if docker image rm "$IMAGE:$old" >/dev/null; then
    echo "removed $old"
  else
    echo "could not remove $old, left it"
  fi
done

log "Deployed $tag${previous:+ (previous: $previous)}"
