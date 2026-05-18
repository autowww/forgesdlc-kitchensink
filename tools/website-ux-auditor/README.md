---
id: forge.website-ux-auditor
kind: ks-tool
status: published
owner: Forge UX
updated: 2026-05-17
---

# Forge Website UX Auditor

This KS utility inspects a website repo and a running website against the shared Forge enterprise AI website standard, then writes ordered Cursor-ready remediation plans under `.cursor/plans/forge-ux-remediation/`.

It is deterministic. It does not call an LLM or make edits. It produces a report and plan files that Cursor Agent or Cursor Plan Mode can execute after human review.

**Repeatable remediation loop:** see **[UX-AUDIT-REMEDIATION-CYCLE.md](UX-AUDIT-REMEDIATION-CYCLE.md)** — every verification pass expects **`--site`** (Playwright/Chromium); **`--static-only`** is out of scope for loop sign-off. Command examples remain in **[FORGE_SITE_COMMANDS.md](FORGE_SITE_COMMANDS.md)**.

## What it checks

The script combines two inputs:

1. **Repository inventory**
   - Framework hints.
   - Likely page files.
   - Likely layout/navigation/component files.
   - Likely style/token files.

2. **Running website inspection through Playwright**
   - H1 and heading hierarchy signals.
   - Above-the-fold text density.
   - CTA visibility.
   - Navigation/link-wall density.
   - **Homepage shell** signals on `/` when live metrics are present: sidebar/offcanvas link density, handbook chrome phrases ahead of `<main>`, duplicated nav labels.
   - Technical/code/table exposure above the fold.
   - Page length and paragraph length.
   - Trust/governance language presence.
   - Forge ecosystem fit language.
   - Common accessibility signals such as missing `lang`, missing image alt text, and likely low contrast.
   - Desktop and mobile screenshots.

## Severity model (`audit-data.json` schema v2)

Structured findings use an ordered ladder: **Blocker → Critical → Major → Minor → Trivial → Cosmetic**. Each finding also includes **`legacySeverity`** mapped to **`high` / `medium` / `low`** for tooling that predates schema v2.

## Two CLIs: auditor vs. quality scorer

| Tool | Entry | Crawl semantics | Typical output |
|------|--------|-----------------|----------------|
| **Auditor** (remediation / RCA) | `analyze-website-ux.mjs` / `npm run audit` | Default **Major+ early stop** (`--stop-after-major-plus`, default **10**) so crawl effort aligns with remediation; **`--breadth-crawl`** (alias **`--stop-disable`**) disables that governor and scans up to **`--max-pages`** | `audit-report.md` lists **every** finding on visited pages (priority rows are worst-first samples); `audit-data.json`, `.cursor/plans/…` |
| **Scorer** (sitewide scorecard) | `score-website-ux.mjs` / `npm run score` | **Always** **`stopDisabled`** — full crawl within **`--max-pages`** (default **120**); no Major+ early stop | **`ux-quality-score.json`**, **`ux-quality-score.md`** under **`--out`** |

For portfolio-level scores over many pages, use **`npm run score`** (authoritative sitewide run). The auditor embeds **`uxScores`** into **`audit-data.json`** when it runs, but early-stopped audits are **partial** coverage: prefer the scorer when you need scores after a full URL budget.

Optional **tracking on the auditor** (live runs):

- **`--scores-first`** — before the remediation crawl, run one **full sitewide score crawl** (no Major+ early stop, screenshots off). Writes **`ux-quality-score-audit-precrawl.{json,md}`** beside your audit artifacts and merges the precrawl rollup into **`audit-report.md`** (vs the audit rollup).
- **`--scores-first-max-pages N`** — page budget for that precrawl (**default `120`**). Ignored with **`--static-only`**.
- **`--prior-ux-scores PATH`** — **`audit-data.json`** or **`ux-quality-score.json`** from an earlier run; **`audit-report.md`** and **`audit-data.json`** gain **`uxScoreDeltaVsPrior`** (overall + pillars) vs **`uxScores`** for **this run’s audit crawl rollup**. Prefer comparing runs with similar crawl modes when possible (`--breadth-crawl` vs default Major+ governor).
- **`ux-scoring.csv`** (repo root, **gitignored** on Forge site repos) — each **`npm run audit`** / **`npm run score`** run **appends** one CSV row with overall, crawl metadata, and **per-dimension score / raw damage / finding count** for spreadsheets or notebooks. Use **`--no-ux-csv`** to skip (e.g. CI against a read-only fixture).

## Early-stop crawl (live audits — auditor only)

By default the Playwright crawler **stops enqueueing further URLs once the cumulative backlog of blocker + critical + major findings reaches `--stop-after-major-plus`** (**10** by default). **`audit-report.md`** still carries **every** finding returned for pages that were analyzed (there is **no output cap tied to ten** beyond a readability “priority sample” heading). **`audit-data.json`** `crawlSummary.crawlMode` distinguishes **`major_plus_early_stop`** (threshold hit), **`major_plus_governed_complete`** (queue/budget exhausted first), or **`full_budget_within_max_pages`** (**`--breadth-crawl`** / **`--stop-disable`**). Plans include crawl outcome prose. Use **`--breadth-crawl`** (`--stop-disable`) on the **auditor** only when you need full breadth inside **`--max-pages`**. The **scorer** never applies Major+ stopping.

## Incremental campaigns (`--incremental`)

Reuse one **`--out`** directory across verification passes so **`forge-ux-remediation.plan.md`** YAML **`status:`** merges stay coherent (**`--refresh-plan-status`** remains default).

**Remediation loop shell (`run-website-ux-remediation-loop.sh`):** runs **`score-website-ux.mjs`** first (sitewide scorer under the same **`--out`**), then **`analyze-website-ux.mjs`**. The auditor **does not** spawn the scorer; it reads **`ux-quality-score-loop-delta.json`** when present and mirrors sitewide-vs-prior deltas into **`audit-report.md`** / **`audit-data.json`**. The scorer archives **`ux-quality-score.json` → `ux-quality-score.previous.json`**, prints **`[ux-scorer-loop]`** verbal deltas on stderr, and appends the same summary to **`ux-quality-score.md`**. Skip with **`UX_AUDIT_SKIP_SCORER=1`**; tune breadth via **`UX_AUDIT_SCORER_MAX_PAGES`**.
1. Each live run copies **`audit-data.json` → `audit-data.previous.json`** when **`audit-data.json`** already exists (baseline for the **next** invocation’s regression wave).
2. **`--incremental`** reads **`audit-data.previous.json`** and **`crawl-session.json`** when present:
   - **Regression wave:** revisit URLs that previously had Major+ findings (cap **`--incremental-regression-max-pages`**, default **40**); summaries land in **`audit-data.json`** **`regressionWave`** and **`audit-report.md`** (**Previously Major+ URLs re-checked**).
   - **Resume wave:** restore **`visitedUrls`** / **`queuedUrls`** after a **`major_plus_threshold`** halt so BFS continues instead of restarting only from **`/`**.
3. **`crawl-session.json`** is rewritten each live run: **`completed: false`** while the crawl halted early with queued URLs remaining; **`completed: true`** when the crawl completes normally within **`--max-pages`**.

Kitchen Sink **`tools/website-ux-auditor/run-website-ux-remediation-loop.sh`** accepts **`UX_AUDIT_OUT_DIR`** for a stable campaign folder and auto-adds **`--incremental`** when that folder already contains **`audit-data.json`**, unless **`UX_AUDIT_FORCE_FULL=1`**.

Diagnostics: **`--verbose`** / **`UX_AUDIT_VERBOSE`** emit **`[incremental]`**, **`[crawl]`**, **`[archive]`**, **`[session]`**, **`[plans]`** markers on stderr only (stdout stays pipe-safe).

## Design-standard UX scores (dimensions + logarithmic curve)

Runs compute **six pillar scores** (mapped from finding **`area`** to design-standard themes) plus an **overall 1–100**:

- Each pillar uses damage \(D\) = sum of **`SCORE_WEIGHTS[severity]`** for findings in that pillar, then **round clamp(1, 99, 100 − `k`·ln(1 + D))** with **`k` = 15** (`DESIGN_UX_LOG_K`).
- **Overall**: **harmonic mean** of the six pillar scores, clamped **1–99** when any **effective** finding remains (**`inventory`** and **`site-inspection`** areas are ancillary and omitted from pillar damage).
- **100** only when **`perfectScoreEligible`**: live/browser run (not static-only), crawl did **not** stop early for Major+, and **zero** effective findings.

Static-only audits and partial crawls are flagged in **`uxScores.coverage`**; capped scores reflect missing browser evidence or incomplete URL queues.

## Design standard versioning

Every run pins the standard file metadata (path, front-matter **`id`** / **`updated`**, **`sha256`**, byte length) into **`audit-data.json`**. When you change **`forge-enterprise-ai-website-standard.md`** materially, audit again and revisit check thresholds/heuristics; bump **`schemaVersion`** in the tooling if finding shape itself changes.

## Install

From the **tool directory** (or website repo that vendors this folder):

```bash
cd tools/website-ux-auditor
npm install
npx playwright install chromium
```

### Automated tests

From **`tools/website-ux-auditor/`**:

```bash
npm test
```

This uses Node’s built-in test runner (`node --test auditor-tests/*.test.js`). It exercises severity/scoring helpers, design UX dimension scoring, check aggregation, design-standard parsing, crawl URL rules, incremental baseline helpers, the RCA prompt writer, and one **static-only** end-to-end invocation of `analyze-website-ux.mjs` against `auditor-tests/fixtures/minimal-repo/` (no Playwright; no network).

After changing **`lib/crawl.js`**, **`lib/dom-metrics.js`**, **`checks/`**, shared CLI libs, or either entry script, run **`npm test`** before committing.

The script requires Node 18+. Playwright is required only for browser inspection; tests do not launch Chromium.

## Placement in Kitchen Sink

In **forgesdlc-kitchensink** the layout is:

```text
tools/website-ux-auditor/analyze-website-ux.mjs
tools/website-ux-auditor/score-website-ux.mjs
tools/website-ux-auditor/package.json
tools/website-ux-auditor/README.md
docs/design/forge-enterprise-ai-website-standard.md
```

**Default standard path:** If you omit `--standard` and `docs/design/forge-enterprise-ai-website-standard.md` exists under `--repo`, the auditor uses it automatically.

## From a consumer repo (kitchensink submodule)

Use paths under the submodule:

```bash
node kitchensink/tools/website-ux-auditor/analyze-website-ux.mjs \
  --repo . \
  --static-only \
  --standard kitchensink/docs/design/forge-enterprise-ai-website-standard.md \
  --site-kind platform \
  --install-rule
```

## Usage with an already-running site

Run from the **website repo root**; adjust the path to `analyze-website-ux.mjs` if the tool lives in KS only (use absolute path or `kitchensink/tools/...`).

```bash
node tools/website-ux-auditor/analyze-website-ux.mjs \
  --repo . \
  --site http://localhost:3000 \
  --standard docs/design/forge-enterprise-ai-website-standard.md \
  --site-kind lenses \
  --out .cursor/plans/forge-ux-remediation \
  --install-rule
```

## Usage without a running site

This mode is useful early in a repo or in CI where a browser cannot be launched. It still inventories likely pages/components and creates the same Cursor plan tree, but the report will mark visual/browser findings as unverified.

```bash
node tools/website-ux-auditor/analyze-website-ux.mjs \
  --repo . \
  --static-only \
  --standard docs/design/forge-enterprise-ai-website-standard.md \
  --site-kind fleet \
  --out .cursor/plans/forge-ux-remediation
```

## UX quality score (sitewide)

From **`tools/website-ux-auditor/`**, **`npm run score`** runs **`score-website-ux.mjs`**. Flags mirror much of the auditor (`--repo`, `--site`, `--start`, **`--standard`**, **`--max-pages`** default **120**, **`--no-screenshots`** default speed mode, **`--out`** default `.cursor/reports/forge-ux-quality`). Example against a running site:

```bash
npm run score -- \
  --repo . \
  --site http://localhost:3000 \
  --standard docs/design/forge-enterprise-ai-website-standard.md \
  --site-kind lenses
```

There is **no** **`--stop-after-major-plus`** on the scorer — it always consumes the **`--max-pages`** budget (bounded same-origin crawl). See **Design-standard UX scores** for how **`ux-quality-score.{json,md}`** interpret pillar and overall grades.

## Usage when the script should start the site

```bash
node tools/website-ux-auditor/analyze-website-ux.mjs \
  --repo . \
  --start "npm run dev" \
  --site http://localhost:3000 \
  --standard docs/design/forge-enterprise-ai-website-standard.md \
  --site-kind lcdl \
  --max-pages 6 \
  --install-rule
```

**Forge Platform handbook** (`forge-platform-website`) generates static HTML into **`website/`** with `python3 generator/build-site.py`. Serve that folder, then audit:

```bash
python3 generator/build-site.py

node kitchensink/tools/website-ux-auditor/analyze-website-ux.mjs \
  --repo . \
  --start "sh -c 'cd website && python3 -m http.server 8899'" \
  --site http://127.0.0.1:8899/ \
  --standard kitchensink/docs/design/forge-enterprise-ai-website-standard.md \
  --site-kind platform \
  --max-pages 6 \
  --install-rule
```

## Site kinds

Use one of:

```text
forgesdlc | lcdl | fleet | lenses | platform | generic | auto
```

The site kind controls the one-liner, recommended storyline, and plan prompts. Use `auto` only when the repo name or URL makes the product obvious.

## Output

**`forge-ux-remediation.plan.md`** — Cursor-native plan (YAML todos + **Build**). It lives in the same output folder as `00`–`08`.

Default output folder:

```text
.cursor/plans/forge-ux-remediation/
```

A **dated mirror** of the Build plan is also written next to it (unless `--no-mirror-root-plan`):

```text
.cursor/plans/forge-ux-remediation__<UTC-stamp>__<audit_run_id>.plan.md
```

Each run uses a new **audit_run_id** (16 hex chars) and a millisecond-resolution UTC stamp so filenames stay unique even with several runs the same day. Legacy mirrors named `YYYY-MM-DD_forge-ux-remediation.plan.md` may still exist in older checkouts.

Generated files:

```text
audit-report.md
audit-data.json
rca-prompts/*.md
forge-ux-remediation.plan.md
00-master-remediation-sequence.md
01-site-inventory-and-content-map.md
02-homepage-shell-and-product-landing-mode.md
03-homepage-storyline-and-hero.md
04-information-architecture-and-navigation.md
05-page-depth-and-technical-content-pruning.md
06-trust-model-and-ecosystem-fit.md
07-visual-system-and-spacious-enterprise-polish.md
08-accessibility-responsive-link-and-build-qa.md
09-screenshot-and-homepage-shell-review.md
screenshots/*.png
```

**Run identity:** `audit-report.md`, `forge-ux-remediation.plan.md`, `00`–`09`, and `audit-data.json` from the **same** invocation share **`audit_run_id`** and **`generated_at`** (ISO UTC). The CLI prints `Audit run id:` and `Generated at (UTC):` after each run.

With `--install-rule`, it also writes (under **`--repo`**):

```text
.cursor/rules/forge-ux-remediation-plan-runner.mdc
```

## Cursor workflow

### Why the IDE “Build” button may not run script plans

In Cursor, **Build** on a plan is wired to **Plan Mode sessions**: the agent and IDE coordinate through internal APIs (see **cursor/create_plan** in the [ACP docs](https://cursor.com/docs/cli/acp)). A file your script writes to disk is valid Markdown, but it was **never registered in that session**, so the button often does nothing. That cannot be fully fixed from a repository alone—it needs product support (e.g. “open/import this `.plan.md` as an active plan”).

### What we do instead

1. **Dated mirror at `.cursor/plans/`** — On each audit, the same `forge-ux-remediation.plan.md` content is also written to  
   `.cursor/plans/YYYY-MM-DD_forge-ux-remediation.plan.md`  
   so it sits beside Cursor’s usual “Save to workspace” layout. It still may not fix **Build**, but it improves discoverability. Use **`--no-mirror-root-plan`** to skip.

2. **Cursor CLI (`agent`) — one-shot “build”** — From the website repo, after installing the [Cursor CLI](https://cursor.com/docs/cli/overview):

   ```bash
   ./kitchensink/tools/website-ux-auditor/cursor-agent-run-ux-plan.sh .
   ```

   Or from this tool directory:

   ```bash
   ./cursor-agent-run-ux-plan.sh /path/to/forge-platform-website
   ```

   This runs **`agent -p`** with a prompt that points at the plan file’s **absolute path** (the reliable automation path for generated plans).

3. **Per-finding RCA (optional)** — For up to ten priority findings, the auditor writes **`rca-prompts/<id>.md`**. Invoke Cursor CLI on one prompt:

   ```bash
   ./kitchensink/tools/website-ux-auditor/cursor-agent-run-finding-rca.sh . .cursor/plans/forge-ux-remediation/rca-prompts/<file>.md
   ```

   The analyzer does **not** call **`agent`** by default (explicit operator step).

4. **In the IDE** — Open **Agent** (not Ask), **\@**‑attach `forge-ux-remediation.plan.md` or the repo-level orchestrator, and ask to run todos **ux-00** … **ux-09**.

### Controlled mode (manual)

1. Open `00-master-remediation-sequence.md`.
2. Ask Cursor Plan Mode to execute child plans **01–09** in numeric order (**02** shell/layout before **03** storyline when audits showed shell/visual/storyline gates).
3. Review each plan, implement, test, and commit before continuing.
4. Prefer one child plan at a time for large public-site changes.

This is the safest workflow for public website changes.

### One-shot mode (in-IDE prompt)

Ask Cursor Agent:

```text
Read .cursor/plans/forge-ux-remediation/00-master-remediation-sequence.md and execute the child plans in numeric order. After each child plan, summarize files changed, UX impact, validation performed, and unresolved risks. Stop before making unsupported product claims.
```

This can work for smaller repos, but it is less safe for broad IA and visual changes.

See also [`docs/tools/forge-website-ux-auditor-cursor.md`](../../docs/tools/forge-website-ux-auditor-cursor.md) in this repo.

## Why plans rather than direct edits?

The auditor can reliably detect structural UX signals, but it cannot know every product truth or codebase convention. The generated plans make the remediation repeatable while still forcing Cursor and the human reviewer to inspect the repo before editing.

## Recommended governance

### Kitchen Sink change gate

Before merging generic layout/CSS/component fixes in **forgesdlc-kitchensink**:

1. From the KS repo root, run **`pytest forge-autodoc/tests -q`** as a baseline.
2. Apply KS changes (and **`python3 generator/build-showcase.py`** if showcase-related paths changed).
3. Re-run **`pytest forge-autodoc/tests -q`**.
4. Only then propagate the **`kitchensink` submodule** in consumer repos.

- Commit the audit report and plans only if they are useful for review history.
- Do not commit screenshots if the repo should stay small.
- Re-run the auditor after remediation and compare `audit-report.md` before/after. **Keep default plan status refresh** (omit `--no-refresh-plan-status`) so YAML todo `status:` values you set in `forge-ux-remediation.plan.md` survive the next generation.
- Treat heuristic findings as prompts for review, not absolute truth.

## Useful flags

- `--site URL` or `--url URL`: inspect a running site with Playwright.
- `--start "npm run dev"`: start the website before inspection.
- `--ready-url URL`: probe a different readiness URL before crawling.
- `--static-only` or `--no-browser`: generate repo-only plans without Playwright.
- `--max-pages N`: crawl up to N same-origin pages.
- `--install-rule`: write `.cursor/rules/forge-ux-remediation-plan-runner.mdc` into **`--repo`** (re-run after tool updates if the rule text changed).
- `--no-mirror-root-plan`: do not write `.cursor/plans/YYYY-MM-DD_forge-ux-remediation.plan.md`.
- **`--no-refresh-plan-status`**: write every YAML todo as `pending`. **Default is to merge** non-`pending` statuses from the existing `forge-ux-remediation.plan.md` in `--out` before overwriting.
- **`--stop-after-major-plus N`**: stop expanding the crawl queue after **N** blocker/critical/major findings accumulate **across analyzed pages** (default **10**; ignored with **`--breadth-crawl`** / **`--stop-disable`** or **`--static-only`**).
- **`--breadth-crawl`**, **`--stop-disable`**: crawl within **`--max-pages`** **without** the Major+ queue governor (full breadth crawl).

## Limitations

- Static-only mode cannot verify rendered layout, spacing, screenshots, mobile behavior, or visual hierarchy.
- It does not perform full accessibility auditing. Use dedicated tools for production-grade accessibility verification.
- It does not validate product claims.
- It does not understand screenshots semantically; it captures them for human/Cursor review.
- It cannot guarantee Cursor will execute all plans automatically. The master plan is structured for ordered execution, but Cursor behavior should remain human-reviewed.
