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

**Direct `analyze-website-ux.mjs` / `score-website-ux.mjs`** (default `--out` when omitted):

```text
.cursor/plans/forge-ux-remediation/
```

**Remediation loop** (`run-website-ux-remediation-loop.sh`) writes the campaign under the workspace hub unless **`UX_AUDIT_OUT_DIR`** is set:

```text
<workspace-hub>/workbench/ux-auditor/ux-audit/<website_slug>/<UTC>_<random>/
```

Plans and mirrors still land under **`--repo`**:

```text
.cursor/plans/forge-ux-remediation/
```

Use **`--install-rule`** on the auditor to also write (under **`--repo`**):

```text
.cursor/rules/forge-ux-remediation-plan-runner.mdc
```

## Incremental remediation campaign (`UX_AUDIT_OUT_DIR`)

Keep one output folder across loops so **`audit-data.previous.json`**, **`crawl-session.json`**, **`ux-quality-score.previous.json`**, and YAML **`status:`** merges behave as intended.

The KS **`run-website-ux-remediation-loop.sh`** runs **`score-website-ux.mjs`** then **`analyze-website-ux.mjs`** by default (auditor never invokes the scorer). Env: **`UX_AUDIT_SCORER_MAX_PAGES`** (default **500**), **`UX_AUDIT_SCORER_MAX_LINK_DEPTH`** (unset = no depth cap), **`MAX_PAGES`** (default **500**), **`UX_AUDIT_BREADTH_CRAWL`** (default **0**; **`FORGE_UX_LOOP_ALL_BARS=1`** with **`--watch`** forces breadth), **`UX_AUDIT_SCORER_NO_CSV`**, **`UX_AUDIT_OUT_DIR`**, **`UX_AUDIT_INCREMENTAL`**, **`UX_AUDIT_FORCE_FULL`**, …

**Scorer:** runs every iteration by default. Skip only with **`--no-scorer`** (or **`--ai`**, which implies **`--no-scorer`**).

**AI audit (optional):**

| Flags | Scorer | AI pass |
|-------|--------|---------|
| *(default)* | yes | no |
| **`--ai`** | no | yes (forced) |
| **`--enable-ai-audit`** | yes | yes when eligible |
| **`--force-ai-audit`** | yes | yes (forced) |

Example: `./run-website-ux-remediation-loop.sh "$PWD" ./website --watch`  
Landing + AI only: `./run-website-ux-remediation-loop.sh "$PWD" ./website --ai --max-pages 1 --watch`

Do **not** use **`UX_AUDIT_SKIP_SCORER=1`** — use **`--no-scorer`** or **`--ai`**.

Auto **`--incremental`** on the auditor when **`audit-data.json`** already exists in **`OUT_DIR`** (unless **`UX_AUDIT_FORCE_FULL=1`**). Iteration 2+ may skip the scorer when **`ux-quality-score.json`** is present (incremental re-audit).

```bash
export UX_AUDIT_OUT_DIR="$PWD/workbench/my-site-campaign"
# Optional overrides: UX_AUDIT_INCREMENTAL=1  UX_AUDIT_FORCE_FULL=1  UX_AUDIT_VERBOSE=1  UX_AUDIT_SKIP_SCORER=1  UX_AUDIT_SCORER_MAX_PAGES=80  UX_AUDIT_BREADTH_CRAWL=0  FORGE_UX_ENABLE_AI_AUDIT=0

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
