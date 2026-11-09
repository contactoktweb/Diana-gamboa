#!/usr/bin/env bash
# Aplica la estructura de la base de datos en un proyecto de Supabase.
#
#   SUPABASE_DB_URL="postgresql://postgres:CONTRASEÑA@db.xxxx.supabase.co:5432/postgres" \
#     ./scripts/configurar-base-de-datos.sh [correo-de-la-administradora]
#
# La cadena de conexión está en Supabase → Project Settings → Database → Connection string.
# Alternativa sin terminal: pegar supabase/esquema.sql en Supabase → SQL Editor y pulsar «Run».
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "Falta SUPABASE_DB_URL (cadena de conexión de la base de datos)." >&2
  exit 1
fi

echo "→ Aplicando supabase/esquema.sql…"
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q -f supabase/esquema.sql
echo "✓ Estructura lista."

if [ -n "${1:-}" ]; then
  echo "→ Dando acceso de administración a $1…"
  echo "select public.hacer_admin(:'correo');" | psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -tA -v correo="$1"
fi
