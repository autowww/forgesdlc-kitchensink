---
id: forge.website-ux-auditor.site-commands
kind: ks-runbook
status: published
owner: Forge UX
updated: 2026-05-17
---

# Forge Website UX Auditor — site command examples

Run these from each **website repo root**. Point `node` at the analyzer script:

- **Kitchen Sink checkout:** `tools/website-ux-auditor/analyze-website-ux.mjs` (from KS repo root).
- ** Submodule:** `kitchensink/tools/website-ux-auditor/analyze-website-ux.mjs`.

Use `--standard kitchensink/docs/design/forge-enterprise-ai-website-standard.md` when the standard lives only inside the submodule. If you vendor the standard into the website repo, use `docs/design/forge-enterprise-ai-website-standard.md` and you can omit `--standard` when that file exists.

## Prerequisites

```bash
cd kitchensink/tools/website-ux-auditor   # or path to the tool directory
npm install
npx playwright install chromium
```

The script requires Node 18+.

## Output location

All commands write to:

```text
.cursor/plans/forge-ux-remediation/
```

Use `--install-rule` to also write (under `--repo`):

```text
.cursor/rules/forge-ux-remediation-plan-runner.mdc
```

## Incremental remediation campaign (`UX_AUDIT_OUT_DIR`)

Keep one output folder across loops so **`audit-data.previous.json`**, **`crawl-session.json`**, **`ux-quality-score.previous.json`**, and YAML **`status:`** merges behave as intended.

The KS **`run-website-ux-remediation-loop.sh`** runs **`score-website-ux.mjs`** then **`analyze-website-ux.mjs`** (auditor never invokes the scorer). Env: **`UX_AUDIT_SKIP_SCORER`**, **`UX_AUDIT_SCORER_MAX_PAGES`**, **`UX_AUDIT_SCORER_NO_CSV`**, plus **`UX_AUDIT_OUT_DIR`**, **`UX_AUDIT_INCREMENTAL`**, …

```bash
export UX_AUDIT_OUT_DIR="$PWD/workbench/my-site-campaign"
# Optional: UX_AUDIT_INCREMENTAL=1  UX_AUDIT_FORCE_FULL=1  UX_AUDIT_VERBOSE=1  UX_AUDIT_SKIP_SCORER=1  UX_AUDIT_SCORER_MAX_PAGES=80

/path/to/forgesdlc-kitchensink/tools/website-ux-auditor/run-website-ux-remediation-loop.sh \
  "$PWD" ./website --site-kind fleet
```

Direct **`analyze-website-ux.mjs`** flags:

```bash
node kitchensink/tools/website-ux-auditor/analyze-website-ux.mjs \
  --repo . \
  --site http://localhost:3000 \
  --out ./workbench/my-campaign \
  --incremental \
  --incremental-regression-max-pages 40 \
  --verbose \
  …
```

## ForgeSDLC

```bash
node kitchensink/tools/website-ux-auditor/analyze-website-ux.mjs \
  --repo . \
  --start "npm run dev" \
  --site http://localhost:3000 \
  --standard kitchensink/docs/design/forge-enterprise-ai-website-standard.md \
  --site-kind forgesdlc \
  --max-pages 6 \
  --install-rule
```

## LCDL

```bash
node kitchensink/tools/website-ux-auditor/analyze-website-ux.mjs \
  --repo . \
  --start "npm run dev" \
  --site http://localhost:3000 \
  --standard kitchensink/docs/design/forge-enterprise-ai-website-standard.md \
  --site-kind lcdl \
  --max-pages 6 \
  --install-rule
```

## Fleet

```bash
node kitchensink/tools/website-ux-auditor/analyze-website-ux.mjs \
  --repo . \
  --start "npm run dev" \
  --site http://localhost:3000 \
  --standard kitchensink/docs/design/forge-enterprise-ai-website-standard.md \
  --site-kind fleet \
  --max-pages 6 \
  --install-rule
```

## Lenses

```bash
node kitchensink/tools/website-ux-auditor/analyze-website-ux.mjs \
  --repo . \
  --start "npm run dev" \
  --site http://localhost:3000 \
  --standard kitchensink/docs/design/forge-enterprise-ai-website-standard.md \
  --site-kind lenses \
  --max-pages 6 \
  --install-rule
```

## Platform (Forge Platform handbook — static `website/`)

**forge-platform-website** is a Python generator that writes **`website/`**. Build before auditing, then serve that directory (not `npm run dev`).

Vendor the Forge Enterprise AI Website Standard at **`docs/design/forge-enterprise-ai-website-standard.md`** when possible so you can omit **`--standard`** (the auditor auto-loads that path).

The embedded **`kitchensink/`** submodule in **forge-platform-website** often omits **`tools/website-ux-auditor/`**. When that folder is absent, invoke the analyzer from your standalone **`forgesdlc-kitchensink`** checkout (absolute paths are fine):

```bash
python3 generator/build-site.py

node /ABS/PATH/forgesdlc-kitchensink/tools/website-ux-auditor/analyze-website-ux.mjs \
  --repo . \
  --start "sh -c 'cd website && python3 -m http.server 8899'" \
  --site http://127.0.0.1:8899/ \
  --site-kind platform \
  --max-pages 6 \
  --install-rule
```

When **`kitchensink/tools/website-ux-auditor/`** exists, use **`node kitchensink/tools/website-ux-auditor/analyze-website-ux.mjs`** and pass **`--standard kitchensink/docs/design/forge-enterprise-ai-website-standard.md`** if you have not vendored **`docs/design/forge-enterprise-ai-website-standard.md`**.

If **`website/`** is already being served elsewhere, drop **`--start`** and pass only **`--site`** pointing at that origin (same port/path convention).

## When the site is already running

Replace `--start "npm run dev"` with only the `--site` URL:

```bash
node kitchensink/tools/website-ux-auditor/analyze-website-ux.mjs \
  --repo . \
  --site http://localhost:3000 \
  --standard kitchensink/docs/design/forge-enterprise-ai-website-standard.md \
  --site-kind lenses \
  --max-pages 6 \
  --install-rule
```

## Repo-only fallback

Use when the site cannot be started yet (CI or early clone). Replace `lenses` with the right site kind.

```bash
node kitchensink/tools/website-ux-auditor/analyze-website-ux.mjs \
  --repo . \
  --standard kitchensink/docs/design/forge-enterprise-ai-website-standard.md \
  --site-kind lenses \
  --static-only \
  --install-rule
```

## Cursor execution prompt

After generating plans, paste this into Cursor Agent:

```text
Read .cursor/plans/forge-ux-remediation/00-master-remediation-sequence.md and execute the child plans in numeric order. Use Plan Mode first. After each child plan, summarize files changed, UX impact, validation performed, and unresolved risks. Stop before making unsupported product claims.
```

For safer execution, ask Cursor to run one numbered plan at a time.
