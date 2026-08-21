#!/bin/sh
# Keep next dev alive inside the container.
# Turbopack treats some bind-mount/watch events as a config change and
# process.exit(0). Compose restart: unless-stopped then rebuilds the whole
# container (~every minute). Relaunch Next here instead.
set -eu

term() {
  if [ -n "${child:-}" ]; then
    kill -TERM "$child" 2>/dev/null || true
    wait "$child" 2>/dev/null || true
  fi
  exit 0
}

trap term TERM INT

while true; do
  pnpm run dev &
  child=$!
  set +e
  wait "$child"
  status=$?
  set -e
  echo "next dev exited with ${status}; relaunching in 1s" >&2
  sleep 1
done
