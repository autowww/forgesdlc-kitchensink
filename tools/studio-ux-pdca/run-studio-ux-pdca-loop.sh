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
STOP_ON_FAIL="${FM_STUDIO_UX_STOP_ON_FAIL:-0}"
PAGE_TOTAL="${#page_slugs[@]}"

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

_notify() {
  "$NOTIFY_PY" "$TOOL_DIR/notify-matrix.py" "$@" || true
}

if [[ "$DRY_RUN" -eq 0 ]]; then
  _notify \
    --event campaign-start \
    --campaign-dir "$CAMPAIGN_DIR" \
    --cycle-dir "$CAMPAIGN_DIR" \
    --consumer-id "$CONSUMER_ID" \
    --campaign-id "$CAMPAIGN_ID" \
    --page-total "$PAGE_TOTAL" \
    --status "queued $PAGE_TOTAL page(s)"
fi

page_idx=0
for slug in "${page_slugs[@]}"; do
  page_idx=$((page_idx + 1))
  echo "[studio-ux-pdca] page=$slug ($page_idx/$PAGE_TOTAL)"
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
    PURPOSE="$(
      PAGE_TITLE="$PAGE_TITLE" CYCLE_DIR="$CYCLE_DIR" TOOL_DIR="$TOOL_DIR" python3 - <<'PY'
import os, sys
from pathlib import Path
sys.path.insert(0, os.environ["TOOL_DIR"] + "/lib")
from matrix_messages import clean_purpose
wiki = Path(os.environ["CYCLE_DIR"]) / "wiki-context.md"
raw = wiki.read_text(encoding="utf-8") if wiki.exists() else ""
print(clean_purpose(raw, page_title=os.environ.get("PAGE_TITLE", "")))
PY
    )"
    _notify \
      --event cycle-start \
      --cycle-dir "$CYCLE_DIR" \
      --consumer-id "$CONSUMER_ID" \
      --page-slug "$slug" \
      --page-title "$PAGE_TITLE" \
      --page-path "$PAGE_PATH" \
      --purpose "$PURPOSE" \
      --campaign-id "$CAMPAIGN_ID" \
      --page-index "$page_idx" \
      --page-total "$PAGE_TOTAL"

    node "$TOOL_DIR/build-page-bundle.mjs" "$CYCLE_DIR" || true

    _notify \
      --event progress \
      --cycle-dir "$CYCLE_DIR" \
      --consumer-id "$CONSUMER_ID" \
      --page-slug "$slug" \
      --iteration "$iter" \
      --campaign-id "$CAMPAIGN_ID" \
      --status "assessing (ChatGPT)" \
      --detail "Capturing findings and ranked suggestions…"

    if [[ "$MOCK_GPT" -eq 1 ]]; then
      "$ASSESS_PY" "$TOOL_DIR/assess-page-gpt.py" "$CYCLE_DIR" --mock
    else
      if ! "$ASSESS_PY" "$TOOL_DIR/assess-page-gpt.py" "$CYCLE_DIR" --project "$FM_STUDIO_UX_CHATGPT_PROJECT"; then
        echo "[studio-ux-pdca] ChatGPT assessment failed for slug=$slug (continuing campaign)" >&2
        _notify \
          --event progress \
          --cycle-dir "$CYCLE_DIR" \
          --consumer-id "$CONSUMER_ID" \
          --page-slug "$slug" \
          --iteration "$iter" \
          --campaign-id "$CAMPAIGN_ID" \
          --status "assessment failed" \
          --detail "Skipping remaining steps for this page."
        break
      fi
    fi

    PLAN_DIR="$REPO_ROOT/.cursor/plans/studio-ux-pdca"
    mkdir -p "$PLAN_DIR"
    PROMPTS_DIR="$CYCLE_DIR/pdca-prompts"
    CURSOR_APPLIED=0
    CURSOR_TOTAL=0
    if [[ -d "$PROMPTS_DIR" ]] && compgen -G "$PROMPTS_DIR/"*.md >/dev/null; then
      mapfile -t PDCA_PLANS < <(find "$PROMPTS_DIR" -maxdepth 1 -name '*.md' | sort)
      CURSOR_TOTAL="${#PDCA_PLANS[@]}"
      echo "[studio-ux-pdca]   cursor: ${#PDCA_PLANS[@]} prioritized suggestion(s)"
      sug_idx=0
      for plan_src in "${PDCA_PLANS[@]}"; do
        sug_idx=$((sug_idx + 1))
        plan_base="$(basename "$plan_src" .md)"
        PLAN_PATH="$PLAN_DIR/${slug}-${plan_base}.plan.md"
        cp "$plan_src" "$PLAN_PATH"
        if [[ "$SKIP_CURSOR" != "1" ]]; then
          echo "[studio-ux-pdca]   cursor suggestion $sug_idx/${#PDCA_PLANS[@]}: $plan_base"
          _notify \
            --event progress \
            --cycle-dir "$CYCLE_DIR" \
            --consumer-id "$CONSUMER_ID" \
            --page-slug "$slug" \
            --iteration "$iter" \
            --campaign-id "$CAMPAIGN_ID" \
            --status "cursor $sug_idx/$CURSOR_TOTAL" \
            --detail "$plan_base"
          STUDIO_UX_SUGGESTION_RANK="$sug_idx" \
          STUDIO_UX_SUGGESTION_TOTAL="${#PDCA_PLANS[@]}" \
            bash "$TOOL_DIR/run-cursor-pdca.sh" "$REPO_ROOT" "$PLAN_PATH" "$CYCLE_DIR" || true
          CURSOR_APPLIED=$sug_idx
        fi
      done
      if [[ "$SKIP_CURSOR" == "1" ]]; then
        CURSOR_APPLIED=0
      fi
    else
      PLAN_PATH="$PLAN_DIR/${slug}.plan.md"
      if [[ -f "$CYCLE_DIR/pdca-prompt.md" ]]; then
        cp "$CYCLE_DIR/pdca-prompt.md" "$PLAN_PATH"
      fi
      CURSOR_TOTAL=1
      if [[ "$SKIP_CURSOR" != "1" ]]; then
        _notify \
          --event progress \
          --cycle-dir "$CYCLE_DIR" \
          --consumer-id "$CONSUMER_ID" \
          --page-slug "$slug" \
          --iteration "$iter" \
          --campaign-id "$CAMPAIGN_ID" \
          --status "cursor 1/1" \
          --detail "legacy pdca-prompt"
        bash "$TOOL_DIR/run-cursor-pdca.sh" "$REPO_ROOT" "$PLAN_PATH" "$CYCLE_DIR" || true
        CURSOR_APPLIED=1
      else
        CURSOR_APPLIED=0
      fi
    fi

    _notify \
      --event progress \
      --cycle-dir "$CYCLE_DIR" \
      --consumer-id "$CONSUMER_ID" \
      --page-slug "$slug" \
      --iteration "$iter" \
      --campaign-id "$CAMPAIGN_ID" \
      --status "build + redeploy" \
      --detail "Then capture after / score / gates"

    _run_hook build_and_restart "$(python3 -c "import json; print(json.dumps({'repo_root':'$REPO_ROOT'}))")" >/dev/null || true

    node "$TOOL_DIR/capture-page.mjs" "$STUDIO_URL" "$page_json_tmp" "$CYCLE_DIR" --mode after

    _notify \
      --event progress \
      --cycle-dir "$CYCLE_DIR" \
      --consumer-id "$CONSUMER_ID" \
      --page-slug "$slug" \
      --iteration "$iter" \
      --campaign-id "$CAMPAIGN_ID" \
      --status "gating" \
      --detail "Score + pytest / Playwright / dual-wiki"

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

    _notify \
      --event cycle-complete \
      --cycle-dir "$CYCLE_DIR" \
      --consumer-id "$CONSUMER_ID" \
      --page-slug "$slug" \
      --iteration "$iter" \
      --campaign-id "$CAMPAIGN_ID" \
      --page-index "$page_idx" \
      --page-total "$PAGE_TOTAL" \
      --cursor-applied "$CURSOR_APPLIED" \
      --cursor-total "$CURSOR_TOTAL"

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
    if [[ "$gates_passed" -ne 1 && "$STOP_ON_FAIL" == "1" ]]; then
      echo "[studio-ux-pdca]   STOP_ON_FAIL=1 — halting campaign after FAIL on $slug iter $iter" >&2
      _notify \
        --event progress \
        --cycle-dir "$CYCLE_DIR" \
        --consumer-id "$CONSUMER_ID" \
        --page-slug "$slug" \
        --iteration "$iter" \
        --campaign-id "$CAMPAIGN_ID" \
        --status "stopped on FAIL" \
        --detail "FM_STUDIO_UX_STOP_ON_FAIL=1 — fix gates or unset to continue"
      break 2
    fi
    iter=$((iter + 1))
  done
  rm -f "$page_json_tmp"
done

PAGES_DONE="$(python3 -c "import json; print(len(json.load(open('$SUMMARY_PATH')).get('pages_done',[])))")"
python3 -c "
import json
from datetime import datetime, timezone
p='$SUMMARY_PATH'
d=json.load(open(p))
d['status']='completed'
d['finished_at']=datetime.now(timezone.utc).isoformat()
json.dump(d, open(p,'w'), indent=2)
"

if [[ "$DRY_RUN" -eq 0 ]]; then
  _notify \
    --event campaign-complete \
    --campaign-dir "$CAMPAIGN_DIR" \
    --cycle-dir "$CAMPAIGN_DIR" \
    --consumer-id "$CONSUMER_ID" \
    --campaign-id "$CAMPAIGN_ID" \
    --page-total "$PAGE_TOTAL" \
    --pages-done "$PAGES_DONE" \
    --status "completed"
fi

echo "[studio-ux-pdca] done campaign=$CAMPAIGN_DIR"
