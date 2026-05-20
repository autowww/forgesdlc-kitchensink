Execute the phase below. You may edit files. Keep the change scoped. Run relevant checks at the end and update the matching .cursor/plans/ks-ux-component-rules/*.md evidence/report file.

--- PLAN SUMMARY START ---

--- PLAN SUMMARY END ---

--- PHASE PROMPT START ---
# 06 — Remediation generator integration

Goal: make future site remediation plans cite component/layout/page hashes and design contracts.

Update remediation planning so findings can say:

```text
Affected visual hash: Ldg
Contract: docs/design/catalog/layouts/Ldg-layout-landing.md
Rule: DET.VISUAL.RHYTHM
AI principle: AI.PREMIUM.ENTERPRISE_FEEL
```

Likely files:

- `tools/website-ux-auditor/lib/defect-remediation-plans.js`
- `tools/website-ux-auditor/analyze-website-ux.mjs`
- `tools/website-ux-auditor/score-website-ux.mjs`
- `tools/website-ux-auditor/checks/visual-catalog-awareness.js`
- `tools/website-ux-auditor/lib/visual-catalog.js`

Rules:

- auditor and scorer stay separate;
- both may read generated visual registry JSON;
- plans should use deterministic findings first;
- AI-enabled review is run after deterministic Major+ findings are resolved or when explicitly requested.

Acceptance:
- generated remediation plans cite hashes/contracts where DOM evidence includes `data-ks-hash` or `hash`;
- tests pass.
--- PHASE PROMPT END ---
