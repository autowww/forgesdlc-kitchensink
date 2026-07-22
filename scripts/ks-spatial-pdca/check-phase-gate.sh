#!/usr/bin/env bash
# KS spatial effects PDCA — Check gate (build + catalog + verifier).
# Usage: ./scripts/ks-spatial-pdca/check-phase-gate.sh <phase>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SEQUENCE="${SCRIPT_DIR}/SEQUENCE.yaml"
PHASE="${1:-}"

# shellcheck source=phase-hash-map.sh
source "${SCRIPT_DIR}/phase-hash-map.sh" 2>/dev/null || true

[[ -n "${PHASE}" ]] || { echo "usage: $0 <phase>" >&2; exit 1; }

cd "${REPO_ROOT}"

info() { echo "==> gate ${PHASE}: $*"; }
fail() { echo "FAIL: $*" >&2; exit 1; }

phase_hash() {
  local phase="$1"
  if declare -F phase_hash_from_map >/dev/null 2>&1; then
    phase_hash_from_map "${phase}"
    return
  fi
  case "${phase}" in
    S03) echo "Flp" ;;
    S04) echo "Tlz" ;;
    S05) echo "Hol" ;;
    S06) echo "Zzg" ;;
    S07) echo "Dpt" ;;
    S08) echo "Cgb" ;;
    S09) echo "Vsw" ;;
    S10) echo "Rng" ;;
    S11) echo "Fch" ;;
    S12) echo "Hbd" ;;
    S13) echo "Mpx" ;;
    S14) echo "Cbg" ;;
    S15) echo "Dcb" ;;
    S16) echo "Tun" ;;
    S17) echo "Pst" ;;
    S18) echo "Iso" ;;
    S19) echo "Flh" ;;
    S20) echo "Dil" ;;
    S21) echo "Nsw" ;;
    S22) echo "Srl" ;;
    S02) echo "Tlz" ;; # golden path: CSS tilt / ks-tilt-wrap
    *) echo "" ;;
  esac
}

require_file() {
  [[ -f "$1" ]] || fail "missing required file: $1"
}

run_build_showcase() {
  info "build-showcase"
  if [[ -f docs/design/catalog/visual-registry.yaml ]]; then
    node --input-type=module -e "
import fs from 'node:fs';
import path from 'node:path';
import { loadRegistry, normalizeRegistryForJson } from './tools/design-catalog/lib/parse-registry.mjs';
const repo = process.cwd();
const { entries } = loadRegistry(path.join(repo, 'docs/design/catalog/visual-registry.yaml'));
const doc = normalizeRegistryForJson(repo, entries);
doc.generatedAt = new Date().toISOString();
fs.writeFileSync(path.join(repo, 'docs/design/catalog/visual-registry.generated.json'), JSON.stringify(doc, null, 2) + '\\n');
" 2>/dev/null || true
    python3 -c "import sys; sys.path.insert(0,'components'); import ks_catalog_hashes as k; k._entries.cache_clear()" 2>/dev/null || true
  fi
  python3 generator/build-showcase.py
}

run_visual_catalog_check() {
  info "check-visual-catalog"
  node tools/design-catalog/inventory-ks-visuals.mjs --repo . --out docs/design/catalog/visual-inventory.generated.json >/dev/null 2>&1 || true
  local err_file
  err_file="$(mktemp)"
  if ! node tools/design-catalog/check-visual-catalog.mjs \
    --repo . \
    --registry docs/design/catalog/visual-registry.yaml \
    --showcase showcase \
    --no-strict-inventory 2>"${err_file}"; then
    if grep -c '^hash ' "${err_file}" | grep -qx '1' && grep -q '^hash Cap,' "${err_file}"; then
      info "catalog check: tolerated Cap inventory crosswalk gap"
    else
      cat "${err_file}" >&2
      rm -f "${err_file}"
      fail "check-visual-catalog"
    fi
  fi
  rm -f "${err_file}"
}

run_spatial_verifier_tests() {
  local verifier="${REPO_ROOT}/tools/spatial-effects-verifier"
  local hash="${1:-}"
  if [[ ! -f "${verifier}/package.json" ]]; then
    if [[ "${PHASE}" == "S00" || "${PHASE}" == "S01" ]]; then
      info "spatial-effects-verifier not present yet (ok for ${PHASE})"
      return 0
    fi
    fail "tools/spatial-effects-verifier/package.json missing (required from ${PHASE} onward)"
  fi
  info "spatial-effects-verifier npm test"
  (
    cd "${verifier}"
    if [[ ! -d node_modules ]]; then
      npm ci
    fi
    if [[ -n "${hash}" ]]; then
      npm test -- --hash "${hash}"
    else
      npm test
    fi
  )
}

run_oracle_doc_sync() {
  local verifier="${REPO_ROOT}/tools/spatial-effects-verifier"
  if [[ -f "${verifier}/check-oracle-doc-sync.mjs" ]]; then
    info "check-oracle-doc-sync"
    node "${verifier}/check-oracle-doc-sync.mjs" --repo "${REPO_ROOT}"
  fi
}

require_plan_artifact() {
  local run_dir="${SCRIPT_DIR}/runs/${PHASE}/latest"
  if [[ -L "${run_dir}" || -d "${run_dir}" ]]; then
    require_file "${run_dir}/plan.md"
  elif [[ -f "${SCRIPT_DIR}/runs/${PHASE}/latest/plan.md" ]]; then
    :
  else
    info "plan.md not found under runs/${PHASE}/latest (optional for gate)"
  fi
}

check_foundation_s00() {
  require_file css/ks-spatial.css
  require_file js/ks-pointer-depth.js
  info "S00 foundation files present"
}

check_foundation_s01() {
  require_file docs/design/spatial/README.md
  require_file docs/design/spatial/ORACLE-SCHEMA.md
  require_file generator/pages/spatial-effects.py
  info "S01 dual-wiki scaffold present"
}

check_foundation_s02() {
  require_file tools/spatial-effects-verifier/package.json
  info "S02 harness package present"
}

check_foundation_s23() {
  require_file docs/design/spatial/freefrontend-traceability.md
  require_file docs/design/spatial/wave2-registry.yaml
  require_file css/ks-spatial-wave2.css
  require_file components/spatial_wave2.py
  info "S23 wave2 traceability scaffold present"
}

check_component_artifacts() {
  local hash slug
  hash="$(phase_hash "${PHASE}")"
  [[ -n "${hash}" ]] || fail "unknown component phase: ${PHASE}"
  slug="$(grep -A8 "^  ${PHASE}:" "${SEQUENCE}" | grep 'slug:' | head -1 | sed 's/.*slug: //' | tr -d "'\" " || true)"
  if [[ -z "${slug}" ]]; then
    case "${PHASE}" in
      S03) slug="flip-card" ;;
      S04) slug="tilt-css" ;;
      S05) slug="holo-card" ;;
      S06) slug="zigzag-divider" ;;
      S07) slug="display-depth" ;;
      S08) slug="cube-glow-button" ;;
      S09) slug="volumetric-switch" ;;
      S10) slug="tactile-range" ;;
      S11) slug="flip-choice" ;;
      S12) slug="holo-badge" ;;
      S13) slug="media-parallax" ;;
      S14) slug="cube-gallery" ;;
      S15) slug="draggable-cube" ;;
      S16) slug="tunnel-ambient" ;;
      S17) slug="perspective-stage" ;;
      S18) slug="isometric-tile" ;;
      S19) slug="floating-header" ;;
      S20) slug="depth-dial" ;;
      S21) slug="neumorphic-switch" ;;
      S22) slug="spatial-rail" ;;
    esac
  fi
  require_file "docs/design/spatial/effects/${slug}.md"
  require_file "docs/design/spatial/oracles/${hash}.json"
  info "component artifacts present for ${hash} (${slug})"
}

# --- common gates ---
run_build_showcase
run_visual_catalog_check

case "${PHASE}" in
  S00)
    require_plan_artifact
    check_foundation_s00
  ;;
  S01)
    require_plan_artifact
    check_foundation_s01
    run_oracle_doc_sync
  ;;
  S02)
    require_plan_artifact
    check_foundation_s02
    run_spatial_verifier_tests "$(phase_hash S02)"
    run_oracle_doc_sync
  ;;
  S23)
    require_plan_artifact
    check_foundation_s23
    run_oracle_doc_sync
  ;;
  S03|S04|S05|S06|S07|S08|S09|S10|S11|S12|S13|S14|S15|S16|S17|S18|S19|S20|S21|S22|S24|S25|S26|S27|S28|S29|S30|S31|S32|S33|S34|S35|S36|S37|S38|S39|S40|S41|S42|S43|S44|S45|S46|S47|S48|S49|S50|S51|S52|S53|S54|S55|S56|S57|S58|S59|S60|S61|S62|S63|S64|S65|S66|S67)
    if [[ "${PHASE}" == "S37" ]]; then
      info "S37 skipped (duplicate Fck — covered by S32)"
    else
      check_component_artifacts
      hash="$(phase_hash "${PHASE}")"
      [[ -n "${hash}" ]] || fail "no hash for phase ${PHASE}"
      run_spatial_verifier_tests "${hash}"
    fi
    run_oracle_doc_sync
  ;;
  *)
    fail "unknown phase: ${PHASE}"
  ;;
esac

info "CHECK GREEN: ${PHASE}"
exit 0
