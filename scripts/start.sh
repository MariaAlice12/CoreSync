#!/usr/bin/env bash
# Sobe o CoreSync completo (banco + API + site + túnel) e mostra o link público.
# Uso: ./scripts/start.sh [--demo]    (--demo carrega os dados de exemplo)
set -euo pipefail

cd "$(dirname "$0")/.."

DEMO=false
[ "${1:-}" = "--demo" ] && DEMO=true

die() { echo "Erro: $*" >&2; exit 1; }
rand() { openssl rand -hex "${1:-24}" 2>/dev/null || head -c "${1:-24}" /dev/urandom | od -An -tx1 | tr -d ' \n'; }

command -v docker >/dev/null || die "Docker não encontrado. Instale: https://docs.docker.com/engine/install/"
docker compose version >/dev/null 2>&1 || die "Docker Compose v2 não encontrado (comando 'docker compose')."
docker info >/dev/null 2>&1 || die "O Docker não está rodando (ou seu usuário não está no grupo 'docker')."

# ---- .env ----
set_env() { # set_env CHAVE valor  -> substitui ou acrescenta no .env
  if grep -q "^$1=" .env; then
    sed -i.bak "s|^$1=.*|$1=$2|" .env && rm -f .env.bak
  else
    printf '%s=%s\n' "$1" "$2" >> .env
  fi
}
get_env() { grep -E "^$1=" .env | tail -1 | cut -d= -f2- || true; }

if [ ! -f .env ]; then
  echo "==> Criando .env com senhas aleatórias"
  cp .env.example .env
  set_env DB_PASSWORD "$(rand 16)"
  set_env DB_ROOT_PASSWORD "$(rand 16)"
  set_env JWT_SECRET "$(rand 32)"
  set_env ADMIN_PASSWORD "$(rand 8)"
fi

# Site público: não aceitar os segredos de exemplo.
case "$(get_env JWT_SECRET)" in
  ''|troque-*) echo "==> Gerando JWT_SECRET (o atual é o de exemplo)"; set_env JWT_SECRET "$(rand 32)" ;;
esac
if [ -z "$(get_env ADMIN_EMAIL)" ]; then set_env ADMIN_EMAIL admin@coresync.local; fi
case "$(get_env ADMIN_PASSWORD)" in
  ''|troque-*) set_env ADMIN_PASSWORD "$(rand 8)" ;;
esac

WEB_DIR="$(get_env WEB_DIR)"; WEB_DIR="${WEB_DIR:-../CoreSyncWeb}"
WEB_PORT="$(get_env WEB_PORT)"
ADMIN_EMAIL="$(get_env ADMIN_EMAIL)"
ADMIN_PASSWORD="$(get_env ADMIN_PASSWORD)"

# ---- front ----
if [ ! -f "$WEB_DIR/package.json" ]; then
  echo "==> Front não encontrado em $WEB_DIR; clonando"
  git clone https://github.com/MariaAlice12/CoreSyncWeb.git "$WEB_DIR"
fi

# ---- sobe tudo ----
echo "==> Build e subida dos containers (a primeira vez demora alguns minutos)"
docker compose up -d --build --wait --wait-timeout 600 db api web
docker compose up -d tunnel

if $DEMO; then
  echo "==> Carregando dados de exemplo"
  docker compose --profile demo run --rm seed
fi

# ---- link público ----
echo "==> Aguardando o link público do túnel"
URL=""
for _ in $(seq 1 30); do
  URL=$(docker compose logs tunnel 2>/dev/null | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -1 || true)
  [ -n "$URL" ] && break
  sleep 2
done

echo
echo "============================================================"
if [ -n "$URL" ]; then
  echo " Link público (qualquer computador): $URL"
else
  echo " Link público ainda não apareceu. Veja com:"
  echo "   docker compose logs tunnel | grep trycloudflare"
fi
echo " Nesta máquina:                       http://localhost:${WEB_PORT:-8000}"
echo " Admin: ${ADMIN_EMAIL}  /  senha: ${ADMIN_PASSWORD}"
echo "   (o admin só é criado se o banco ainda não tiver nenhum)"
echo
echo " Parar:      docker compose stop"
echo " Novo link:  docker compose restart tunnel   (a URL muda)"
echo "============================================================"
