#!/usr/bin/env bash
# Drive per-file diagram-fence enrichment with isolated cursor-agent runs.
#
# Each file gets its own headless agent (no shared conversation context) so the
# enrichment is grounded only in that page's content, per the workspace
# low-token orchestration policy (cheap model does the footwork).
#
# Usage:
#   ./enrich-diagram-fences.sh <repo-root> [--model composer-2.5] [--max N] [--file REL.md] [--dry-run]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SPEC="$SCRIPT_DIR/ENRICHMENT-SPEC.md"
LIST="$SCRIPT_DIR/list-diagram-fences.py"

REPO=""
MODEL="composer-2.5"
MAX=0
ONLY_FILE=""
DRY_RUN=0

while [ $# -gt 0 ]; do
  case "$1" in
    --model) MODEL="$2"; shift 2 ;;
    --max) MAX="$2"; shift 2 ;;
    --file) ONLY_FILE="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    -*) echo "unknown flag: $1" >&2; exit 2 ;;
    *) REPO="$1"; shift ;;
  esac
done

if [ -z "$REPO" ] || [ ! -d "$REPO" ]; then
  echo "usage: $0 <repo-root> [--model M] [--max N] [--file REL.md] [--dry-run]" >&2
  exit 2
fi
REPO="$(cd "$REPO" && pwd)"

if ! command -v cursor-agent >/dev/null 2>&1; then
  echo "cursor-agent CLI not found on PATH" >&2
  exit 3
fi

mapfile -t FILES < <(python3 "$LIST" "$REPO" --pending-only | cut -f1)
if [ -n "$ONLY_FILE" ]; then
  FILES=("$ONLY_FILE")
fi

TOTAL=${#FILES[@]}
echo "[enrich] $TOTAL file(s) with pending fences in $REPO (model: $MODEL)"

COUNT=0
for rel in "${FILES[@]}"; do
  if [ "$MAX" -gt 0 ] && [ "$COUNT" -ge "$MAX" ]; then
    echo "[enrich] --max $MAX reached; stopping"
    break
  fi
  COUNT=$((COUNT + 1))
  echo "[enrich] ($COUNT/$TOTAL) $rel"
  if [ "$DRY_RUN" -eq 1 ]; then
    continue
  fi
  PROMPT="$(cat "$SPEC")

---

Target file: $rel

Open and read the whole file first. Apply the spec above to every pending
\`blueprint-diagram\` fence in this file only. Then stop."
  if ! cursor-agent -p --force --trust \
      --workspace "$REPO" \
      --model "$MODEL" \
      --output-format text \
      "$PROMPT" ; then
    echo "[enrich] agent run failed for $rel" >&2
  fi
  # Verify: the file should have no pending fences left
  remaining=$(python3 "$LIST" "$REPO" --pending-only | awk -F'\t' -v f="$rel" '$1 == f {print $2}')
  if [ -n "$remaining" ]; then
    echo "[enrich] WARNING: $rel still has pending fences" >&2
  fi
done

echo "[enrich] done. Status:"
python3 "$LIST" "$REPO" --pending-only | awk -F'\t' 'BEGIN{n=0}{n++}END{printf "  %d file(s) still pending\n", n}'
