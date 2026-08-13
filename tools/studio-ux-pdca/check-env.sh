#!/usr/bin/env bash
# Check Studio UX PDCA environment against workspace conventions.
set -euo pipefail

TOOL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRIDGE_ENV="${FORGE_CURSOR_BRIDGE_ENV:-$HOME/Code/forge-cursor-bridge/.env}"

ok=0
warn=0
fail=0

_line() { printf '%s\n' "$1"; }
_ok() { _line "  OK   $1"; ok=$((ok + 1)); }
_warn() { _line "  WARN $1"; warn=$((warn + 1)); }
_fail() { _line "  FAIL $1"; fail=$((fail + 1)); }

_line "Studio UX PDCA environment check"
_line "================================"

# Load cursor-bridge Matrix defaults if present
if [[ -f "$BRIDGE_ENV" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$BRIDGE_ENV"
  set +a
  _ok "sourced $BRIDGE_ENV"
else
  _warn "forge-cursor-bridge .env not found ($BRIDGE_ENV)"
fi

# Matrix
[[ -n "${MATRIX_HOMESERVER:-}" ]] && _ok "MATRIX_HOMESERVER=$MATRIX_HOMESERVER" || _fail "MATRIX_HOMESERVER unset"
if [[ -n "${MATRIX_ACCESS_TOKEN:-}" ]]; then
  _ok "MATRIX_ACCESS_TOKEN set"
elif [[ -n "${MATRIX_USER:-}" && -n "${MATRIX_PASSWORD:-}" ]]; then
  _ok "MATRIX_USER + MATRIX_PASSWORD (will login)"
else
  _fail "Matrix auth: set MATRIX_ACCESS_TOKEN or MATRIX_USER + MATRIX_PASSWORD"
fi
ROOM="${FM_STUDIO_UX_MATRIX_ROOM_ID:-${MATRIX_STUDIO_UX_ROOM:-${MATRIX_CURSOR_ROOM:-${MATRIX_OPS_ROOM:-}}}}"
[[ -n "$ROOM" ]] && _ok "notify room=$ROOM" || _warn "FM_STUDIO_UX_MATRIX_ROOM_ID unset (default #studio-ux:matrix.forgedc.net)"

# Studio
STUDIO_URL="${FM_STUDIO_BASE_URL:-http://127.0.0.1:9792}"
if curl -fsS "$STUDIO_URL/health" >/dev/null 2>&1; then
  _ok "Studio health $STUDIO_URL"
else
  _fail "Studio not reachable at $STUDIO_URL"
fi

# Playwright (consumer studio-ui)
CONSUMER="${CONSUMER_REPO_ROOT:-$HOME/Code/forge-market}"
if [[ -d "$CONSUMER/studio-ui/node_modules/playwright" ]]; then
  _ok "playwright in $CONSUMER/studio-ui"
else
  _fail "playwright missing — run: cd $CONSUMER/studio-ui && npm install && npx playwright install chromium"
fi

# Optional GPT
if [[ -n "${CDP_URL:-}" ]] || curl -fsS "http://127.0.0.1:9222/json/version" >/dev/null 2>&1; then
  _ok "CDP available for ChatGPT"
else
  _warn "CDP not detected — use --mock-gpt or SKIP_GPT_ASSESSMENT=1"
fi

# Optional Cursor
if [[ "${SKIP_CURSOR_AGENT:-}" == "1" ]]; then
  _ok "SKIP_CURSOR_AGENT=1"
elif command -v agent >/dev/null 2>&1; then
  _ok "Cursor CLI (agent) on PATH"
else
  _warn "Cursor CLI not found — set SKIP_CURSOR_AGENT=1 for capture-only runs"
fi

# matrix-nio for notify
if python3 -c "import nio" 2>/dev/null; then
  _ok "python3 matrix-nio"
elif [[ -d "$HOME/Code/forge-cursor-bridge/.venv" ]]; then
  _ok "matrix-nio via forge-cursor-bridge .venv (use that PYTHON)"
else
  _warn "matrix-nio not in default python3 — pip install matrix-nio"
fi

_line ""
_line "Summary: ok=$ok warn=$warn fail=$fail"
[[ "$fail" -eq 0 ]]
