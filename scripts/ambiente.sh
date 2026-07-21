#!/bin/bash
AMBIENTE=$1
echo "🏥 IESS Salud - Cambiando a: $AMBIENTE"
pkill -f "ng serve" 2>/dev/null
sleep 2
case $AMBIENTE in
  "desarrollo"|"dev") ng serve --port 4200 & ;;
  "staging"|"stage") ng serve --configuration staging --port 4200 & ;;
  "produccion"|"prod") ng serve --configuration production --port 4200 & ;;
  *) echo "❌ Usa: desarrollo, staging o produccion"; exit 1 ;;
esac
echo "✅ Iniciando... http://localhost:4200"
