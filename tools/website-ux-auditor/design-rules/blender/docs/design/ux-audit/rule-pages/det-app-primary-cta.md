---
rule_id: DET.APP.PRIMARY_CTA
lane: deterministic
title: App primary CTA
summary: Each studio workspace exposes at most one visible primary action—mark it with data-studio-primary-cta or a single btn-primary; demote competing actions to outline styles.
page_version: 8a3d48bb18ed60117a9fbc1044fa7df7f8cbcbf09e1360c0d7b3e19cec1545bf
generated_at: 2026-05-28T19:15:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primary-cta
related_rules:
  - DET.APP.PRIMARY_STATE
  - DET.APP.DEMO_DISCLOSURE
  - DET.CTA.HIERARCHY
  - DET.CTA.LABEL.NONEMPTY
  - DET.BUTTON.GROUP.MAX
  - AI.APP.WORKFLOW.CONTINUITY
---

## Purpose

Operator and studio app surfaces (`[data-studio-workspace]`, `.studio-page`) need a **single dominant next action** per active workspace—start run, save draft, confirm step—not two filled primaries at equal weight. When both **Start run** and **Export report** use `btn-primary`, scanners and users cannot tell which action the screen wants.

`DET.APP.PRIMARY_CTA` counts **visible** primary actions inside each workspace root (`MAX_PRIMARY_CTAS = 1`). A control is primary when it has **`[data-studio-primary-cta]`** or is a visible, enabled `<button>` / `<a>` with class **`btn-primary`**. Outline and secondary KS styles (`btn-forge-outline`, `btn-cyan-outline`, `btn-outline-primary`, `btn-secondary`) are **not** counted unless they also carry `data-studio-primary-cta`.

This rule complements **`DET.CTA.HIERARCHY`**, which caps filled primaries in **marketing** heroes, modals, and sticky footer bands (`btn-forge` and `btn-primary`). App workspaces are scoped separately so studio toolbars can use `btn-forge` with an explicit `data-studio-primary-cta` marker without conflicting with public-site hero scans.

**Plan:** Inventory each `[data-studio-workspace]` / `.studio-page` action row for duplicate filled primaries. **Do:** Mark exactly one control with `data-studio-primary-cta` (or keep a single `btn-primary`); demote siblings to outline buttons or text links. **Check:** `metrics.primaryCtaReport` reports `violations: []`. **Adjust:** When product adds a second “primary” for a tour or demo panel, demote it or split into another workspace—do not stack two filled primaries in the same root.

## Passing signals

- Each visible `[data-studio-workspace]` or `.studio-page:not([hidden])` contains **at most one** visible primary among `[data-studio-primary-cta]`, `.btn-primary`, `button.btn-primary`, and `a.btn-primary`.
- The dominant action is explicitly marked with **`data-studio-primary-cta`** when the workspace uses `btn-forge` or mixed Bootstrap classes—readers and the auditor share the same contract.
- Secondary paths use **`btn-forge-outline`**, **`btn-cyan-outline`**, **`btn-outline-primary`**, or muted text links—not a second filled `btn-primary`.
- Disabled or `aria-disabled="true"` primaries are excluded from the count.
- Hidden workspaces (`hidden`, `aria-hidden="true"`, `display:none`, zero-size boxes) are skipped.
- **`metrics.primaryCtaReport`** returns `maxAllowed: 1`, `violations: []`.

## Failing signals

- Two or more visible **`btn-primary`** buttons or links in the same workspace (auditor evidence: `workspace="…" primary_ctas=2`).
- Multiple elements with **`data-studio-primary-cta`** in one workspace.
- A filled **`btn-primary`** plus a separate **`data-studio-primary-cta`** control both visible—counts as two primaries.
- Finding message: *A workspace exposes more than one primary action; keep a single dominant CTA in the primary column.* Severity **major**; **critical** when `primaryCount > 2`.
- Page may pass **`DET.BUTTON.GROUP.MAX`** (≤3 actions in a row) yet still fail here because **primary styling**, not total button count, is the gate.
- Marketing-only duplicate primaries in `.landing-hero` are **`DET.CTA.HIERARCHY`** failures, not this rule—unless the same markup lives inside `[data-studio-workspace]`.

## Before example

Failing KS markup: `studio-page` workspace with two sibling **`btn-primary`** actions at equal weight—matches the ruleset harness defect fixture.

```html
<main
  id="main"
  class="studio-page doc-main px-4 py-4"
  data-studio-workspace="runs"
>
  <section class="forge-card p-3 mb-3">
    <p class="card-label text-cyan mb-1">Run control</p>
    <h1 class="h4 font-display mb-2">Workspace runs</h1>
    <p class="forge-support mb-3">Start a governed job or export the latest report.</p>
    <div class="d-flex flex-wrap gap-2">
      <button type="button" class="btn btn-primary">Start run</button>
      <button type="button" class="btn btn-primary">Export report</button>
    </div>
  </section>
</main>
```

## After example

Passing KS markup: one explicit primary (`data-studio-primary-cta` on the dominant `btn-forge`); export demoted to **`btn-forge-outline`**—only one primary counted inside the workspace.

```html
<main
  id="main"
  class="studio-page doc-main px-4 py-4"
  data-studio-workspace="runs"
>
  <section class="forge-card p-3 mb-3">
    <p class="card-label text-cyan mb-1">Run control</p>
    <h1 class="h4 font-display mb-2">Workspace runs</h1>
    <p class="forge-support mb-3">Start a governed job or export the latest report.</p>
    <div class="d-flex flex-wrap gap-2">
      <button
        type="button"
        class="btn btn-forge"
        data-studio-primary-cta
      >
        Start run
      </button>
      <button type="button" class="btn btn-forge-outline">Export report</button>
    </div>
  </section>
</main>
```

## Evidence and remediation

| Signal | Where to look | Remediation |
|--------|----------------|-------------|
| Duplicate primaries | `metrics.primaryCtaReport.violations[]` (`workspaceHint`, `primaryCount`) | Keep one `btn-primary` or one `data-studio-primary-cta`; demote extras to `btn-forge-outline` / `btn-outline-primary`. |
| Unclear dominant action | DevTools: workspace root → count `.btn-primary` and `[data-studio-primary-cta]` | Add `data-studio-primary-cta` to the intended control; remove `btn-primary` from siblings. |
| Demo tour extra primary | `[data-demo]` panels inside same workspace | Pair with `DET.APP.DEMO_DISCLOSURE` labeling; do not add a second filled primary for sample flows. |
| Harness regression | `rule-defect-fixtures/.../det-app-primary-cta-fail.html` | Mirror the **After example**; re-run harness with `--only-rule DET.APP.PRIMARY_CTA`. |

**Commands (Kitchen Sink repo root):**

```bash
python3 generator/build_rule_defect_fixtures.py
tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.PRIMARY_CTA
node tools/website-ux-auditor/analyze-website-ux.mjs --help
```

Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-primary-cta.check.js` (`collectPrimaryCtaReport`, `MAX_PRIMARY_CTAS = 1`). After HTML changes to studio surfaces, run `python3 generator/build-showcase.py` when showcase pages include workspace chrome.

## Related rules

- `DET.APP.PRIMARY_STATE` — at most one visible `[data-studio-primary-state]` / `.studio-state--*` region per workspace; pair when status banners sit beside action toolbars.
- `DET.APP.DEMO_DISCLOSURE` — demo/mock panels need in-section labels; demo tours should not introduce a second competing primary action.
- `DET.CTA.HIERARCHY` — one filled primary per marketing hero, modal, or sticky footer band (`btn-forge` / `btn-primary`); different scope from app workspaces.
- `DET.CTA.LABEL.NONEMPTY` — every CTA exposes visible link or button text; naming does not replace primary count caps.
- `DET.BUTTON.GROUP.MAX` — horizontal action rows cap total buttons; this rule caps **primary** styling separately.
- `AI.APP.WORKFLOW.CONTINUITY` — subjective check that the dominant workspace action matches the user’s current task step.
