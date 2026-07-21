#!/usr/bin/env bash
# Verifica que el repo esté listo para push a GeolocalizacionSalud.
# No hace commit ni push — solo diagnóstico.

set -euo pipefail

REPO_URL="https://github.com/jtarapuez/GeolocalizacionSalud.git"
EXPECTED_USER="jtarapuez"
EXPECTED_EMAIL="tarapuez9@gmail.com"
BRANCH="main"

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "❌ No es un repositorio git."
  exit 1
}

cd "$ROOT"

echo "📁 Proyecto: $ROOT"
echo ""

# Identidad (solo lectura)
echo "👤 Git user.name:  $(git config user.name 2>/dev/null || echo '(no configurado)')"
echo "📧 Git user.email: $(git config user.email 2>/dev/null || echo '(no configurado)')"
echo ""

# Remoto
if git remote get-url origin &>/dev/null; then
  ORIGIN="$(git remote get-url origin)"
  echo "🔗 origin: $ORIGIN"
  if [[ "$ORIGIN" != *"jtarapuez/GeolocalizacionSalud"* ]]; then
    echo "⚠️  origin no apunta a GeolocalizacionSalud de jtarapuez."
  fi
else
  echo "⚠️  Sin remoto origin. Agregar con:"
  echo "   git remote add origin $REPO_URL"
fi
echo ""

# Rama
CURRENT="$(git branch --show-current)"
echo "🌿 Rama actual: ${CURRENT:-'(detached)'}"
if [[ "$CURRENT" != "$BRANCH" ]]; then
  echo "ℹ️  Rama principal esperada: $BRANCH"
fi
echo ""

# Estado
echo "📋 Estado:"
git status -sb
echo ""

# Commits pendientes de push
if git remote get-url origin &>/dev/null && git rev-parse --abbrev-ref "@{u}" &>/dev/null; then
  AHEAD="$(git rev-list --count "@{u}..HEAD" 2>/dev/null || echo 0)"
  BEHIND="$(git rev-list --count "HEAD..@{u}" 2>/dev/null || echo 0)"
  echo "⬆️  Commits por subir: $AHEAD"
  echo "⬇️  Commits por traer: $BEHIND"
else
  echo "ℹ️  Sin upstream configurado. Tras el primer push usar:"
  echo "   git push -u origin $BRANCH"
fi

echo ""
echo "✅ Diagnóstico listo. Ejecuta push solo cuando el usuario lo autorice."
