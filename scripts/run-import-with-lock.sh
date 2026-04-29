#!/usr/bin/env sh
set -eu

LOCK_PATH="${LOCK_PATH:-/app/data/.import.lock}"
LOCK_DIR="${LOCK_PATH}.d"
LOG_DIR="/var/log/podcas"
LOG_FILE="${LOG_DIR}/import.log"

mkdir -p "$(dirname "$LOCK_PATH")" "$LOG_DIR"

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  NOW="$(date -Iseconds)"
  printf '%s import skipped: lock active at %s\n' "$NOW" "$LOCK_PATH" | tee -a "$LOG_FILE"
  exit 0
fi

cleanup() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

NOW="$(date -Iseconds)"
printf '%s import start\n' "$NOW" | tee -a "$LOG_FILE"

cd /app
npm run import:youtube -- --base-url "${BASE_URL:-http://web:3000}" --min-duration "${IMPORT_MIN_DURATION:-180}" 2>&1 | tee -a "$LOG_FILE"

NOW_END="$(date -Iseconds)"
printf '%s import end\n' "$NOW_END" | tee -a "$LOG_FILE"
