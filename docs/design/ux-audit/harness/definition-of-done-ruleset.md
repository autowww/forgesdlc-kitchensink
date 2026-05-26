# Definition of Done — Ruleset

## Purpose

The **ruleset** artifact is done when the rule is machine-addressable and queued for handbook + harness coverage.

## Acceptance criteria

- [ ] DET: `design-rules/deterministic/generated/<rule>.check.js` exists and registry `modulePath` resolves.
- [ ] AI: `design-rules/ai/prompts/generated/<rule>.md` exists and registry references it.
- [ ] Rule ID appears in harness coverage matrix when in the implemented DET/AI set.
- [ ] Handbook page exists or is queued (`rule-pages.manifest.json` not `missing`).

## Verification

```bash
cd tools/website-ux-auditor
npm run blend-rules
# Confirm rule in registry.generated.json and module file on disk
```

## Known exclusions

- **Planned** DET rows (documented but not implemented) are ruleset-done for catalog only; they are not harness-done until `implementationStatus: implemented`.
- Registry **stub** rules (documented count vs implemented count) stay out of DET ruleset harness until implemented.
- **`DET.THEME.FONT_STACK`:** stub check (`run()` returns `[]`); excluded in `build_rule_defect_fixtures.py` (`EXCLUDED_RULES`); handbook page for docs only.
