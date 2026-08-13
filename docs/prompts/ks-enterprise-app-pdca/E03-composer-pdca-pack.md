# E03 — Composer spike: widen PDCA closed pack

**Phase:** E03  
**Executor:** Composer 2.5  
**Depends on:** E02

## Goal

Widen `tools/studio-ux-pdca/lib/enterprise-app-ruleset.json` with existing DET.APP rules, expand `ksComponents`, add optional `principles` field on rows, update assess prompt and tests.

## Files to edit

| Path |
|------|
| `tools/studio-ux-pdca/lib/enterprise-app-ruleset.json` |
| `tools/studio-ux-pdca/prompts/assess-studio-ux.txt` |
| `tools/studio-ux-pdca/lib/enterprise-app-ruleset.test.mjs` |

## Add rule rows (minimum)

- `DET.APP.BULK_ACTION_SCOPE`
- `DET.APP.DATA_REFRESH_STALENESS`
- `DET.APP.EMPTY_LOADING_ERROR_SUCCESS`
- `DET.APP.DISABLED_REASON`
- `DET.APP.TOAST_LIFECYCLE`
- `DET.APP.PRIMARY_STATE`
- `DET.FORM.LABEL_ERROR_SUMMARY`

Use handbook slugs from `rule-pages.manifest.json`. Add `principles: ["ENT.APP.05", …]` where appropriate.

## Expand ksComponents

Add React/JS hashes with `useWhen`: Frh, Fsb, Fwb, Fen, Fda, Fvw, Fdg, Fkg, Wlc, Dtb, Swz (plus existing Svc, Ftb, Sab, Cap).

## assess-studio-ux.txt

- Mention `docs/design/enterprise-app/` as ENT.APP handbook path.
- Reiterate forbid `DET.SECTION.SINGLE_JOB` on Studio.

## Tests

Extend `enterprise-app-ruleset.test.mjs`:
- Assert new DET ids present
- `DET.SECTION.SINGLE_JOB` still absent
- Optional: prompt appendix mentions ENT.APP path or new rule

## Forbidden scope

- No scorer logic changes unless required for new rules
- No new DET implementations

## Acceptance

- [ ] `node --test tools/studio-ux-pdca/lib/enterprise-app-ruleset.test.mjs` passes
- [ ] Python dry-run: `python3 -c "from tools.studio_ux_pdca.lib.load_ruleset import format_prompt_appendix; print(format_prompt_appendix()[:500])"` — adjust import path if needed

## Check

```bash
node --test tools/studio-ux-pdca/lib/enterprise-app-ruleset.test.mjs
```

## Report

List new rule ids and ksComponents added.
