#!/usr/bin/env bash
# Run pagegen in batches until dry-run shows no targets (or max batches).
set -euo pipefail

TOOL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KS_ROOT="$(cd "${TOOL_ROOT}/../.." && pwd)"
WRONG="${TOOL_ROOT}/docs/design/ux-audit/rule-pages"
RIGHT="${KS_ROOT}/docs/design/ux-audit/rule-pages"
MAX_BATCHES="${1:-7}"
BATCH_SIZE="${2:-10}"

sync_pages() {
  mkdir -p "${RIGHT}"
  if [[ -d "${WRONG}" ]]; then
    for f in "${WRONG}"/*.md; do
      [[ -f "${f}" ]] || continue
      cp -f "${f}" "${RIGHT}/$(basename "${f}")"
    done
  fi
}

cd "${TOOL_ROOT}"
npm run blend-rules >/dev/null

for ((b = 1; b <= MAX_BATCHES; b++)); do
  n="$(npm run pagegen -- --lane both --max-rules "${BATCH_SIZE}" --dry-run 2>/dev/null | grep -c '^{' || true)"
  if [[ "${n}" -eq 0 ]]; then
    echo "[batches] done — no targets after batch $((b - 1))"
    break
  fi
  echo "[batches] batch ${b}/${MAX_BATCHES} targets=${n}"
  npm run pagegen -- --lane both --max-rules "${BATCH_SIZE}" || true
  sync_pages
  npm run pagegen:manifest
done

sync_pages
npm run pagegen:manifest
remaining="$(npm run pagegen -- --dry-run 2>/dev/null | grep -c '^{' || true)"
echo "[batches] remaining targets=${remaining}"
ls "${RIGHT}"/*.md 2>/dev/null | grep -vE 'RULE_PAGE|README' | wc -l | xargs -I{} echo "[batches] md siblings={}"
