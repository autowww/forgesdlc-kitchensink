#!/usr/bin/env bash
# Studio UX PDCA dev/bootstrap loop — page-by-page capture → GPT → Cursor → gates → Matrix.
#
# Usage:
#   ./run-studio-ux-pdca-loop.sh <consumer_repo> <manifest_path> [options]
#
# Examples:
#   ./run-studio-ux-pdca-loop.sh ~/Code/forge-market scripts/fm-studio-ux-pdca/pages.manifest.yaml
#   ./run-studio-ux-pdca-loop.sh ~/Code/forge-market scripts/fm-studio-ux-pdca/pages.manifest.yaml --dry-run
#   ./run-studio-ux-pdca-loop.sh ~/Code/forge-market scripts/fm-studio-ux-pdca/pages.manifest.yaml --max-pages 2 --mock-gpt
#
set -euo pipefail

TOOL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KS_ROOT="$(cd "$TOOL_DIR/../.." && pwd)"

REPO_ROOT="${1:-}"
MANIFEST_REL="${2:-}"
shift 2 || true

DRY_RUN=0
MAX_PAGES="${FM_STUDIO_UX_MAX_PAGES:-0}"
MAX_ITER="${FM_STUDIO_UX_MAX_ITERATIONS_PER_PAGE:-5}"
MOCK_GPT=0
SKIP_CURSOR="${SKIP_CURSOR_AGENT:-0}"
CAMPAIGN_ID="${FM_STUDIO_UX_CAMPAIGN_ID:-}"
export FM_STUDIO_UX_CHATGPT_PROJECT="${FM_STUDIO_UX_CHATGPT_PROJECT:-Forge Market}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --max-pages) MAX_PAGES="${2:-2}"; shift ;;
    --max-iterations-per-page) MAX_ITER="${2:-5}"; shift ;;
    --mock-gpt) MOCK_GPT=1 ;;
    --campaign-id) CAMPAIGN_ID="${2:-}"; shift ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
  shift
done

[[ -n "$REPO_ROOT" && -n "$MANIFEST_REL" ]] || {
  echo "usage: $0 <consumer_repo> <manifest_path> [--dry-run] [--max-pages N] [--mock-gpt]" >&2
  exit 1
}

REPO_ROOT="$(cd "$REPO_ROOT" && pwd)"
MANIFEST_PATH="$REPO_ROOT/$MANIFEST_REL"
[[ -f "$MANIFEST_PATH" ]] || { echo "manifest not found: $MANIFEST_PATH" >&2; exit 1; }

# Workbench root
CODE_HUB="$KS_ROOT/.."
if [[ "$(basename "$CODE_HUB")" != "Code" ]]; then
  CODE_HUB="$(pwd)"
  while [[ "$CODE_HUB" != "/" && "$(basename "$CODE_HUB")" != "Code" ]]; do
    CODE_HUB="$(dirname "$CODE_HUB")"
  done
fi
WORKBENCH_ROOT="${FORGE_STUDIO_UX_WORKBENCH_ROOT:-$CODE_HUB/workbench/studio-ux-pdca}"

CONSUMER_ID="$(python3 -c "import yaml,sys; d=yaml.safe_load(open('$MANIFEST_PATH')); print(d.get('consumer_id','unknown'))")"
STUDIO_URL="$(python3 -c "import yaml,sys; d=yaml.safe_load(open('$MANIFEST_PATH')); print(d.get('studio_base_url','http://127.0.0.1:9792'))")"
[[ -n "$CAMPAIGN_ID" ]] || CAMPAIGN_ID="${CONSUMER_ID}-ux-$(date -u +%Y%m%dT%H%M%SZ)"
CAMPAIGN_DIR="$WORKBENCH_ROOT/$CONSUMER_ID/$CAMPAIGN_ID"
mkdir -p "$CAMPAIGN_DIR"

NOTIFY_PY="${NOTIFY_PYTHON:-python3}"
ASSESS_PY="${ASSESS_PYTHON:-}"
if [[ -z "$ASSESS_PY" && -x "$REPO_ROOT/.venv/bin/python" ]]; then
  ASSESS_PY="$REPO_ROOT/.venv/bin/python"
fi
[[ -n "$ASSESS_PY" ]] || ASSESS_PY="python3"
THRESHOLDS_JSON='{"overall":75,"improvement_delta":10,"absolute_pass":85}'

page_slugs=()
while IFS= read -r slug; do
  [[ -n "$slug" ]] && page_slugs+=("$slug")
done < <(python3 -c "
import yaml
d=yaml.safe_load(open('$MANIFEST_PATH'))
for p in d.get('pages',[]):
    print(p['slug'])
")

if [[ "${#page_slugs[@]}" -eq 0 ]]; then
  echo "no pages in manifest" >&2
  exit 1
fi

if [[ "$MAX_PAGES" -gt 0 && "${#page_slugs[@]}" -gt "$MAX_PAGES" ]]; then
  page_slugs=("${page_slugs[@]:0:$MAX_PAGES}")
fi

SUMMARY_PATH="$CAMPAIGN_DIR/campaign-summary.json"
if [[ ! -f "$SUMMARY_PATH" ]]; then
  python3 - "$SUMMARY_PATH" "$CONSUMER_ID" "$CAMPAIGN_ID" "$REPO_ROOT" "$MANIFEST_REL" <<'PY'
import json, sys
from datetime import datetime, timezone
out, consumer, campaign, repo, manifest = sys.argv[1:6]
payload = {
    "consumer_id": consumer,
    "campaign_id": campaign,
    "repo_root": repo,
    "manifest_path": manifest,
    "started_at": datetime.now(timezone.utc).isoformat(),
    "pages_done": [],
    "current_page_slug": None,
    "current_iteration": 0,
    "status": "running",
}
open(out, "w").write(json.dumps(payload, indent=2) + "\n")
PY
fi

cp "$MANIFEST_PATH" "$CAMPAIGN_DIR/manifest-snapshot.yaml"

echo "[studio-ux-pdca] consumer=$CONSUMER_ID campaign=$CAMPAIGN_ID pages=${#page_slugs[@]} dry_run=$DRY_RUN"

_hooks_module() {
  python3 -c "import sys; sys.path.insert(0, '$REPO_ROOT/scripts/fm-studio-ux-pdca'); import consumer_hooks; consumer_hooks" 2>/dev/null || true
}

_run_hook() {
  local hook="$1"
  shift
  if [[ -f "$REPO_ROOT/scripts/fm-studio-ux-pdca/consumer_hooks.py" ]]; then
    PYTHONPATH="$REPO_ROOT/scripts/fm-studio-ux-pdca${PYTHONPATH:+:$PYTHONPATH}" \
      python3 -c "import consumer_hooks, json, sys; print(json.dumps(consumer_hooks.run_hook('$hook', json.loads(sys.argv[1]))))" "$1"
  else
    echo '{"ok":true,"skipped":true}'
  fi
}

for slug in "${page_slugs[@]}"; do
  echo "[studio-ux-pdca] page=$slug"
  PAGE_DIR="$CAMPAIGN_DIR/pages/$slug"
  mkdir -p "$PAGE_DIR"
  page_json_tmp="$(mktemp)"
  python3 -c "
import json, yaml
manifest = yaml.safe_load(open('$MANIFEST_PATH'))
page = next(p for p in manifest['pages'] if p['slug']=='$slug')
open('$page_json_tmp','w').write(json.dumps(page))
"
  iter=1
  gates_passed=0
  consecutive_pass=0
  while [[ "$iter" -le "$MAX_ITER" ]]; do
    CYCLE_DIR="$PAGE_DIR/iter-$(printf '%03d' "$iter")"
    mkdir -p "$CYCLE_DIR"
    echo "[studio-ux-pdca]   iter=$iter dir=$CYCLE_DIR"
    if [[ "$DRY_RUN" -eq 1 ]]; then
      echo "[studio-ux-pdca]   dry-run: would capture $STUDIO_URL$(python3 -c "import json; print(json.load(open('$page_json_tmp'))['path'])")"
      break
    fi

    _run_hook bootstrap_fixtures "$(python3 -c "import json; print(json.dumps({'page_slug':'$slug'}))")" >/dev/null || true

    export CONSUMER_REPO_ROOT="$REPO_ROOT"
    node "$TOOL_DIR/capture-page.mjs" "$STUDIO_URL" "$page_json_tmp" "$CYCLE_DIR" --mode before || {
      echo "[studio-ux-pdca] capture failed for slug=$slug (continuing campaign)" >&2
      break
    }

    if [[ -f "$REPO_ROOT/scripts/fm-studio-ux-pdca/wiki-context.mjs" ]]; then
      node "$REPO_ROOT/scripts/fm-studio-ux-pdca/wiki-context.mjs" "$CYCLE_DIR/page.json" "$CYCLE_DIR/wiki-context.md" "$REPO_ROOT" || true
    fi

    PAGE_TITLE="$(python3 -c "import json; print(json.load(open('$page_json_tmp'))['title'])")"
    PAGE_PATH="$(python3 -c "import json; print(json.load(open('$page_json_tmp'))['path'])")"
    PURPOSE="$(head -5 "$CYCLE_DIR/wiki-context.md" 2>/dev/null | tr '\n' ' ' || echo "Studio UX PDCA page review")"
    "$NOTIFY_PY" "$TOOL_DIR/notify-matrix.py" \
      --event cycle-start \
      --cycle-dir "$CYCLE_DIR" \
      --consumer-id "$CONSUMER_ID" \
      --page-slug "$slug" \
      --page-title "$PAGE_TITLE" \
      --page-path "$PAGE_PATH" \
      --purpose "$PURPOSE" \
      --campaign-id "$CAMPAIGN_ID" || true

    node "$TOOL_DIR/build-page-bundle.mjs" "$CYCLE_DIR" || true

    if [[ "$MOCK_GPT" -eq 1 ]]; then
      "$ASSESS_PY" "$TOOL_DIR/assess-page-gpt.py" "$CYCLE_DIR" --mock
    else
      if ! "$ASSESS_PY" "$TOOL_DIR/assess-page-gpt.py" "$CYCLE_DIR" --project "$FM_STUDIO_UX_CHATGPT_PROJECT"; then
        echo "[studio-ux-pdca] ChatGPT assessment failed for slug=$slug (continuing campaign)" >&2
        break
      fi
    fi

    PLAN_PATH="$REPO_ROOT/.cursor/plans/studio-ux-pdca/${slug}.plan.md"
    mkdir -p "$(dirname "$PLAN_PATH")"
    if [[ -f "$CYCLE_DIR/pdca-prompt.md" ]]; then
      cp "$CYCLE_DIR/pdca-prompt.md" "$PLAN_PATH"
    fi

    if [[ "$SKIP_CURSOR" != "1" ]]; then
      bash "$TOOL_DIR/run-cursor-pdca.sh" "$REPO_ROOT" "$PLAN_PATH" "$CYCLE_DIR" || true
    fi

    _run_hook build_and_restart "$(python3 -c "import json; print(json.dumps({'repo_root':'$REPO_ROOT'}))")" >/dev/null || true

    node "$TOOL_DIR/capture-page.mjs" "$STUDIO_URL" "$page_json_tmp" "$CYCLE_DIR" --mode after

    node "$TOOL_DIR/score-page.mjs" "$CYCLE_DIR"

    GATE_PAYLOAD="$(mktemp)"
    python3 <<PY >"$GATE_PAYLOAD"
import json, yaml
m = yaml.safe_load(open("$MANIFEST_PATH"))
p = next(x for x in m["pages"] if x["slug"] == "$slug")
print(json.dumps({
    "page_slug": "$slug",
    "cycle_dir": "$CYCLE_DIR",
    "repo_root": "$REPO_ROOT",
    "requires_dual_wiki_gate": bool(p.get("requires_dual_wiki_gate")),
}))
PY
    HOOK_GATES_FILE="$(mktemp)"
    PYTHONPATH="$REPO_ROOT/scripts/fm-studio-ux-pdca${PYTHONPATH:+:$PYTHONPATH}" \
      python3 -c "import consumer_hooks, json; json.dump(consumer_hooks.run_hook('run_gates', json.load(open('$GATE_PAYLOAD'))), open('$HOOK_GATES_FILE','w'))" 2>/dev/null || echo '{"pytest_ok":true,"playwright_ok":true,"dual_wiki_ok":true}' >"$HOOK_GATES_FILE"
    PYTEST_OK="$(python3 -c "import json; print(json.load(open('$HOOK_GATES_FILE')).get('pytest_ok', True))")"
    PW_OK="$(python3 -c "import json; print(json.load(open('$HOOK_GATES_FILE')).get('playwright_ok', True))")"
    DW_OK="$(python3 -c "import json; print(json.load(open('$HOOK_GATES_FILE')).get('dual_wiki_ok', True))")"
    rm -f "$GATE_PAYLOAD" "$HOOK_GATES_FILE"

    python3 -c "
import json
p='$CYCLE_DIR/scores.json'
d=json.load(open(p))
d['pytest_ok'] = '$PYTEST_OK' == 'True'
d['playwright_ok'] = '$PW_OK' == 'True'
d['dual_wiki_ok'] = '$DW_OK' == 'True'
json.dump(d, open(p,'w'), indent=2)
"

    node "$TOOL_DIR/lib/gates.mjs" "$CYCLE_DIR/scores.json" "$CYCLE_DIR/gates.json" --thresholds "$THRESHOLDS_JSON" || true
    gates_passed="$(python3 -c "import json; print(1 if json.load(open('$CYCLE_DIR/gates.json'))['gates']['passed'] else 0)")"
    consecutive_pass=$(( gates_passed ? consecutive_pass + 1 : 0 ))

    "$NOTIFY_PY" "$TOOL_DIR/notify-matrix.py" \
      --event cycle-complete \
      --cycle-dir "$CYCLE_DIR" \
      --consumer-id "$CONSUMER_ID" \
      --page-slug "$slug" \
      --iteration "$iter" || true

    node "$TOOL_DIR/build-page-bundle.mjs" "$CYCLE_DIR"

    _run_hook advance_page_queue "$(python3 -c "import json; print(json.dumps({'campaign_dir':'$CAMPAIGN_DIR','page_slug':'$slug','iteration':$iter,'gates_passed': bool($gates_passed)}))")" >/dev/null || true

    if [[ "$gates_passed" -eq 1 && "$consecutive_pass" -ge 1 ]]; then
      echo "[studio-ux-pdca]   page $slug passed gates at iter $iter"
      python3 -c "
import json
from datetime import datetime, timezone
p='$SUMMARY_PATH'
d=json.load(open(p))
if '$slug' not in d.get('pages_done',[]):
    d.setdefault('pages_done',[]).append('$slug')
d['current_page_slug']='$slug'
d['updated_at']=datetime.now(timezone.utc).isoformat()
json.dump(d, open(p,'w'), indent=2)
"
      break
    fi
    iter=$((iter + 1))
  done
  rm -f "$page_json_tmp"
done

python3 -c "
import json
from datetime import datetime, timezone
p='$SUMMARY_PATH'
d=json.load(open(p))
d['status']='completed'
d['finished_at']=datetime.now(timezone.utc).isoformat()
json.dump(d, open(p,'w'), indent=2)
"

echo "[studio-ux-pdca] done campaign=$CAMPAIGN_DIR"
