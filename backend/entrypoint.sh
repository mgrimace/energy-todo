#!/bin/sh
set -e

PUID="${PUID:-10001}"
PGID="${PGID:-10001}"

# Started as root (the default): fix data dir ownership, then drop privileges.
if [ "$(id -u)" = "0" ]; then
  mkdir -p /app/data
  if [ "$(stat -c %u:%g /app/data)" != "$PUID:$PGID" ]; then
    chown -R "$PUID:$PGID" /app/data
  fi
  exec gosu "$PUID:$PGID" "$@"
fi

# Started as non-root (e.g. `user:` set in compose): just run.
exec "$@"