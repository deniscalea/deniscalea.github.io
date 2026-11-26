#!/usr/bin/env bash
# Randează imaginile din art/ în assets/img/ (PNG din Edge headless, apoi WebP prin canvas, cu tonul site-ului).
# Rulează din Git Bash, din folderul site-cv:  bash art/render.sh
# Doar câteva:  ONLY="seg7 og" bash art/render.sh
# Conversia WebP are nevoie de serverul local pe http://localhost:5173 (vezi CLAUDE.md).
set -euo pipefail

EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
DIR="$(cd "$(dirname "$0")" && pwd -W 2>/dev/null || pwd)"
ROOT="$DIR/.."
IMG="$ROOT/assets/img"
mkdir -p "$IMG"

# nume  lățime  înălțime  ieșire  parametri pentru to-webp (tone=duotone grafit/argint, inv=1 inversează hârtia deschisă)
JOBS=(
  "fpga-chip 1600 1200 img tone=1"
  "next-app 1600 1200 img tone=1"
  "waveform 1600 900 img inv=1"
  "seg7 1600 1000 img tone=1"
  "gates 1600 1100 img tone=1"
  "poster 1200 1600 img inv=1"
  "og 1200 630 og -"
)

shot() { # $1 html  $2 w  $3 h  $4 out.png
  "$EDGE" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --virtual-time-budget=6000 --run-all-compositor-stages-before-draw \
    --window-size="$2,$3" --screenshot="$4" "file:///$DIR/$1.html" 2>/dev/null
}

webp() { # $1 nume (din assets/img/*.png) -> assets/img/*.webp   $2 parametri
  "$EDGE" --headless=new --disable-gpu --virtual-time-budget=8000 --dump-dom \
    "http://localhost:5173/art/to-webp.html?src=../assets/img/$1.png&$2" 2>/dev/null \
    | sed -n 's/.*<pre id="out">data:image\/webp;base64,\([^<]*\)<\/pre>.*/\1/p' | base64 -d > "$IMG/$1.webp"
  [ -s "$IMG/$1.webp" ] || { echo "EROARE: $1.webp e gol (serverul local merge?)"; exit 1; }
}

for job in "${JOBS[@]}"; do
  read -r name w h kind opts <<< "$job"
  if [ -n "${ONLY:-}" ] && [[ " $ONLY " != *" $name "* ]]; then continue; fi
  if [ "$kind" = "og" ]; then
    shot "$name" "$w" "$h" "$ROOT/assets/og.png"
    echo "OK: assets/og.png"
  else
    shot "$name" "$w" "$h" "$IMG/$name.png"
    webp "$name" "$opts"
    rm -f "$IMG/$name.png"
    echo "OK: assets/img/$name.webp"
  fi
done
