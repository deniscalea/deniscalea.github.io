#!/usr/bin/env bash
# Regenerează PDF-urile CV-ului (EN + RO) cu Edge headless.
# Rulează din Git Bash:  bash cv/build-pdf.sh   (din folderul site-cv)
set -euo pipefail

EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
DIR="$(cd "$(dirname "$0")" && pwd -W 2>/dev/null || pwd)"
OUT="$DIR/../assets"

for L in en ro; do
  UP=$(echo "$L" | tr a-z A-Z)
  "$EDGE" --headless=new --disable-gpu --no-pdf-header-footer \
    --virtual-time-budget=8000 --run-all-compositor-stages-before-draw \
    --print-to-pdf="$OUT/CV_Denis_Calin_$UP.pdf" "file:///$DIR/cv-$L.html"
  # Previzualizare PNG pentru site (A4 la 794×1123 px CSS, randat 2x)
  "$EDGE" --headless=new --disable-gpu --hide-scrollbars \
    --virtual-time-budget=8000 --force-device-scale-factor=2 --window-size=794,1123 \
    --screenshot="$OUT/cv-preview-$L.png" "file:///$DIR/cv-$L.html?print"
  echo "OK: CV_Denis_Calin_$UP.pdf, cv-preview-$L.png"
done
