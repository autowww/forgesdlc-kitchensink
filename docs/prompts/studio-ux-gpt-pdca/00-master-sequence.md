# Studio GPT assessor PDCA — master sequence

Orchestrator: high-tier main (Grok) between Composer phases. Do **not** edit this file during execution.

## Campaign goal

Harden the Studio UX ChatGPT assessor so it emits ≤5 structured, single-scope suggestions; validate and render PDCA markdown locally; strengthen Cursor execution; document three prompt families.

## Phase order

| Phase | Composer prompt | Gate before next |
|-------|-----------------|------------------|
| P0 | [P0-structured-suggestion-schema.md](P0-structured-suggestion-schema.md) | Schema uses `plan/do/check/adjust`; emit renders locally; no legacy `pdca_prompt` |
| P1 | [P1-modular-prompt-pack.md](P1-modular-prompt-pack.md) | Core + include assembly; handbook links only in appendix |
| P2 | [P2-validate-and-emit.md](P2-validate-and-emit.md) | `validate_suggestions` + unit tests green |
| P3 | [P3-cursor-and-budget.md](P3-cursor-and-budget.md) | Cursor hard scope gate; DOM truncate 8k |
| P4 | [P4-docs-and-examples.md](P4-docs-and-examples.md) | Three-family docs + few-shot examples |
| P5 | Verify | `python -m pytest lib/test_emit_validate.py` + `node --test lib/enterprise-app-ruleset.test.mjs` |

## Grok review checkpoints

1. **After P0–P1:** Diff prompt assembly; ensure no `.net` or `/showcase/` without `/cases/`.
2. **After P2:** Confirm finding→suggestion fallback still works; validator warnings do not drop all suggestions.
3. **After P3–P4:** README parity with harness behavior.
4. **P5 (optional):** One live assess with `SKIP_CURSOR_AGENT=1` on a wiki page.

## Out of scope

- UI remounts in forge-market
- Website UX auditor (`analyze-website-ux.mjs`) changes
- Switching from CDP ChatGPT to API

## Shared template

Composer phases use [_prompt-template.md](_prompt-template.md).
