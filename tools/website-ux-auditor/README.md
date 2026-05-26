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

**Remediation loop shell (`run-website-ux-remediation-loop.sh`):** runs **`score-website-ux.mjs`** first (sitewide scorer under the same **`--out`**), then **`analyze-website-ux.mjs`**. The auditor **does not** spawn the scorer; it reads **`ux-quality-score-loop-delta.json`** when present and mirrors sitewide-vs-prior deltas into **`audit-report.md`** / **`audit-data.json`**. The scorer archives **`ux-quality-score.json` → `ux-quality-score.previous.json`**, prints **`[ux-scorer-loop]`** verbal deltas on stderr, and appends the same summary to **`ux-quality-score.md`**. Skip with **`UX_AUDIT_SKIP_SCORER=1`**; tune breadth via **`UX_AUDIT_SCORER_MAX_PAGES`** / **`UX_AUDIT_SCORER_MAX_LINK_DEPTH`**. Unless overridden, the loop defaults to **`UX_AUDIT_SCORER_MAX_PAGES=500`**, **`UX_AUDIT_SCORER_MAX_LINK_DEPTH`** unset (no depth cap on scorer), **`MAX_PAGES=500`**, **`UX_AUDIT_BREADTH_CRAWL=0`** (governed auditor crawl; set to **`1`** or enable **`FORGE_UX_LOOP_ALL_BARS`** with **`--watch`** for breadth), and **`FORGE_UX_ENABLE_AI_AUDIT=0`** (no post-audit AI unless you opt in).
1. Each live run copies **`audit-data.json` → `audit-data.previous.json`** when **`audit-data.json`** already exists (baseline for the **next** invocation’s regression wave).
2. **`--incremental`** reads **`audit-data.previous.json`** and **`crawl-session.json`** when present:
   - **Regression wave:** revisit URLs that previously had Major+ findings (cap **`--incremental-regression-max-pages`**, default **40**); summaries land in **`audit-data.json`** **`regressionWave`** and **`audit-report.md`** (**Previously Major+ URLs re-checked**).
   - **Resume wave:** restore **`visitedUrls`** / **`queuedUrls`** after a **`major_plus_threshold`** halt so BFS continues instead of restarting only from **`/`**.
3. **`crawl-session.json`** is rewritten each live run: **`completed: false`** while the crawl halted early with queued URLs remaining; **`completed: true`** when the crawl completes normally within **`--max-pages`**.

Kitchen Sink **`tools/website-ux-auditor/run-website-ux-remediation-loop.sh`** accepts **`UX_AUDIT_OUT_DIR`** for a stable campaign folder and auto-adds **`--incremental`** when **`OUT_DIR`** already contains **`audit-data.json`**, unless **`UX_AUDIT_FORCE_FULL=1`**. When **`UX_AUDIT_OUT_DIR`** is unset, each run uses **`FORGE_UX_AUDIT_WORKBENCH_ROOT/ux-audit/<repo-basename>/<UTC>_<random>/`** so artifacts stay **outside** the kitchensink clone: by default the script walks up from **`tools/website-ux-auditor/`** until it finds a directory named **`Code`**, then uses **`<that-hub>/workbench/ux-auditor/`** (override with **`FORGE_UX_AUDIT_WORKBENCH_ROOT`** if your hub folder is not named `Code`). The auditor is **quiet** by default (omit **`UX_AUDIT_VERBOSE`** or set **`UX_AUDIT_VERBOSE=0`**); set **`UX_AUDIT_VERBOSE=1`** or **`2`** for stderr breadcrumbs. The Cursor **`agent`** step defaults to **plain text** output; set **`FORGE_UX_CURSOR_AGENT_VERBOSE=1`** for **`stream-json`** (by default piped through **`agent-stream-summary.mjs`** so **`remediation-agent.log`** and the terminal get **one `[ux-agent] …` line per tool/system event**, not megabyte **`tool_call` result** payloads). Use **`FORGE_UX_AGENT_STREAM_SUMMARY=0`** for raw NDJSON, and **`FORGE_UX_AGENT_RAW_JSONL=/path/to/file.jsonl`** to retain a full raw transcript alongside the summary. Disable the transcript file with **`FORGE_UX_REMEDIATION_AGENT_LOG=`** before the loop, or override the path with **`FORGE_UX_REMEDIATION_AGENT_LOG`**.

**Post-clean AI audit (optional):** By default the remediation loop does **not** run AI. Opt in with **`--ai`** (auditor + forced AI, **no sitewide scorer**) or **`--force-ai-audit`** / **`FORGE_UX_ENABLE_AI_AUDIT=1`** (keeps scorer; runs when **`audit-ai-audit-eligibility.mjs`** reports **PASS** unless forced). Eligibility normally requires quality gate pass, crawl complete within budget, and every implemented DET rule satisfied on each page. **`--ai`** and **`--force-ai-audit`** bypass that check. AI reuses visited URLs, groups them into prompts (**`FORGE_UX_AI_AUDIT_BATCH_SIZE`**, default **1**), and writes **`<out>/ai-audit/`** artifacts. **`FORGE_UX_AI_AUDIT_CONCURRENCY`** (default **3**, max **3**) runs batch agents in parallel. AI output does **not** rewrite **`audit-data.json`**; skipped when **`SKIP_CURSOR_AGENT=1`**.

**Done crawl URLs (session budget):** after each audit pass, **`merge-done-crawl-urls-from-audit.mjs`** **rewrites** **`ux-audit-done-crawl-urls.txt`** to the URLs **visited in that audit** with **zero** Blocker/Critical/Major (same Major+ batch as early-stop). Entries from older runs that were **not** re-audited as clean in this pass are **removed**, so a narrow crawl (for example only `/`) does not leave a stale full-site exclude list. The next auditor invocation receives **`--exclude-crawl-urls-file`** (see **`analyze-website-ux.mjs`**) only when the file fingerprint matches the current design-rule registry (`design-rules/registry.generated.json`), so updated rule packs can re-audit previously clean URLs. The **`--site`** URL is never excluded. Disable merging with **`FORGE_UX_SKIP_DONE_CRAWL_MERGE=1`** on the remediation loop shell.

Diagnostics: **`--verbose`** / **`UX_AUDIT_VERBOSE`** emit **`[incremental]`**, **`[crawl]`**, **`[archive]`**, **`[session]`**, **`[plans]`** markers on stderr only (stdout stays pipe-safe). During live crawls, stderr crawl rows are followed by **`phase=page_done`** lines: **`mj_page`** = Major+ findings on that URL, **`mj_run`** = cumulative Major+ findings so far; when the governor is on (default cap **10**), **`halt_expand=1`** means link expansion stopped so **`audit-report.md`** / **`.cursor/plans/…`** can drive Cursor remediation before a breadth crawl. The remediation loop does **not** turn verbose on by default.

## Loop watch: TUI vs. external `watch(1)` (snapshot file)

**In-terminal dashboard:** **`--watch`** / **`FORGE_UX_LOOP_WATCH=1`** runs **`loop-watch-dashboard.mjs`** (alternate screen). See env knobs on **`run-website-ux-remediation-loop.sh`** (`FORGE_UX_LOOP_WATCH_REFRESH_MS`, incremental redraw options). The canvas shows **Audit** and **Remediation** phase bars (audit fills toward the issue cap that triggers remediation; remediation fills by plan todos done/total), **per-page slot bars** (up to **5** during deterministic crawl, **3** during AI audit — live `done/total` DET rules from `auditProgress.pageRuleProgress`), a **defrag-style ruleset map** (page index fragments across columns × **DET `area` rulesets** then **AI family** rulesets; all registry rules roll up into those rows; `~` = scoring in progress), plus **Process / Run / Now / Activity** summary rows. **Log · milestones** tails **`ux-loop-dashboard.log`**; **Log · recent crawl** shows **Last done** plus crawl log tail. Live state is mirrored in **`ux-loop-progress-map.json`** and **`ux-loop-dashboard-state.json`** (`auditProgress` counts during crawl). Legacy **`[ISO] `** prefixes and crawl **elapsed / ETA** columns are stripped for display (files on disk unchanged). **`run-meta.json`** records **`generatedAt`** for campaign wall-clock.

**Remediation loop quality gate (default):** sitewide counts on visited pages must be **≤** `blocker,critical,major,warn,minor,trivial,cosmetic` → **`0,0,0,5,10,15,100`**. Override with **`FORGE_UX_QUALITY_GATE`** or **`FORGE_UX_QUALITY_GATE_JSON`**. Sign-off check: **`node audit-quality-gate.mjs <out>/audit-data.json --check`**. Legacy Major+-only loop: **`--until-major-clean`** or **`FORGE_UX_QUALITY_GATE_LEGACY_MAJOR_ONLY=1`**.

**Watch progress bars (four rows):** With **`FORGE_UX_LOOP_WATCH=1`**, the dashboard shows **Runs** (dynamic expected iterations + `SARB` cycle lights), **Pages** (compressed crawl budget: dim=unvisited, green=clean, red=issues, yellow=load error), **Gate** (seven severity segments), and **Rules** (DET trace coverage per page). When **`FORGE_UX_LOOP_ALL_BARS=1`** (default with watch), the loop exits only after **all four** bars complete — use **`node audit-loop-completion.mjs <out>/audit-data.json --check-all-bars`**. Override expected runs with **`--target-iterations N`** / **`FORGE_UX_LOOP_TARGET_ITERATIONS`**. All-bars mode enables **`UX_AUDIT_BREADTH_CRAWL=1`** so the page budget can finish.

**Watch + stderr:** With loop watch on, informational shell lines append to **`ux-loop-dashboard.log`** as plain lines (no per-line ISO timestamps) instead of stderr so the alternate-screen buffer is not torn; crawl detail rows remain in the `*-crawl-progress.log` files. **AI audit** / **remediation agent** subprocesses may still print to stderr; **`loop-watch-dashboard.mjs`** uses incremental row updates with ANSI-aware clipping and line padding (default), **full-buffer redraw** on **`phase`** transitions, and a periodic full repaint during chatty child phases so row addressing does not drift after interleaved stderr lines.

**External `watch(1)` / second terminal:** run a small poller that **materializes the same frame as plain text** (atomic temp + rename), then point GNU **`watch`** at that file. This is mentally calmer for some operators; the tradeoff is **one extra Node process** and **up to one poll interval** of staleness vs. live JSON/log appends.

1. Use a **stable** output dir (e.g. **`UX_AUDIT_OUT_DIR`**) so the path stays fixed for the whole campaign.
2. **Terminal A — remediation** (example):

   ```bash
   export UX_AUDIT_OUT_DIR="$PWD/workbench/my-campaign"
   ./run-website-ux-remediation-loop.sh /path/to/repo ./website
   ```

3. **Terminal B — snapshot writer** (polls state + log tail, writes **`ux-loop-dashboard-snapshot.txt`**):

   ```bash
   cd tools/website-ux-auditor
   node write-ux-loop-dashboard-snapshot.mjs "$UX_AUDIT_OUT_DIR"
   ```

   Optional env: **`FORGE_UX_LOOP_WATCH_REFRESH_MS`** (default **500** in the writer), **`FORGE_UX_LOOP_WATCH_SNAPSHOT_COLS`** (default **120**), **`FORGE_UX_LOOP_WATCH_SNAPSHOT_SKIP_UNCHANGED=0`** to rewrite the snapshot file every tick even when the text is unchanged.

4. **Terminal C — `watch`**:

   ```bash
   watch -n 0.5 cat "$UX_AUDIT_OUT_DIR/ux-loop-dashboard-snapshot.txt"
   ```

   Or **`tail -f`** on the same path (note: `tail -f` shows grow-only; the snapshot is **rewritten whole**, so `watch cat` is the better match).

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

### DET ruleset harness (synthetic defect fixtures)

Validates that each implemented **DET** rule fires on a **defect-only** HTML page built from the rule handbook **Before example** (`generator/build_rule_defect_fixtures.py`). Fixture modes: **standalone** top-level Before HTML (no showcase shell), **repo_overlay** for repo-scoped rules (`DET.CONTRACT.*`), **multi_page** for route-crawl rules (`DET.APP.PERSISTENT_CHROME`). Uses **`run-website-ux-remediation-loop.sh`** per rule with **`--stop-disable`** so multi-page crawls are not truncated by unrelated DET findings; **agents are off by default** (`--enable-agents` to opt in).

Rules missing a Before example: **`./invoke-det-ruleset-pagegen-gaps.sh --from-manifest …/manifest.json`** (runs `npm run pagegen -- --only-rule` per gap).

```bash
cd tools/website-ux-auditor/auditor-tests
./invoke-det-ruleset-harness.sh --only-rule DET.HASH.MARKERS --rebuild-fixtures
./invoke-det-ruleset-harness.sh --resume          # full registry, detection-only
./invoke-det-ruleset-harness.sh --watch           # campaign watch board (TTY)
```

Legacy Learn 101 Fleet handbook campaigns: **`invoke-learn-101-remaining-rules.sh`** now delegates to the harness (deprecated).

Bootstrap verified with **`DET.HASH.MARKERS`** (`--only-rule`, detection-only). Artifacts under **`workbench/ux-auditor/`** (`rule-defect-fixtures/`, `ux-audit/ruleset-harness-*`). Linked index: **`auditor-tests/DET-RULESET-HARNESS-INDEX.md`**.

**Remediation verify** (After example → expect **0** `design-rule-runtime` findings for that rule):

```bash
./invoke-det-ruleset-remediation-verify.sh --rebuild-fixtures
./invoke-det-ruleset-remediation-verify.test.sh   # DET.HASH.MARKERS smoke
```

Uses **`apply-harness-fixture-remediation.py`**, **`expect-rule-clean.sh`**, minimal **`harness-minimal-assets/`**, and **`LOOP_REPO=fixture-website`** (overlay path for repo-scoped rules). Campaign dirs: **`ux-audit/ruleset-remediation-verify-*`**.

**Handbook upgrade** (29 bootstrap pages → pagegen):

```bash
./invoke-det-ruleset-handbook-upgrade.sh --batch-size 5
```

Closure checklist: **`auditor-tests/RULESET-HARNESS-CLOSURE.md`**.

### AI ruleset harness (synthetic defect fixtures + Cursor agent)

Validates that each registry **AI** rule reports ≥1 finding with matching **`principleId`** on a **Before-example** defect page. Builds fixtures with **`generator/build_rule_defect_fixtures.py --lane ai`**, serves each page locally, and runs **`design-rules/ai/run-design-ai-rule.sh`** per rule (requires **Cursor CLI `agent`** on PATH).

```bash
cd tools/website-ux-auditor/auditor-tests
./invoke-ai-ruleset-harness.sh --only-rule AI.CONTEXT.COGNITIVE_CLARITY --rebuild-fixtures
./invoke-ai-ruleset-harness.sh --resume          # full AI registry
./invoke-ai-ruleset-harness.sh --dry-run
```

Bootstrap rule: **`AI.CONTEXT.COGNITIVE_CLARITY`**. Campaign dirs: **`ux-audit/ai-ruleset-harness-*`**. Use **`--skip-agent`** to list rules without invoking the agent.

After changing **`lib/crawl.js`**, **`lib/dom-metrics.js`**, **`checks/`**, shared CLI libs, or either entry script, run **`npm test`** before committing.

The script requires Node 18+. Playwright is required only for browser inspection; tests do not launch Chromium.

### Design rules blender and PDCA generator

From **`tools/website-ux-auditor/`**:

```bash
npm run blend-rules
npm run rulegen -- --lane deterministic
```

- `blend-rules` regenerates `design-rules/registry.generated.json` and generated rule libraries.
- Generated rule files carry embedded `rules-version`; `blend-rules` skips rewriting files when version matches.
- Use `node design-rules/blender/design-rules-blender.mjs --override-version` to force regeneration on the same rule version.
- `rulegen` runs Cursor CLI `agent` in one-rule-per-run PDCA prompts.
- default `rulegen` lane is deterministic-only to avoid spending AI tokens on deterministic checks.
- Forge UX scripts pass `--model composer-2.5` by default (override with `FORGE_UX_CURSOR_AGENT_MODEL` or `--model` in `FORGE_UX_CURSOR_AGENT_EXTRA`). Bare `agent` CLI default is `composer-2.5-fast`.

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

**`forge-ux-remediation.plan.md`** — Cursor-native plan (YAML todos + **Build**). It lives in the same output folder as the master plan plus defect plans.

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
01-defect-<slug>.md
02-defect-<slug>.md
...
10-defect-<slug>.md
screenshots/*.png
```

By default the auditor writes up to **10 defect remediation plans** ordered by estimated UX score impact (homepage-cap defects first, then score delta/severity/coverage). Use `--remediation-plan-limit` to override.

**Run identity:** `audit-report.md`, `forge-ux-remediation.plan.md`, `00-master-remediation-sequence.md`, `NN-defect-*.md`, and `audit-data.json` from the **same** invocation share **`audit_run_id`** and **`generated_at`** (ISO UTC). The CLI prints `Audit run id:` and `Generated at (UTC):` after each run.

With `--install-rule`, it also writes (under **`--repo`**):

```text
.cursor/rules/forge-ux-remediation-plan-runner.mdc
```

## Cursor workflow

### Why the IDE “Build” button may not run script plans

In Cursor, **Build** on a plan is wired to **Plan Mode sessions**: the agent and IDE coordinate through internal APIs (see **cursor/create_plan** in the [ACP docs](https://cursor.com/docs/cli/acp)). A file your script writes to disk is valid Markdown, but it was **never registered in that session**, so the button often does nothing. That cannot be fully fixed from a repository alone—it needs product support (e.g. “open/import this `.plan.md` as an active plan”).

### What we do instead

1. **Root mirror at `.cursor/plans/`** — On each audit, the same `forge-ux-remediation.plan.md` content is also written to  
   `.cursor/plans/forge-ux-remediation__<UTC-stamp>__<audit_run_id>.plan.md`  
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

4. **In the IDE** — Open **Agent** (not Ask), **\@**‑attach `forge-ux-remediation.plan.md` or the repo-level orchestrator, and ask to run todos **ux-00** then remaining **ux-*** in numeric order.

### Controlled mode (manual)

1. Open `00-master-remediation-sequence.md`.
2. Ask Cursor Plan Mode to execute defect plans (`01-defect-*.md`, `02-defect-*.md`, …) in numeric order (already prioritized by scorer impact).
3. Review each plan, implement, test, and commit before continuing.
4. Prefer one child plan at a time for large public-site changes.

This is the safest workflow for public website changes.

### One-shot mode (in-IDE prompt)

Ask Cursor Agent:

```text
Read .cursor/plans/forge-ux-remediation/00-master-remediation-sequence.md and execute the defect plans in numeric order. After each plan, summarize files changed, UX impact, validation performed, scorer/audit deltas, and unresolved risks. Stop before making unsupported product claims.
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
