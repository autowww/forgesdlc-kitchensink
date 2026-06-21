---
rule_id: DET.APP.DEMO_DISCLOSURE
lane: deterministic
title: App demo disclosure
summary: Demo and mock regions must be visibly labeled in the same section so operators do not treat sample data as production truth.
page_version: cd55322e6e7b1301f87ed03ae901e3a2eee57b13092552c26d2d03b5c7e52e46
generated_at: 2026-05-28T18:12:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-demo-disclosure
related_rules:
  - AI.TRUST.BOUNDARY_CLARITY
  - AI.CREDIBILITY.NO_OVERCLAIM
  - DET.APP.PRIMARY_STATE
  - DET.APP.PRIMARY_CTA
---

## Purpose

Studio and operator app surfaces sometimes render **synthetic, illustrative, or fixture-backed data** for layout review, onboarding tours, or empty-state previews. When that content uses the same cards, tables, and KPI tiles as live data, readers can mistake it for production truth—undermining trust boundaries and remediation decisions.

`DET.APP.DEMO_DISCLOSURE` requires every visible `[data-demo]`, `[data-mock]`, or `[data-mock-source="demo"]` container to include **visible** labeling in the **same section** whose text matches `demo`, `sample`, `mock`, or `illustrative` (case-insensitive). The check runs in the UX auditor metrics phase (`trustAndEcosystemTruth`, default severity **major**).

**Plan:** Mark every non-production data island at authoring time (`data-demo` / `data-mock`) and pair it with a badge or lead sentence. **Do:** Place the label inside the container (first child or adjacent badge), not only in page `<title>`. **Check:** `collectDemoDisclosureReport` returns zero violations on the built page. **Adjust:** If multiple demo panels share one workspace, label each panel—do not rely on a single page-level kicker outside the marked container.

## Passing signals

- Each visible `[data-demo]` or `[data-mock]` root contains **visible** text matching `/\b(demo|sample|mock|illustrative)\b/i` in `innerText` (normalized whitespace).
- A **badge or chip** inside the container carries the label—e.g. `.badge.studio-demo-label`, `.chip`, or `[data-demo-label]`—and is not `display:none` or zero-size (width/height greater than 8px).
- `[data-mock-source="demo"]` containers follow the same rule when the attribute marks illustrative content.
- Labels sit **in the same card/section** as the synthetic metrics or table—readers see the disclaimer before scanning numbers.
- Production workspaces omit `data-demo` / `data-mock` unless the region is genuinely illustrative; live data does not need a Demo badge.
- `metrics.demoDisclosureReport` is empty after `analyze-website-ux.mjs` on the target URL or defect fixture pass build.

## Failing signals

- Visible `[data-demo]` or `[data-mock]` section with plausible KPI/table copy but **no** Demo/Sample/Mock/illustrative token in container text or child badges.
- Label text exists only in **page chrome** (header, sidebar, `<title>`) while the marked container body reads like real operational data.
- Badge present but **hidden** (`display:none`, `hidden`, or sub-8px box)—`hasDemoLabel` skips non-visible badges.
- `data-mock-source` set to `demo` on a container without in-section labeling.
- Auditor finding: `Demo or mock data is shown without a visible Sample/Demo label in the same section.` Evidence includes `container="#id"` or tag hint and URL when crawled.
- Severity **major**; area `trustAndEcosystemTruth`; up to six findings surfaced per page (collector caps at ten violations).

## Before example

Failing KS markup: `data-demo` run summary card reads like production metrics; no Demo/Sample/Mock token inside the section.

```html
<main
  id="main"
  class="doc-main px-4 py-4"
  data-studio-workspace="demo"
>
  <section data-demo class="forge-card p-3 mb-3">
    <p class="card-label text-cyan mb-1">Run summary</p>
    <h2 class="h5 font-display mb-2">Fleet health</h2>
    <p class="forge-support mb-2">Synthetic metrics for layout review only.</p>
    <dl class="row mb-0 small">
      <dt class="col-6 text-muted">Jobs completed</dt>
      <dd class="col-6 mb-0">128</dd>
      <dt class="col-6 text-muted">Queue depth</dt>
      <dd class="col-6 mb-0">0</dd>
    </dl>
  </section>
</main>
```

## After example

Passing KS markup: same `data-demo` container with a visible badge whose text includes **Demo** (also satisfies `studio-demo-label` selector in the check).

```html
<main
  id="main"
  class="doc-main px-4 py-4"
  data-studio-workspace="demo"
>
  <section data-demo class="forge-card p-3 mb-3">
    <span class="badge bg-secondary studio-demo-label mb-2">Demo data</span>
    <p class="card-label text-cyan mb-1">Run summary</p>
    <h2 class="h5 font-display mb-2">Fleet health</h2>
    <p class="forge-support mb-2">Sample metrics for layout review—not live job history.</p>
    <dl class="row mb-0 small">
      <dt class="col-6 text-muted">Jobs completed</dt>
      <dd class="col-6 mb-0">128</dd>
      <dt class="col-6 text-muted">Queue depth</dt>
      <dd class="col-6 mb-0">0</dd>
    </dl>
  </section>
</main>
```

## Evidence and remediation

| Signal | Where to look | Remediation |
|--------|----------------|-------------|
| Missing in-section label | UX audit finding; `metrics.demoDisclosureReport.violations[]` | Add `Demo`, `Sample`, or `Mock` in visible badge/prose inside the `[data-demo]` root, or remove `data-demo` when data is real. |
| Hidden badge | Playwright `collectDemoDisclosureReport` on built HTML | Show the badge (remove `hidden`, ensure size greater than 8px); prefer `.studio-demo-label` or `[data-demo-label]`. |
| Mock source only | `[data-mock-source="demo"]` without copy | Add the same visible label pattern inside that element. |
| Harness regression | `rule-defect-fixtures/.../det-app-demo-disclosure-fail.html` | Mirror the **After example**; re-run harness with `--only-rule DET.APP.DEMO_DISCLOSURE`. |

**Commands (Kitchen Sink repo root):**

```bash
python3 generator/build_rule_defect_fixtures.py
tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.DEMO_DISCLOSURE
node tools/website-ux-auditor/analyze-website-ux.mjs --help
```

Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-demo-disclosure.check.js` (`DEMO_LABEL_RE`, `collectDemoDisclosureReport`). After HTML changes, run `python3 generator/build-showcase.py` when showcase surfaces include demo panels.

## Related rules

- `AI.TRUST.BOUNDARY_CLARITY` — plain-language data, execution, and human-control boundaries; demo labeling supports the data-truth boundary.
- `AI.CREDIBILITY.NO_OVERCLAIM` — synthetic metrics must not read as verified production proof even when labeled.
- `DET.APP.PRIMARY_STATE` — one visible workspace state region per active studio page (pair when demo panels include status chrome).
- `DET.APP.PRIMARY_CTA` — at most one primary CTA per `[data-studio-workspace]`; demo tours should not add a second competing primary action.
