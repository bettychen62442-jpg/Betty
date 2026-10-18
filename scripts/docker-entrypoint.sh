#!/bin/sh
set -eu

if [ "$(id -u)" = "0" ]; then
  mkdir -p /app/data/audio /app/data/images
  chown node:node /app/data /app/data/audio /app/data/images
  exec gosu node "$@"
fi

exec "$@"
