# P3 — Cursor scope gate and token budget

**Model:** Composer 2.5  
**Allowlist:** `run-cursor-pdca.sh`, `assess-page-gpt.py`, `.cursor/rules/forge-studio-ux-pdca-runner.mdc`

## Plan

Strengthen Cursor single-suggestion enforcement and truncate `description.md` to 8k chars in prompt assembly. JPEG attach path unchanged.

**Success:** Cursor prompt includes HARD SCOPE GATE; description truncated with notice; runner rule updated.

## Do

1. Update `run-cursor-pdca.sh` with mandatory scope block (rank/total when set).
2. Add `_truncate_text()` in `assess-page-gpt.py` (`STUDIO_UX_DESCRIPTION_MAX_CHARS` default 8000).
3. Update `forge-studio-ux-pdca-runner.mdc` with hard scope gate bullet.

## Check

```bash
cd forgesdlc-kitchensink/tools/studio-ux-pdca
grep -q 'HARD SCOPE GATE' run-cursor-pdca.sh
grep -q 'DESCRIPTION_MAX_CHARS' assess-page-gpt.py
grep -q 'Hard scope gate' ../../.cursor/rules/forge-studio-ux-pdca-runner.mdc
```

## Adjust

- Do not truncate screenshot or ruleset appendix — only `description.md`.
- Keep `_prepare_attach_file` JPEG path for large PNGs.
