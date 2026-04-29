#!/usr/bin/env sh
set -eu

CRON_FILE="/etc/crontabs/root"
SCHEDULE="${SCHEDULE_CRON:-0 6 * * *}"
LOG_DIR="/var/log/podcas"

mkdir -p "$LOG_DIR"

if ! command -v yt-dlp >/dev/null 2>&1; then
  echo "scheduler error: yt-dlp not found"
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v ffprobe >/dev/null 2>&1; then
  echo "scheduler error: ffmpeg/ffprobe not found"
  exit 1
fi

cat > "$CRON_FILE" <<EOF
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
TZ=${TZ:-Europe/Madrid}

${SCHEDULE} /app/scripts/run-import-with-lock.sh >> /var/log/podcas/cron.log 2>&1
EOF

if [ "${RUN_ON_STARTUP:-false}" = "true" ]; then
  /app/scripts/run-import-with-lock.sh || true
fi

exec busybox crond -f -l 8 -L /var/log/podcas/cron.log
