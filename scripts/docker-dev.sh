#!/bin/sh
# Do not background next. `cmd &` gives it EOF on stdin; Next 16 then
# handleSessionStop() and process.exit(0) immediately after "Ready".
set -eu

trap 'exit 0' TERM INT HUP

while true; do
  set +e
  pnpm exec next dev --hostname 0.0.0.0
  status=$?
  set -e
  echo "next dev exited with ${status}; relaunching in 1s" >&2
  sleep 1
done
