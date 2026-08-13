# P0 — Structured suggestion schema

**Model:** Composer 2.5  
**Allowlist:** `tools/studio-ux-pdca/prompts/`, `lib/emit_pdca_prompts.py`, `assess-page-gpt.py`

## Plan

Replace markdown-in-JSON `pdca_prompt` with structured `plan`, `do`, `check`, `adjust` arrays on each `prioritized_suggestions[]` entry. Harness renders PDCA markdown locally.

**Success:** `assess-studio-ux.txt` schema requires structured fields; `emit_pdca_prompts.py` builds `## Plan/Do/Check/Adjust` from arrays; top-level `pdca_prompt` removed from output.

## Do

1. Update `prompts/assess-studio-ux.txt` output schema: `plan[]`, `do[]`, `check[]`, `adjust[]`; remove `pdca_prompt` from schema.
2. Update `lib/emit_pdca_prompts.py`: add `_render_pdca_markdown()` from structured fields; ignore legacy `pdca_prompt`.
3. Update `assess-page-gpt.py` mock assessment to use structured fields.
4. Update `_suggestion_from_finding` fallback to emit empty structured arrays (emit fills defaults).

## Check

```bash
cd forgesdlc-kitchensink/tools/studio-ux-pdca
python3 -m pytest lib/test_emit_validate.py -q
python3 assess-page-gpt.py /tmp/studio-ux-mock-cycle --mock
test -f /tmp/studio-ux-mock-cycle/pdca-prompts/01-*.md
grep -q "## Plan" /tmp/studio-ux-mock-cycle/pdca-prompts/01-*.md
```

## Adjust

- If GPT still emits `pdca_prompt`, validator should warn and emit should prefer structured fields.
- Keep finding-based fallback when `prioritized_suggestions` is empty.
