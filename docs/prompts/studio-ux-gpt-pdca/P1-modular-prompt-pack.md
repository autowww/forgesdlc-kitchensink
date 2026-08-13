# P1 — Modular prompt pack

**Model:** Composer 2.5  
**Allowlist:** `prompts/`, `assess-page-gpt.py`, `forge-market/scripts/fm-studio-ux-pdca/wiki-context.mjs` (pointer only)

## Plan

Split assess prompt into core template + page-type includes. Handbook URLs come **only** from `format_prompt_appendix()`.

**Success:** `_build_prompt` concatenates `assess-studio-ux.txt` + `includes/studio_ops.txt` or `includes/wiki_graph.txt`; no duplicated URL list in core template.

## Do

1. Create `prompts/includes/studio_ops.txt` (wiki axis N/A=100).
2. Create `prompts/includes/wiki_graph.txt` (dual-wiki uplift rubric table).
3. Remove inline handbook URL list from `assess-studio-ux.txt`; reference appendix only.
4. Update `assess-page-gpt.py` `_load_page_include()` and `_build_prompt()`.
5. Point `wiki-context.mjs` at KS `wiki_graph.txt` for canonical rubric reference.

## Check

```bash
cd forgesdlc-kitchensink/tools/studio-ux-pdca
test -f prompts/includes/studio_ops.txt
test -f prompts/includes/wiki_graph.txt
! grep -q 'forgesdlc.net' prompts/assess-studio-ux.txt
! grep -q '/showcase/ux-audit' prompts/assess-studio-ux.txt
python3 -c "
from pathlib import Path
import sys
sys.path.insert(0,'lib')
from assess_page_gpt import _build_prompt
" 2>/dev/null || python3 -c "
import importlib.util
spec = importlib.util.spec_from_file_location('ap', 'assess-page-gpt.py')
"
```

## Adjust

- If core template still embeds URLs, move them to appendix-only wording.
- Wiki include must not duplicate FM feature-map content — rubric only.
