#!/usr/bin/env bash
# Run a post-clean AI-assisted UX audit using Cursor CLI agent in small bounded batches.
#
# FORGE_UX_AI_AUDIT_BATCH_SIZE (default 1) — max URLs per agent prompt (1 = page-by-page).
# FORGE_UX_AI_AUDIT_STOP_AFTER_MAJOR_PLUS (default 10) — cumulative AI blocker+critical+major
#   across completed batches; remaining batches are skipped. Set 0 to run all batches.
# FORGE_UX_AI_AUDIT_CONCURRENCY (default 3, max 3) — parallel Cursor agent calls per AI audit pass.
# FORGE_UX_FORCE_AI_AUDIT=1 — skip eligibility check (normally requires full crawl, all DET rules, quality gate pass).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_BATCHES="${SCRIPT_DIR}/build-ai-audit-batches.mjs"
AGGREGATE_RESULTS="${SCRIPT_DIR}/aggregate-ai-audit-results.mjs"
AI_ELIGIBILITY_BIN="${SCRIPT_DIR}/audit-ai-audit-eligibility.mjs"

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

if [[ "${FORGE_UX_FORCE_AI_AUDIT:-}" != "1" && -f "$AI_ELIGIBILITY_BIN" ]]; then
  if ! node "$AI_ELIGIBILITY_BIN" "${OUT_DIR}/audit-data.json" --check 2>/dev/null; then
    node "$AI_ELIGIBILITY_BIN" "${OUT_DIR}/audit-data.json" --check >&2 || true
    echo "cursor-agent-run-ux-audit: not eligible — full crawl, all deterministic rules, and quality gate required (FORGE_UX_FORCE_AI_AUDIT=1 to override)." >&2
    exit 0
  fi
fi

AI_OUT_DIR="${OUT_DIR}/ai-audit"
TRANSCRIPTS_DIR="${AI_OUT_DIR}/transcripts"
mkdir -p "$TRANSCRIPTS_DIR"

AI_BATCH_SIZE="${FORGE_UX_AI_AUDIT_BATCH_SIZE:-1}"
AI_STOP_AFTER_MAJOR_PLUS="${FORGE_UX_AI_AUDIT_STOP_AFTER_MAJOR_PLUS:-10}"
AI_CONCURRENCY="${FORGE_UX_AI_AUDIT_CONCURRENCY:-3}"
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
echo "cursor-agent-run-ux-audit: batch_size=${AI_BATCH_SIZE} (URLs per agent call)" >&2
echo "cursor-agent-run-ux-audit: stop_after_major_plus=${AI_STOP_AFTER_MAJOR_PLUS} (0 = run all batches)" >&2
if ! [[ "${AI_CONCURRENCY}" =~ ^[1-9][0-9]*$ ]]; then
  echo "cursor-agent-run-ux-audit: invalid FORGE_UX_AI_AUDIT_CONCURRENCY=${AI_CONCURRENCY}" >&2
  exit 2
fi
if [[ "${AI_CONCURRENCY}" -gt 3 ]]; then
  echo "cursor-agent-run-ux-audit: concurrency capped at 3 (requested ${AI_CONCURRENCY})" >&2
  AI_CONCURRENCY=3
fi
echo "cursor-agent-run-ux-audit: concurrency=${AI_CONCURRENCY}" >&2
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

BATCH_STATUS_PATH="${AI_OUT_DIR}/batch-status.json"
declare -A BATCH_STATUS=()

write_batch_status_file() {
  node -e '
const fs=require("fs");
const path=process.argv[1];
const rows=JSON.parse(process.argv[2]);
fs.writeFileSync(path, JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), batches: rows }, null, 2) + "\n");
' "$BATCH_STATUS_PATH" "$(printf '%s' "${BATCH_STATUS_JSON:-[]}")"
}

init_batch_status_json() {
  BATCH_STATUS_JSON="$(node -e "
const paths=process.argv.slice(1);
const rows=paths.map((p,i)=>({ batchId: p.replace(/^.*\\//,'').replace(/\\.json$/,''), path: p, seq: i+1, status: 'pending' }));
process.stdout.write(JSON.stringify(rows));
" "${BATCH_PATHS[@]}")"
  write_batch_status_file
}

update_batch_status() {
  local batch_id="$1"
  local status="$2"
  local extra="${3:-}"
  BATCH_STATUS["${batch_id}"]="${status}"
  BATCH_STATUS_JSON="$(node -e "
const rows=JSON.parse(process.argv[1]);
const id=process.argv[2];
const status=process.argv[3];
const extra=process.argv[4] ? JSON.parse(process.argv[4]) : {};
for (const r of rows) {
  if (r.batchId===id) {
    r.status=status;
    Object.assign(r, extra);
    r.updatedAt=new Date().toISOString();
  }
}
process.stdout.write(JSON.stringify(rows));
" "$BATCH_STATUS_JSON" "$batch_id" "$status" "$extra")"
  write_batch_status_file
}

run_ai_batch() {
  local seq="$1"
  local rel_batch="$2"
  local batch_file="${AI_OUT_DIR}/${rel_batch}"
  local batch_id
  batch_id="$(basename "$batch_file" .json)"
  local transcript="${TRANSCRIPTS_DIR}/${batch_id}.log"
  local slot="$3"

  update_batch_status "$batch_id" "running" "{\"slot\":${slot}}"

  local urls likely_files ai_rule_prompts design_theme
  urls="$(node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log((j.urls||[]).join('\n'));" "$batch_file")"
  likely_files="$(node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log((j.likelySourceFiles||[]).join('\n'));" "$batch_file")"
  ai_rule_prompts="$(node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); const rows=(j.aiRulePrompts||[]).map((x)=>x.id+' :: '+(x.promptPath||'')); console.log(rows.join('\n'));" "$batch_file")"
  design_theme="$(node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); const t=j.designTheme||{}; console.log(t.id ? (t.id+' :: '+(t.designStandardPath||'')) : 'default');" "$batch_file")"

  local PROMPT
  PROMPT="Repository root: ${REPO_ROOT}

This is a post-clean AI-assisted UX audit batch. The deterministic Forge UX audit already found zero Major+ issues overall.

Read this batch specification JSON:
${batch_file}

Use \`aiReviewContract\` in that JSON for canonical \`principleId\` values and required judgment metadata fields. Prefer promoting repeatable issues into concrete \`DET.*\` (or catalog) candidate rules rather than stopping at subjective critique.

Design theme for this audit:
${design_theme}

AI rule prompt references from the generated registry:
${ai_rule_prompts}

Your task:
1. Audit only the URLs listed in the batch spec.
2. Inspect those live pages and likely source files from the repo to catch issues the deterministic rules may have missed.
3. Map each finding to one \`principleId\` from \`aiReviewContract.principleIds\` (judgment lenses: premium feel, hierarchy confidence, cognitive clarity, explanatory visuals, governance credibility, contract actionability, or rule-discovery for deterministic promotion).
4. Be concrete and evidence-based. Do not invent product capabilities.
5. Prefer findings that are new or materially more specific than the deterministic findings in the batch spec, and always propose a \`candidateDeterministicRule\` when the pattern could repeat across pages or hashes.

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
      \"principleId\": \"AI.CONTEXT.COGNITIVE_CLARITY\",
      \"deterministicCoverage\": \"covered|partially-covered|not-covered\",
      \"candidateDeterministicRule\": \"DET.* id and measurable check idea; or why AI-only\",
      \"hashesOrContractsAffected\": [\"ABC\", \"docs/design/catalog/....md\"],
      \"screenshotOrDomEvidence\": \"what you saw (DOM selector, screenshot ref, or observable)\",
      \"title\": \"one-line issue title\",
      \"evidence\": \"what you saw in the page or file (may mirror screenshotOrDomEvidence)\",
      \"whyMissedByDeterministic\": \"why a rules pass may have missed this\",
      \"sourceFiles\": [\"relative/path.md\"],
      \"confidence\": 0.0,
      \"remediation\": \"short fix guidance\"
    }
  ]
}"

  echo "[ux-ai-audit] phase=batch_begin · batch=${batch_id} · seq=${seq}/${#BATCH_PATHS[@]} · slot=${slot}" >&2
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
    update_batch_status "$batch_id" "error" "{\"exitCode\":${rc}}"
    echo "[ux-ai-audit] phase=batch_end · batch=${batch_id} · status=error · exit_code=${rc}" >&2
    return "$rc"
  fi
  update_batch_status "$batch_id" "ok" "{}"
  echo "[ux-ai-audit] phase=batch_end · batch=${batch_id} · status=ok" >&2
  return 0
}

on_batch_complete() {
  local seq="$1"
  local batch_id="$2"
  local rc="$3"
  if [[ "$rc" -ne 0 ]]; then
    batch_failures=$((batch_failures + 1))
    return 0
  fi
  node "$AGGREGATE_RESULTS" --audit "${OUT_DIR}/audit-data.json" --ai-out "$AI_OUT_DIR" --max-batches "$seq" >/dev/null
  aggregated_once=1
  local _ai_total _ai_major
  _ai_total="$(node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(String(j.totalFindings ?? 0));" "${AI_OUT_DIR}/ai-audit-data.json" 2>/dev/null || echo 0)"
  _ai_major="$(node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(String(j.majorPlusFindingCount ?? 0));" "${AI_OUT_DIR}/ai-audit-data.json" 2>/dev/null || echo 0)"
  echo "[ux-ai-audit] phase=batch_cumulative · batch=${batch_id} · seq=${seq}/${#BATCH_PATHS[@]} · totalFindings=${_ai_total} · majorPlus=${_ai_major}" >&2
  if [[ "${AI_STOP_AFTER_MAJOR_PLUS}" =~ ^[0-9]+$ ]] && [[ "${AI_STOP_AFTER_MAJOR_PLUS}" -gt 0 ]] && [[ "${_ai_major}" -ge "${AI_STOP_AFTER_MAJOR_PLUS}" ]]; then
    stopped=1
    node "$AGGREGATE_RESULTS" --audit "${OUT_DIR}/audit-data.json" --ai-out "$AI_OUT_DIR" --max-batches "$seq" --stop-reason major_plus_threshold >/dev/null
    echo "[ux-ai-audit] phase=early_stop · reason=major_plus_threshold · majorPlus=${_ai_major} · batches_run=${seq}/${#BATCH_PATHS[@]}" >&2
  fi
}

batch_failures=0
aggregated_once=0
stopped=0
total_batches="${#BATCH_PATHS[@]}"
init_batch_status_json

if [[ "${AI_CONCURRENCY}" -eq 1 ]]; then
  seq=0
  for rel_batch in "${BATCH_PATHS[@]}"; do
    [[ "${stopped}" -eq 0 ]] || break
    seq=$((seq + 1))
    set +e
    run_ai_batch "$seq" "$rel_batch" "1"
    rc=$?
    set -e
    batch_id="$(basename "${AI_OUT_DIR}/${rel_batch}" .json)"
    on_batch_complete "$seq" "$batch_id" "$rc"
  done
else
  queue_idx=0
  active=0
  declare -a POOL_PIDS=()
  declare -A PID_SEQ=()
  declare -A PID_BATCH_ID=()
  declare -A PID_REL=()

  start_ai_jobs() {
    while [[ "${stopped}" -eq 0 && "${queue_idx}" -lt "${total_batches}" && "${active}" -lt "${AI_CONCURRENCY}" ]]; do
      rel_batch="${BATCH_PATHS[$queue_idx]}"
      queue_idx=$((queue_idx + 1))
      seq="${queue_idx}"
      slot=$(( (seq - 1) % AI_CONCURRENCY + 1 ))
      batch_id="$(basename "${AI_OUT_DIR}/${rel_batch}" .json)"
      set +e
      run_ai_batch "$seq" "$rel_batch" "$slot" &
      pid=$!
      set -e
      POOL_PIDS+=("$pid")
      PID_SEQ["$pid"]="$seq"
      PID_BATCH_ID["$pid"]="$batch_id"
      PID_REL["$pid"]="$rel_batch"
      active=$((active + 1))
    done
  }

  drain_ai_job() {
    local done_pid=""
    local wait_rc=0
    set +e
    wait -n -p done_pid
    wait_rc=$?
    set -e
    [[ -n "$done_pid" ]] || return 0
    local job_rc=0
    set +e
    wait "$done_pid"
    job_rc=$?
    set -e
    if [[ "$wait_rc" -ne 0 && "$job_rc" -eq 0 ]]; then job_rc=$wait_rc; fi
    local seq="${PID_SEQ[$done_pid]:-0}"
    local batch_id="${PID_BATCH_ID[$done_pid]:-?}"
    unset "PID_SEQ[$done_pid]" "PID_BATCH_ID[$done_pid]" "PID_REL[$done_pid]"
    local new_pids=()
    local p
    for p in "${POOL_PIDS[@]}"; do
      [[ "$p" == "$done_pid" ]] && continue
      new_pids+=("$p")
    done
    POOL_PIDS=("${new_pids[@]}")
    active=$((active - 1))
    on_batch_complete "$seq" "$batch_id" "$job_rc"
  }

  start_ai_jobs
  while [[ "${active}" -gt 0 ]]; do
    drain_ai_job
    if [[ "${stopped}" -eq 1 ]]; then
      for p in "${POOL_PIDS[@]}"; do
        wait "$p" 2>/dev/null || true
      done
      active=0
      break
    fi
    start_ai_jobs
  done

  if [[ "${stopped}" -eq 1 && "${queue_idx}" -lt "${total_batches}" ]]; then
    while [[ "${queue_idx}" -lt "${total_batches}" ]]; do
      rel_batch="${BATCH_PATHS[$queue_idx]}"
      queue_idx=$((queue_idx + 1))
      batch_id="$(basename "${AI_OUT_DIR}/${rel_batch}" .json)"
      update_batch_status "$batch_id" "skipped_after_threshold" "{}"
    done
    write_batch_status_file
  fi
fi

if [[ "$aggregated_once" -eq 0 ]] && [[ "${#BATCH_PATHS[@]}" -gt 0 ]]; then
  node "$AGGREGATE_RESULTS" --audit "${OUT_DIR}/audit-data.json" --ai-out "$AI_OUT_DIR" --max-batches "${#BATCH_PATHS[@]}" >/dev/null
fi

echo "[ux-ai-audit] phase=aggregate · findings_json=${AI_OUT_DIR}/ai-audit-data.json · report=${AI_OUT_DIR}/ai-audit-report.md · batch_failures=${batch_failures}" >&2
exit 0
