#!/usr/bin/env bash
# render-syntra.sh — Render Syntra marketing videos from JSON timelines
# Usage: bash render-syntra.sh [START_INDEX] [END_INDEX]
# Default: renders all timelines
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
EXAMPLES="$ROOT/examples/syntra"
OUT="$ROOT/out/syntra"
PROPS_TMP="/tmp/syntra-render-props"

mkdir -p "$OUT" "$PROPS_TMP"

# Get sorted list of JSON files
mapfile -t FILES < <(ls "$EXAMPLES"/*.json | sort)
TOTAL=${#FILES[@]}

START=${1:-0}
END=${2:-$TOTAL}

if [ "$END" -gt "$TOTAL" ]; then
  END=$TOTAL
fi

echo "==========================================="
echo " Syntra Video Renderer"
echo " Total timelines: $TOTAL"
echo " Rendering: $START to $((END-1))"
echo "==========================================="

success=0
failed=0
skipped=0

for ((i=START; i<END; i++)); do
  FILE="${FILES[$i]}"
  BASENAME=$(basename "$FILE" .json)
  OUTPUT="$OUT/${BASENAME}.mp4"
  PROPS_FILE="$PROPS_TMP/${BASENAME}.json"

  # Skip if already rendered
  if [[ -f "$OUTPUT" ]]; then
    echo "SKIP  [$((i+1))/$END] $BASENAME (exists)"
    skipped=$((skipped+1))
    continue
  fi

  # Create props file
  python3 << PYTHON_EOF
import json, sys
with open("${FILE}") as f:
    tl = json.load(f)
with open("${PROPS_FILE}", 'w') as f:
    json.dump({'timeline': tl}, f)
PYTHON_EOF

  echo "RENDER [$((i+1))/$END] $BASENAME"

  if npx remotion render src/remotion/index.ts AgentComposition \
    --props="$PROPS_FILE" \
    --output "$OUTPUT" \
    --codec h264 \
    --image-format jpeg \
    --concurrency 50% \
    --log=error 2>&1 | grep -E "Rendered|Encoded|Error" | tail -3; then

    SIZE=$(ls -lh "$OUTPUT" 2>/dev/null | awk '{print $5}')
    echo "DONE   $BASENAME ($SIZE)"
    success=$((success+1))
  else
    echo "FAILED $BASENAME"
    failed=$((failed+1))
  fi
done

echo ""
echo "==========================================="
echo " Render complete: $success OK, $skipped skipped, $failed failed"
echo " Output: $OUT"
echo "==========================================="
