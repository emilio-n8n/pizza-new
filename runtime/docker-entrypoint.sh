#!/bin/sh
set -e

mkdir -p "$DATA_DIR/tenants/default/audio"

if [ ! -f "$DATA_DIR/tenants/default/program.json" ]; then
  echo "Seed du programme par défaut dans $DATA_DIR"
  cp /app/seed/program.json "$DATA_DIR/tenants/default/program.json"
  cp /app/seed/meta.json "$DATA_DIR/tenants/default/meta.json" 2>/dev/null || true
fi

exec "$@"
