#!/usr/bin/env bash
# Atualização com Docker Compose: backup -> migrations -> API -> site.
# (O túnel continua no ar, então o link público não muda.)
# Uso: ./scripts/db-deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Arquivo .env não encontrado. Copie o .env.example e preencha." >&2
  exit 1
fi
DB_DATABASE=$(grep -E '^DB_DATABASE=' .env | tail -1 | cut -d= -f2- || true)

echo "==> Build das imagens"
docker compose build

echo "==> Subindo o MySQL"
docker compose up -d --wait db

# Backup antes de migrar (só se o banco já tiver tabelas).
TABLES=$(docker compose exec -T db sh -c \
  'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \"$MYSQL_DATABASE\""' 2>/dev/null)
if [ "${TABLES:-0}" -gt 0 ]; then
  mkdir -p backups
  FILE="backups/${DB_DATABASE:-coresync}-$(date +%Y%m%d-%H%M%S).sql.gz"
  echo "==> Backup em $FILE"
  docker compose exec -T db sh -c \
    'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines --triggers "$MYSQL_DATABASE"' \
    | gzip > "$FILE"
else
  echo "==> Banco vazio, pulando backup"
fi

echo "==> Aplicando migrations"
if ! docker compose run --rm migrate; then
  echo "Falha nas migrations. A API não foi atualizada." >&2
  [ -n "${FILE:-}" ] && echo "Para restaurar: gunzip -c $FILE | docker compose exec -T db sh -c 'mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" \"\$MYSQL_DATABASE\"'" >&2
  exit 1
fi

echo "==> Subindo a API e o site"
docker compose up -d --no-deps api
docker compose up -d --no-deps web

docker compose ps
