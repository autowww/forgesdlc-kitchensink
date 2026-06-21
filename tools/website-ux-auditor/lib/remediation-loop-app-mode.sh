#!/usr/bin/env bash
# App-mode remediation loops (sourced by run-website-ux-remediation-loop.sh).
# shellcheck shell=bash

forge_ux_resolve_ks_ui() {
  if [[ -f "${REPO_ROOT}/kitchensink/tools/ui-app-audit/run-scenario-audit.mjs" ]]; then
    echo "${REPO_ROOT}/kitchensink/tools/ui-app-audit"
    return
  fi
  if [[ -f "${KS_ROOT}/tools/ui-app-audit/run-scenario-audit.mjs" ]]; then
    echo "${KS_ROOT}/tools/ui-app-audit"
    return
  fi
  echo "run-website-ux-remediation-loop: ui-app-audit not found" >&2
  exit 1
}

forge_ux_resolve_smoke_plan() {
  if [[ -n "${FORGE_UX_SMOKE_PLAN:-}" ]]; then
    echo "${FORGE_UX_SMOKE_PLAN}"
    return
  fi
  local default="${REPO_ROOT}/docs/studio/smoke-plan.yaml"
  if [[ -f "$default" ]]; then
    echo "$default"
    return
  fi
  echo ""
}

forge_ux_sync_smoke_plan_if_requested() {
  [[ "${FORGE_UX_SYNC_SMOKE_PLAN:-}" == "1" ]] || return 0
  local ks_ui
  ks_ui="$(forge_ux_resolve_ks_ui)"
  local smoke_plan
  smoke_plan="$(forge_ux_resolve_smoke_plan)"
  [[ -n "$smoke_plan" ]] || return 0
  _out_echo "run-website-ux-remediation-loop: sync smoke-plan from contract MD"
  node "${ks_ui}/sync-smoke-plan-from-contract.mjs" \
    --app-repo "$REPO_ROOT" \
    --smoke-plan "$smoke_plan" \
    ${FORGE_UX_SYNC_SMOKE_FORCE:+--force}
}

forge_ux_export_app_mode_det_scope() {
  if [[ -n "${FORGE_UX_ONLY_DETERMINISTIC_RULE_IDS:-}" ]]; then
    return 0
  fi
  export FORGE_UX_RULES_SCOPE=app
  export FORGE_UX_RULESET_DOMAIN=app
  export FORGE_UX_ONLY_DETERMINISTIC_RULE_IDS="$(
    cd "${TOOL_DIR}" && node --input-type=module -e "
import { appModeDeterministicRuleIds } from './lib/studio-app-mode.mjs';
const ids = await appModeDeterministicRuleIds({ includePrimitives: ${FORGE_UX_APP_INCLUDE_PRIMITIVES:-true} });
process.stdout.write(ids.join(','));
" 2>/dev/null || true
  )"
  _out_echo "run-website-ux-remediation-loop: app DET scope (${FORGE_UX_ONLY_DETERMINISTIC_RULE_IDS})"
}

forge_ux_app_scenario_loop() {
  local ks_ui ks_root smoke_plan audit_dir audit_json
  ks_ui="$(forge_ux_resolve_ks_ui)"
  ks_root="$(cd "${ks_ui}/../.." && pwd)"
  smoke_plan="$(forge_ux_resolve_smoke_plan)"
  if [[ -z "$smoke_plan" ]]; then
    echo "run-website-ux-remediation-loop: --app scenario mode requires smoke-plan (use --smoke-plan)" >&2
    exit 2
  fi

  forge_ux_sync_smoke_plan_if_requested

  if [[ -f "${REPO_ROOT}/package.json" ]] && grep -q '"build:studio-js"' "${REPO_ROOT}/package.json" 2>/dev/null; then
    _out_echo "run-website-ux-remediation-loop: build studio-js"
    (cd "$REPO_ROOT" && npm run -s build:studio-js) || true
  fi

  local max_iter="${FORGE_UX_LOOP_MAX_ITERATIONS:-5}"
  local iter=0 audit_rc=1
  local skip_fixers="${FORGE_UX_SKIP_FIXERS:-0}"
  local skip_agent="${SKIP_CURSOR_AGENT:-1}"
  local until_clean="${FORGE_UX_LOOP_UNTIL_QUALITY_GATE:-1}"
  local scenario_verify="${FORGE_STUDIO_SCENARIO_VERIFY:-1}"
  local step_agents="${FORGE_UX_STEP_AGENTS:-1}"
  local gate_mode="${FORGE_STUDIO_GATE_MODE:-ux}"

  while [[ "$iter" -lt "$max_iter" ]]; do
    iter=$((iter + 1))
    _out_echo "run-website-ux-remediation-loop: app scenario iteration ${iter}/${max_iter}"

    if [[ -x "${REPO_ROOT}/scripts/run-sealed-studio-smoke.sh" ]]; then
      export FORGE_STUDIO_EMIT_COVERAGE=1
      [[ "$scenario_verify" == "1" ]] && export FORGE_STUDIO_KEEP_SERVER=1
      [[ "${FORGE_STUDIO_ENABLE_AI_AUDIT:-0}" == "1" ]] && export FORGE_STUDIO_ENABLE_AI_AUDIT=1
      if ! (cd "$REPO_ROOT" && ./scripts/run-sealed-studio-smoke.sh); then
        audit_rc=$?
      else
        audit_rc=0
      fi
    else
      echo "run-website-ux-remediation-loop: missing run-sealed-studio-smoke.sh in app repo" >&2
      exit 1
    fi

    local seal_dir="${FORGE_SEAL_DIR:-}"
    if [[ -n "$seal_dir" && -f "${seal_dir}/audit/audit-data.json" ]]; then
      audit_json="${seal_dir}/audit/audit-data.json"
      audit_dir="${seal_dir}/audit"
    elif [[ -n "${UX_AUDIT_OUT_DIR:-}" && -f "${OUT_DIR}/audit-data.json" ]]; then
      audit_json="${OUT_DIR}/audit-data.json"
      audit_dir="${OUT_DIR}"
    else
      echo "run-website-ux-remediation-loop: no audit-data.json after scenario smoke" >&2
      exit 1
    fi

    node "${ks_ui}/score-scenario-ux.mjs" --audit "$audit_json" || true
    node "${ks_ui}/report-scenario-coverage.mjs" \
      --smoke-plan "$smoke_plan" \
      --audit "$audit_json" \
      --app-repo "$REPO_ROOT" \
      --out "${audit_dir}/scenario-coverage.json" || true

    local gate_pass=false
    if command -v jq >/dev/null 2>&1; then
      case "$gate_mode" in
        ux) gate_pass="$(jq -r '.uxQualityGate.pass // false' "$audit_json" 2>/dev/null || echo false)" ;;
        all) gate_pass="$(jq -r '.gatePass // false' "$audit_json" 2>/dev/null || echo false)" ;;
        *) gate_pass="$(jq -r '.qualityGate.pass // false' "$audit_json" 2>/dev/null || echo false)" ;;
      esac
    fi
    if [[ "$audit_rc" -eq 0 ]] || [[ "$gate_pass" == "true" ]]; then
      _out_echo "run-website-ux-remediation-loop: app scenario gate passed"
      exit 0
    fi

    [[ "$until_clean" == "1" ]] || exit "$audit_rc"
    [[ "$iter" -lt "$max_iter" ]] || break

    if [[ "$skip_fixers" != "1" && "$scenario_verify" == "1" ]]; then
      local studio_port="${FORGE_SEAL_STUDIO_PORT:-}"
      if [[ -n "$seal_dir" && -f "${seal_dir}/studio-port.txt" ]]; then
        studio_port="$(cat "${seal_dir}/studio-port.txt")"
      fi
      studio_port="${studio_port:-8765}"
      local verify_dir="${audit_dir}/verify-iter-${iter}"
      _out_echo "run-website-ux-remediation-loop: scenario fixer verify → ${verify_dir}"
      node "${ks_ui}/run-scenario-fixer-verify.mjs" \
        --repo-root "$REPO_ROOT" \
        --audit-data "$audit_json" \
        --site "http://127.0.0.1:${studio_port}" \
        --smoke-plan "$smoke_plan" \
        --out-dir "$verify_dir" || true
    fi

    if [[ "$skip_agent" != "1" && "$step_agents" == "1" ]]; then
      _out_echo "run-website-ux-remediation-loop: step-scoped agents"
      local ext_args=()
      if [[ -n "${FORGE_UX_FIX_ROOTS:-}" ]]; then
        local _i=1
        local _part
        IFS=',' read -ra _parts <<< "${FORGE_UX_FIX_ROOTS}"
        for _part in "${_parts[@]}"; do
          _part="${_part#"${_part%%[![:space:]]*}"}"
          _part="${_part%"${_part##*[![:space:]]}"}"
          [[ -n "$_part" ]] || continue
          ext_args+=( "--external-library-path${_i}=${_part}" )
          _i=$((_i + 1))
        done
      fi
      node "${ks_ui}/run-scenario-step-remediation.mjs" \
        --app-repo "$REPO_ROOT" \
        --audit-data "$audit_json" \
        --smoke-plan "$smoke_plan" \
        --out-dir "$audit_dir" \
        "${ext_args[@]}" || true
    elif [[ "$skip_agent" != "1" && -x "${REPO_ROOT}/scripts/run-studio-ux-agent-next.sh" ]]; then
      "${REPO_ROOT}/scripts/run-studio-ux-agent-next.sh" "$REPO_ROOT" "$audit_json" || true
    fi

    if [[ -f "${REPO_ROOT}/package.json" ]] && grep -q '"build:studio-js"' "${REPO_ROOT}/package.json" 2>/dev/null; then
      (cd "$REPO_ROOT" && npm run -s build:studio-js) || true
    fi
  done

  _out_echo "run-website-ux-remediation-loop: app scenario stopped after ${max_iter} iterations"
  exit "$audit_rc"
}

forge_ux_app_crawl_loop() {
  forge_ux_export_app_mode_det_scope
  if [[ "${FORGE_UX_APP_SKIP_SCORER:-1}" == "1" && "${FORGE_UX_LOOP_NO_SCORER:-}" != "1" ]]; then
    FORGE_UX_LOOP_NO_SCORER=1
    _out_echo "run-website-ux-remediation-loop: app crawl — default --no-scorer"
  fi
  if [[ -z "${SITE_KIND_ARGS[*]:-}" ]]; then
    SITE_KIND_ARGS=(--site-kind "${FORGE_UX_APP_SITE_KIND:-a11y-studio}")
  fi
  export FORGE_UX_FIXERS_PILOT_AUDIT_SCOPE=0
  return 0
}
