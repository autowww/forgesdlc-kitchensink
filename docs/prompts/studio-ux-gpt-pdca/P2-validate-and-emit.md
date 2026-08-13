# P2 — Validate and emit hardening

**Model:** Composer 2.5  
**Allowlist:** `lib/validate_suggestions.py`, `lib/emit_pdca_prompts.py`, `lib/test_emit_validate.py`, `assess-page-gpt.py`

## Plan

Add `validate_suggestions` to cap at 5, warn on bad rule_ids and laundry-list `do[]`, integrate before emit. Unit tests cover render, fallback, wiki boost.

**Success:** Warnings land in `assessment._suggestion_warnings`; tests pass.

## Do

1. Create `lib/validate_suggestions.py`.
2. Wire into `assess-page-gpt.py` before `emit_pdca_prompts`.
3. Create `lib/test_emit_validate.py` with cases: render, fallback, wiki boost, cap, bad rule_id, laundry list.
4. Harden emit: strip top-level `pdca_prompt` from assessment output.

## Check

```bash
cd forgesdlc-kitchensink/tools/studio-ux-pdca
python3 -m pytest lib/test_emit_validate.py -v
node --test lib/enterprise-app-ruleset.test.mjs
```

## Adjust

- Validator must soft-warn, not drop all suggestions on minor issues.
- Keep `normalize_prioritized_suggestions` wiki injection when validator warns about missing wiki-axis item.
