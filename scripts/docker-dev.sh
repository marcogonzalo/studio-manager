#!/bin/sh
# No TTY (Compose tty: false). Do not pipe stdin: `tail | next` leaves tail
# running after next dies, so this loop never relaunches. Closed stdin is OK
# when there is no PTY — Next only handleSessionStop() on SIGINT/SIGTERM.
set -eu

trap 'exit 0' TERM INT

while true; do
  set +e
  pnpm exec next dev --hostname 0.0.0.0
  status=$?
  set -e
  echo "next dev exited with ${status}; relaunching in 1s" >&2
  sleep 1
done
