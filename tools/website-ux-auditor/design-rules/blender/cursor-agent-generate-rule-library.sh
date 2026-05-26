#!/usr/bin/env bash
# Generate design rule implementations with Cursor CLI agent in PDCA mode.
#
# Default behavior is deterministic-only to avoid unnecessary AI-token usage
# for rules intended to be machine-checkable.
#
# Usage examples:
#   ./design-rules/blender/cursor-agent-generate-rule-library.sh
#   ./design-rules/blender/cursor-agent-generate-rule-library.sh --lane deterministic --max-rules 5
#   ./design-rules/blender/cursor-agent-generate-rule-library.sh --lane ai --only-rule AI.CONTEXT.COGNITIVE_CLARITY
#
# Notes:
# - Model defaults to composer-2.5 (Composer 2.5 fast lane).
# - Runs one agent invocation per rule id.
# - Logs each run under design-rules/blender/rule-gen-logs/.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOL_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
REPO_ROOT="$(cd "${TOOL_ROOT}/../.." && pwd)"
BLENDER_JS="${SCRIPT_DIR}/design-rules-blender.mjs"
REGISTRY_JSON="${TOOL_ROOT}/design-rules/registry.generated.json"
MAPPING_JS="${SCRIPT_DIR}/rule-mappings.js"
LOG_DIR="${SCRIPT_DIR}/rule-gen-logs"

LANE="deterministic"
MAX_RULES=0
DRY_RUN=0
CONTINUE_ON_ERROR=1
MODEL="${FORGE_UX_RULE_GEN_MODEL:-composer-2.5}"
ONLY_RULES=()
EXTRA_FLAGS=()
OVERRIDE_VERSION=0

usage() {
  cat >&2 <<'EOF'
Generate design rule library via Cursor Agent (PDCA).

Usage:
  cursor-agent-generate-rule-library.sh [options]

Options:
  --lane deterministic|ai|both   Rule lane to generate (default: deterministic)
  --max-rules N                  Limit number of rules (0 = all, default: 0)
  --only-rule RULE_ID            Restrict to specific rule id (repeatable)
  --model MODEL                  Cursor agent model (default: composer-2.5)
  --dry-run                      Print selected targets without running agent
  --override-version             Force blender regeneration even with same rules-version
  --stop-on-error                Stop if one rule generation fails
  --agent-extra "..."            Extra flags appended to `agent` call
  -h, --help                     Show help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --lane)
      LANE="${2:-}"; shift 2 ;;
    --max-rules)
      MAX_RULES="${2:-0}"; shift 2 ;;
    --only-rule)
      ONLY_RULES+=("${2:-}"); shift 2 ;;
    --model)
      MODEL="${2:-composer-2.5}"; shift 2 ;;
    --dry-run)
      DRY_RUN=1; shift ;;
    --override-version)
      OVERRIDE_VERSION=1; shift ;;
    --stop-on-error)
      CONTINUE_ON_ERROR=0; shift ;;
    --agent-extra)
      read -r -a EXTRA_FLAGS <<< "${2:-}"; shift 2 ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 2 ;;
  esac
done

if [[ "${LANE}" != "deterministic" && "${LANE}" != "ai" && "${LANE}" != "both" ]]; then
  echo "Invalid --lane: ${LANE}" >&2
  exit 2
fi

if ! command -v agent >/dev/null 2>&1; then
  echo "Cursor CLI agent not found in PATH." >&2
  exit 1
fi

mkdir -p "${LOG_DIR}"

echo "[rule-gen] repo=${REPO_ROOT}" >&2
echo "[rule-gen] lane=${LANE} model=${MODEL} max_rules=${MAX_RULES}" >&2

# Ensure registry is fresh before selecting targets.
if [[ "${OVERRIDE_VERSION}" == "1" ]]; then
  node "${BLENDER_JS}" --override-version >/dev/null
else
  node "${BLENDER_JS}" >/dev/null
fi

ONLY_ARG="$(printf '%s\n' "${ONLY_RULES[@]:-}" | sed '/^$/d' | paste -sd, -)"

mapfile -t TARGETS < <(
  node -e '
    const fs = require("fs");
    const lane = process.argv[1];
    const maxRules = Number(process.argv[2] || "0");
    const onlyArg = String(process.argv[3] || "").trim();
    const onlySet = new Set(onlyArg ? onlyArg.split(",").map((x) => x.trim()).filter(Boolean) : []);
    const reg = JSON.parse(fs.readFileSync(process.argv[4], "utf8"));
    const out = [];
    const wantDet = lane === "deterministic" || lane === "both";
    const wantAi = lane === "ai" || lane === "both";

    if (wantDet) {
      for (const r of (reg.deterministicRules || [])) {
        if (r.status === "implemented") continue;
        if (onlySet.size && !onlySet.has(r.id)) continue;
        out.push(JSON.stringify({
          lane: "deterministic",
          id: r.id,
          modulePath: r.modulePath,
          sourceRule: r.sourceRule || "",
        }));
      }
    }
    if (wantAi) {
      for (const r of (reg.aiRules || [])) {
        if (r.status === "implemented") continue;
        if (onlySet.size && !onlySet.has(r.id)) continue;
        out.push(JSON.stringify({
          lane: "ai",
          id: r.id,
          promptPath: r.promptPath || "",
          sourceRule: r.sourceRule || "",
        }));
      }
    }
    if (maxRules > 0) out.splice(maxRules);
    for (const row of out) console.log(row);
  ' "${LANE}" "${MAX_RULES}" "${ONLY_ARG}" "${REGISTRY_JSON}"
)

if [[ ${#TARGETS[@]} -eq 0 ]]; then
  echo "[rule-gen] no targets selected." >&2
  exit 0
fi

echo "[rule-gen] selected targets=${#TARGETS[@]}" >&2

if [[ "${DRY_RUN}" == "1" ]]; then
  printf '%s\n' "${TARGETS[@]}"
  exit 0
fi

run_idx=0
failures=0
for row in "${TARGETS[@]}"; do
  run_idx=$((run_idx + 1))
  lane="$(node -e 'const o=JSON.parse(process.argv[1]);process.stdout.write(o.lane);' "$row")"
  rule_id="$(node -e 'const o=JSON.parse(process.argv[1]);process.stdout.write(o.id);' "$row")"
  source_rule="$(node -e 'const o=JSON.parse(process.argv[1]);process.stdout.write(o.sourceRule||"");' "$row")"
  target_path="$(node -e 'const o=JSON.parse(process.argv[1]);process.stdout.write(o.modulePath||o.promptPath||"");' "$row")"
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  log_file="${LOG_DIR}/${stamp}_${run_idx}_${rule_id//./_}.log"

  if [[ "${lane}" == "deterministic" ]]; then
    AGENT_PROMPT="Repository root: ${REPO_ROOT}

You are implementing ONE deterministic design-rule check in PDCA mode.

Rule id: ${rule_id}
Target file: ${target_path}
Source rule anchor: ${source_rule}

Plan:
1) Read the source rule anchor and infer measurable, deterministic signals.
2) Read existing deterministic check style in tools/website-ux-auditor/design-rules/deterministic/.
3) Read ${MAPPING_JS} and register this rule under DETERMINISTIC_IMPLEMENTATIONS as status implemented with realistic area/scoreDimension/priorityWeight.

Do:
4) Implement the check in ${target_path} with export shape:
   - export const rule = { ... }
   - export function run(ctx) { return findings[]; }
5) Keep the check deterministic and token-efficient; do NOT use AI heuristics where deterministic metrics are possible.
6) Preserve backward-compatible finding fields and quality (severity/area/message/evidence/remediation).

Check:
7) Run in ${TOOL_ROOT}: npm run blend-rules
8) Run in ${TOOL_ROOT}: npm test

Adjust:
9) If tests fail, fix and rerun the same checks before finishing.

Output:
- Report what changed and why.
- Keep scope to this single rule only."
  else
    AGENT_PROMPT="Repository root: ${REPO_ROOT}

You are implementing ONE AI-rule prompt fragment in PDCA mode.

Rule id: ${rule_id}
Target file: ${target_path}
Source rule anchor: ${source_rule}

Plan:
1) Read source docs and extract explicit AI-judgment requirement for this rule.
2) Ensure this is AI-only guidance, not deterministic logic.

Do:
3) Write/upgrade ${target_path} with concise PDCA-oriented prompt guidance.
4) Update ${MAPPING_JS} so AI_PROMPT_IMPLEMENTATIONS maps ${rule_id} as implemented and points to this prompt path.

Check:
5) Run in ${TOOL_ROOT}: npm run blend-rules
6) Run in ${TOOL_ROOT}: npm test

Adjust:
7) If tests fail, fix and rerun.

Output:
- Report files changed and rationale.
- Keep scope to this single rule only."
  fi

  echo "[rule-gen] (${run_idx}/${#TARGETS[@]}) lane=${lane} rule=${rule_id}" >&2
  set +e
  agent -p --trust --model "${MODEL}" "${EXTRA_FLAGS[@]}" "${AGENT_PROMPT}" 2>&1 | tee "${log_file}"
  rc="${PIPESTATUS[0]}"
  set -e

  if [[ "${rc}" -ne 0 ]]; then
    failures=$((failures + 1))
    echo "[rule-gen] failed rule=${rule_id} rc=${rc} log=${log_file}" >&2
    if [[ "${CONTINUE_ON_ERROR}" == "0" ]]; then
      exit "${rc}"
    fi
  else
    echo "[rule-gen] ok rule=${rule_id} log=${log_file}" >&2
  fi
done

echo "[rule-gen] done targets=${#TARGETS[@]} failures=${failures}" >&2
if [[ "${failures}" -gt 0 ]]; then
  exit 1
fi
