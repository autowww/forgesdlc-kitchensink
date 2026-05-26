# Forge Website Accessibility Auditor — Cursor workflow

The accessibility auditor writes **`a11y-audit-report.md`** and **`a11y-audit-data.json`** under **`--out`** (default: `workbench/a11y-auditor/…`). It does not modify product code.

## Recommended execution

1. Run from the **target website repo** with a live **`--site`** URL (not `--static-only` for sign-off).
2. Choose a **compliance profile** via **`--standard`** or **`--compliance-profile`** (e.g. `wcag22aa`, `ada-title-ii-wcag21aa`, `section508`).
3. Set **`--rules-scope auto`** so KS rules apply only on KS-driven sites.
4. Use **`--lanes axe,det`** by default; add **`--enable-ai`** to list eligible `AI.A11Y.*` principles for agent review.
5. Narrow with **`--only-deterministic-rule-ids`** when fixing one rule at a time.

Reports include **`coverageMap`**: axe tags, DET rules in scope, excluded DET rules, and manual testing themes. **Not** legal conformance or VPAT.

## Examples

WCAG 2.2 AA (Forge default):

```bash
node kitchensink/tools/website-a11y-auditor/analyze-website-a11y.mjs \
  --repo . \
  --site http://127.0.0.1:8080 \
  --standard wcag22aa \
  --rules-scope auto \
  --lanes axe,det \
  --out ../workbench/a11y-auditor/campaign-01
```

ADA Title II (WCAG 2.1 AA axe bundle):

```bash
node kitchensink/tools/website-a11y-auditor/analyze-website-a11y.mjs \
  --repo . \
  --site http://127.0.0.1:8080 \
  --compliance-profile ada-title-ii-wcag21aa \
  --rules-scope auto \
  --lanes axe,det
```

## Showcase handbook

Rule purpose, **compliance profile table**, and **Before/After** examples:

- `showcase/a11y-audit-rules.html` (compliance profiles section)
- `showcase/a11y-audit-ecosystem-examples.html`

Design reference: `docs/design/a11y-audit/compliance-profiles.md`.

## Related

- [UX auditor workflow](forge-website-ux-auditor-cursor.md) — copy/IA (separate tool)
- [forge-accessibility](https://github.com/autowww/forge-accessibility) — Studio CDP + deep evidence
