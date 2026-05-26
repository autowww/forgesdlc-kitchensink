# Forge site commands — accessibility auditor

Run from a **consumer** repo root (forgesdlc, blueprints-website, etc.) after `kitchensink` submodule is present.

## Audit (remediation)

```bash
node kitchensink/tools/website-a11y-auditor/analyze-website-a11y.mjs \
  --repo . \
  --site http://127.0.0.1:8080 \
  --standard wcag22aa \
  --rules-scope auto \
  --lanes axe,det \
  --out "$PWD/../workbench/a11y-auditor/campaign-01"
```

## Score (sitewide)

```bash
node kitchensink/tools/website-a11y-auditor/score-website-a11y.mjs \
  --repo . \
  --site http://127.0.0.1:8080 \
  --standard wcag21aa \
  --max-pages 60 \
  --out .cursor/reports/a11y-quality
```

## KS-only regression

```bash
node kitchensink/tools/website-a11y-auditor/analyze-website-a11y.mjs \
  --repo . \
  --site http://127.0.0.1:8080 \
  --rules-scope ks \
  --lanes det \
  --skip-axe
```

## Generic-only (non-KS SPA)

```bash
node kitchensink/tools/website-a11y-auditor/analyze-website-a11y.mjs \
  --repo . \
  --site https://example.com \
  --rules-scope generic \
  --lanes axe,det
```
