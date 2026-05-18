#!/usr/bin/env bash
# Run a post-clean AI-assisted UX audit using Cursor CLI agent in small bounded batches.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_BATCHES="${SCRIPT_DIR}/build-ai-audit-batches.mjs"
AGGREGATE_RESULTS="${SCRIPT_DIR}/aggregate-ai-audit-results.mjs"

REPO_ROOT="${1:-.}"
OUT_DIR="${2:-}"
STANDARD_PATH="${3:-}"

if [[ -z "$OUT_DIR" ]]; then
  echo "usage: $0 [REPO_ROOT] [AUDIT_OUT_DIR] [DESIGN_STANDARD_PATH]" >&2
  exit 2
fi

cd "$REPO_ROOT"
REPO_ROOT="$(pwd)"
OUT_DIR="$(cd "$OUT_DIR" && pwd)"

if [[ ! -f "${OUT_DIR}/audit-data.json" ]]; then
  echo "cursor-agent-run-ux-audit: missing ${OUT_DIR}/audit-data.json" >&2
  exit 1
fi
if ! command -v agent >/dev/null 2>&1; then
  echo "cursor-agent-run-ux-audit: Cursor CLI agent not found on PATH" >&2
  exit 1
fi

AI_OUT_DIR="${OUT_DIR}/ai-audit"
TRANSCRIPTS_DIR="${AI_OUT_DIR}/transcripts"
mkdir -p "$TRANSCRIPTS_DIR"

AI_BATCH_SIZE="${FORGE_UX_AI_AUDIT_BATCH_SIZE:-5}"
AI_MAX_BATCHES="${FORGE_UX_AI_AUDIT_MAX_BATCHES:-0}"
AI_LOG="${FORGE_UX_AI_AUDIT_LOG:-${AI_OUT_DIR}/ai-audit-agent.log}"
EXTRA_FLAGS=()
if [[ -n "${FORGE_UX_AI_AUDIT_AGENT_EXTRA:-}" ]]; then
  read -r -a EXTRA_FLAGS <<< "${FORGE_UX_AI_AUDIT_AGENT_EXTRA}"
elif [[ -n "${FORGE_UX_CURSOR_AGENT_EXTRA:-}" ]]; then
  read -r -a EXTRA_FLAGS <<< "${FORGE_UX_CURSOR_AGENT_EXTRA}"
fi

echo "cursor-agent-run-ux-audit: repo=${REPO_ROOT}" >&2
echo "cursor-agent-run-ux-audit: audit_out=${OUT_DIR}" >&2
echo "cursor-agent-run-ux-audit: ai_out=${AI_OUT_DIR}" >&2
echo "cursor-agent-run-ux-audit: batch_size=${AI_BATCH_SIZE}" >&2
if [[ -n "$AI_LOG" ]]; then
  mkdir -p "$(dirname "$AI_LOG")"
  : >>"$AI_LOG"
  echo "cursor-agent-run-ux-audit: combined transcript → ${AI_LOG}" >&2
fi

MANIFEST_PATH="$(
  node "$BUILD_BATCHES" \
    --repo "$REPO_ROOT" \
    --audit "${OUT_DIR}/audit-data.json" \
    --out "$AI_OUT_DIR" \
    --standard "$STANDARD_PATH" \
    --batch-size "$AI_BATCH_SIZE"
)"

mapfile -t BATCH_PATHS < <(
  node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); for (const b of (p.batches||[])) console.log(b.path);" "$MANIFEST_PATH"
)

if [[ "$AI_MAX_BATCHES" =~ ^[0-9]+$ ]] && [[ "$AI_MAX_BATCHES" -gt 0 ]] && [[ "${#BATCH_PATHS[@]}" -gt "$AI_MAX_BATCHES" ]]; then
  BATCH_PATHS=( "${BATCH_PATHS[@]:0:$AI_MAX_BATCHES}" )
  node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); const keep=new Set(process.argv.slice(2)); p.batches=(p.batches||[]).filter((b)=>keep.has(b.path)); fs.writeFileSync(process.argv[1], JSON.stringify(p,null,2)+'\n');" "$MANIFEST_PATH" "${BATCH_PATHS[@]}"
fi

batch_index=0
batch_failures=0
for rel_batch in "${BATCH_PATHS[@]}"; do
  batch_file="${AI_OUT_DIR}/${rel_batch}"
  batch_id="$(basename "$batch_file" .json)"
  transcript="${TRANSCRIPTS_DIR}/${batch_id}.log"
  batch_index=$((batch_index + 1))

  urls="$(node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log((j.urls||[]).join('\n'));" "$batch_file")"
  likely_files="$(node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log((j.likelySourceFiles||[]).join('\n'));" "$batch_file")"

  PROMPT="Repository root: ${REPO_ROOT}

This is a post-clean AI-assisted UX audit batch. The deterministic Forge UX audit already found zero Major+ issues overall.

Read this batch specification JSON:
${batch_file}

Your task:
1. Audit only the URLs listed in the batch spec.
2. Inspect those live pages and likely source files from the repo to catch issues the deterministic rules may have missed.
3. Focus on specific guardrails: narrative clarity, information architecture, visual slot quality, trust/governance cues, CTA clarity, semantic accessibility, metadata, docs-vs-landing-shell mismatch, and handbook chrome leakage.
4. Be concrete and evidence-based. Do not invent product capabilities.
5. Prefer findings that are new or materially more specific than the deterministic findings in the batch spec.

URLs in this batch:
${urls}

Likely source files:
${likely_files}

Return ONLY one JSON object (a fenced JSON block is also acceptable) with this schema:
{
  \"summary\": \"short paragraph\",
  \"inspectedUrls\": [\"...\"],
  \"findings\": [
    {
      \"url\": \"https://...\",
      \"severity\": \"major|critical|blocker|minor|trivial|cosmetic|warn\",
      \"guardrail\": \"short guardrail name\",
      \"title\": \"one-line issue title\",
      \"evidence\": \"what you saw in the page or file\",
      \"whyMissedByDeterministic\": \"why a rules pass may have missed this\",
      \"sourceFiles\": [\"relative/path.md\"],
      \"confidence\": \"high|medium|low\",
      \"remediation\": \"short fix guidance\"
    }
  ]
}"

  echo "[ux-ai-audit] phase=batch_begin · batch=${batch_id} · idx=${batch_index}/${#BATCH_PATHS[@]}" >&2
  set +e
  if [[ -n "$AI_LOG" ]]; then
    agent -p --trust "${EXTRA_FLAGS[@]}" "$PROMPT" 2>&1 | tee "$transcript" | tee -a "$AI_LOG" >/dev/null
    rc="${PIPESTATUS[0]}"
  else
    agent -p --trust "${EXTRA_FLAGS[@]}" "$PROMPT" >"$transcript" 2>&1
    rc="$?"
  fi
  set -e
  if [[ "$rc" -ne 0 ]]; then
    batch_failures=$((batch_failures + 1))
    echo "[ux-ai-audit] phase=batch_end · batch=${batch_id} · status=error · exit_code=${rc} · transcript=${transcript}" >&2
    continue
  fi
  echo "[ux-ai-audit] phase=batch_end · batch=${batch_id} · status=ok · transcript=${transcript}" >&2
done

node "$AGGREGATE_RESULTS" --audit "${OUT_DIR}/audit-data.json" --ai-out "$AI_OUT_DIR" >/dev/null
echo "[ux-ai-audit] phase=aggregate · findings_json=${AI_OUT_DIR}/ai-audit-data.json · report=${AI_OUT_DIR}/ai-audit-report.md · batch_failures=${batch_failures}" >&2
exit 0
