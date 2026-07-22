#!/usr/bin/env bash
# KS nav-layout PDCA — Check gate (build + catalog + verifier).
# Usage: ./scripts/ks-nav-layout-pdca/check-phase-gate.sh <phase>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SEQUENCE="${SCRIPT_DIR}/SEQUENCE.yaml"
PHASE="${1:-}"

[[ -n "${PHASE}" ]] || { echo "usage: $0 <phase>" >&2; exit 1; }

cd "${REPO_ROOT}"

info() { echo "==> gate ${PHASE}: $*"; }
fail() { echo "FAIL: $*" >&2; exit 1; }

phase_hash() {
  local phase="$1"
  grep -A6 "^  ${phase}:" "${SEQUENCE}" | awk '/hash:/ { print $2; exit }'
}

require_file() {
  [[ -f "$1" ]] || fail "missing required file: $1"
}

run_build_showcase() {
  info "build-showcase"
  python3 generator/build-showcase.py
}

run_visual_catalog_check() {
  info "check-visual-catalog"
  node tools/design-catalog/check-visual-catalog.mjs \
    --repo . \
    --registry docs/design/catalog/visual-registry.yaml \
    --showcase showcase
}

run_nav_verifier_tests() {
  local verifier="${REPO_ROOT}/tools/nav-layout-verifier"
  local hash="${1:-}"
  if [[ ! -f "${verifier}/package.json" ]]; then
    if [[ "${PHASE}" == "N00" || "${PHASE}" == "N01" ]]; then
      info "nav-layout-verifier not present yet (ok for ${PHASE})"
      return 0
    fi
    fail "tools/nav-layout-verifier/package.json missing (required from N02 onward)"
  fi
  info "nav-layout-verifier npm test"
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
  local verifier="${REPO_ROOT}/tools/nav-layout-verifier"
  if [[ -f "${verifier}/check-oracle-doc-sync.mjs" ]]; then
    info "check-oracle-doc-sync"
    node "${verifier}/check-oracle-doc-sync.mjs" --repo "${REPO_ROOT}"
  fi
}

check_foundation_n00() {
  require_file components/nav_layout.py
  require_file css/ks-nav-layout.css
  require_file js/ks-nav-shared.js
  info "N00 foundation files present"
}

check_foundation_n01() {
  require_file docs/design/nav-layout/README.md
  require_file docs/design/nav-layout/ORACLE-SCHEMA.md
  require_file generator/pages/navigation.py
  require_file generator/pages/layout_shells.py
  require_file generator/pages/overlays_transitions.py
  info "N01 dual-wiki scaffold present"
}

check_foundation_n02() {
  require_file tools/nav-layout-verifier/package.json
  info "N02 harness package present"
}

check_component_artifacts() {
  local hash slug
  hash="$(phase_hash "${PHASE}")"
  [[ -n "${hash}" ]] || fail "unknown component phase: ${PHASE}"
  slug="$(grep -A5 "^  ${PHASE}:" "${SEQUENCE}" | awk '/slug:/ { print $2; exit }')"
  require_file "docs/design/nav-layout/effects/${slug}.md"
  require_file "docs/design/nav-layout/oracles/${hash}.json"
  info "component artifacts present for ${hash} (${slug})"
}

run_build_showcase
run_visual_catalog_check

case "${PHASE}" in
  N00)
    check_foundation_n00
    ;;
  N01)
    check_foundation_n01
    run_oracle_doc_sync
    ;;
  N02)
    check_foundation_n02
    run_nav_verifier_tests "$(phase_hash N02)"
    run_oracle_doc_sync
    ;;
  N03|N04|N05|N06|N07|N08|N09|N10|N11|N12|N13|N14|N15|N16|N17|N18|N19|N20|N21|N22)
    check_component_artifacts
    run_nav_verifier_tests "$(phase_hash "${PHASE}")"
    run_oracle_doc_sync
    ;;
  N23)
    run_nav_verifier_tests
    info "release gate: run sync-kitchensink-and-rebuild + deploy manually"
    ;;
  *)
    fail "unknown phase: ${PHASE}"
    ;;
esac

info "CHECK GREEN: ${PHASE}"
exit 0
