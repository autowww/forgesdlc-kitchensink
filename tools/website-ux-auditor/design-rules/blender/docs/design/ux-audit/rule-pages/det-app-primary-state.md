---
rule_id: DET.APP.PRIMARY_STATE
lane: deterministic
title: App primary state
summary: Each studio workspace shows at most one visible primary state among empty, ready, running, completed, or error—mark the active panel with data-studio-primary-state and hide siblings.
page_version: 7f62082ab82c1c2ce9ab7f016fcb2e54839413386514bb23d04c6112a1021d75
generated_at: 2026-05-28T20:42:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primary-state
related_rules:
  - DET.APP.PRIMARY_CTA
  - DET.APP.SHELL_INTEGRATION
  - DET.APP.CONTROL_A11Y
  - DET.APP.DEMO_DISCLOSURE
  - AI.APP.WORKFLOW.CONTINUITY
---

## Purpose

Operator and studio app surfaces (`[data-studio-workspace]`, `.studio-page`) must communicate **one lifecycle moment at a time**—empty queue, ready to start, running, completed, or error—not two status panels visible together. When **Running…** and **Completed** both render at full size, scanners report `visible_states=2` and users cannot tell which outcome the workspace reflects.

`DET.APP.PRIMARY_STATE` counts **visible** state regions inside each workspace root. A region counts when it matches **`[data-studio-primary-state]`** or carries a class containing **`studio-state--`** (for example `studio-state--running`, `studio-state--completed`, `studio-state--error`). The auditor walks each visible workspace (`[data-studio-workspace]`, `.studio-page:not([hidden])`, `.studio-page[aria-hidden="false"]`) and requires **at most one** visible state child.

Pair this rule with **`DET.APP.PRIMARY_CTA`** when a toolbar sits under the status stack: one dominant action, one dominant state. Use governed **`forge-status-banner`** primitives (`ks-fe-status-banner`, `ks-fe-banner--*`) for messaging, but still expose only **one** `studio-state--*` / `data-studio-primary-state` panel per workspace unless siblings are hidden from layout and assistive APIs.

**Plan:** Inventory each workspace for stacked `.studio-state--*` panels. **Do:** Mark the active panel with `data-studio-primary-state`; hide others with `hidden`, `aria-hidden="true"`, or `display:none` until the transition. **Check:** `metrics.primaryStateReport` returns `violations: []`. **Adjust:** When retaining off-screen DOM for animations, keep inactive panels non-visible (zero-size boxes still fail if width/height exceed 4px).

## Passing signals

- Each visible `[data-studio-workspace]` or `.studio-page` contains **at most one** visible element among `[data-studio-primary-state]` and `[class*="studio-state--"]`.
- The active lifecycle panel carries **`data-studio-primary-state`** so authors and the auditor agree on the canonical state.
- Inactive states use **`hidden`**, **`aria-hidden="true"`**, **`inert`**, or CSS that removes them from layout (`display:none`, `visibility:hidden`, or sub-4px boxes).
- State class names follow the contract vocabulary: **`studio-state--empty`**, **`studio-state--ready`**, **`studio-state--running`**, **`studio-state--completed`**, **`studio-state--error`** (suffix after `studio-state--` is otherwise free-form).
- Hidden or off-route workspaces are skipped (`hidden`, `aria-hidden="true"`, zero-size roots).
- **`metrics.primaryStateReport`** returns `violations: []`.

## Failing signals

- Two or more visible **`.studio-state--*`** siblings in the same workspace (auditor evidence: `workspace="…" visible_states=2`).
- Multiple elements with **`data-studio-primary-state`** both visible.
- A **running** panel left visible while a **completed** or **error** panel is also shown—common after async jobs finish without toggling visibility.
- Finding message: *More than one primary state is visible in a workspace; show only one of empty, ready, running, completed, or error.* Severity **major**.
- Collapsed panels that remain **visible** to the scanner (for example `opacity:0` but still >4×4px) still count as failures.
- Marketing status strips outside `[data-studio-workspace]` are out of scope unless nested inside a `.studio-page` root.

## Before example

Failing KS markup: `studio-page` hub workspace with **running** and **completed** state panels both visible—matches the ruleset harness defect fixture (`det-app-primary-state-fail.html`).

```html
<main
  id="main"
  class="studio-page doc-main px-4 py-4"
  data-studio-workspace="hub"
>
  <section class="forge-card p-3 mb-3">
    <p class="card-label text-cyan mb-1">Job hub</p>
    <h1 class="h4 font-display mb-2">Governed run</h1>
    <div class="studio-state--running" data-studio-primary-state>
      <p class="forge-support mb-0">Running… step 3 of 5</p>
    </div>
    <div class="studio-state--completed">
      <p class="forge-support mb-0">Completed — report ready</p>
    </div>
  </section>
</main>
```

## After example

Passing KS markup: only the **running** state stays visible; **completed** is retained in the DOM for hydration but hidden until the workspace transitions.

```html
<main
  id="main"
  class="studio-page doc-main px-4 py-4"
  data-studio-workspace="hub"
>
  <section class="forge-card p-3 mb-3">
    <p class="card-label text-cyan mb-1">Job hub</p>
    <h1 class="h4 font-display mb-2">Governed run</h1>
    <div class="studio-state--running" data-studio-primary-state>
      <p class="forge-support mb-0">Running… step 3 of 5</p>
    </div>
    <div class="studio-state--completed" hidden aria-hidden="true">
      <p class="forge-support mb-0">Completed — report ready</p>
    </div>
  </section>
</main>
```

## Evidence and remediation

| Signal | Where to look | Remediation |
|--------|----------------|-------------|
| Duplicate visible states | `metrics.primaryStateReport.violations[]` (`workspaceHint`, `visibleCount`) | Hide all but one `.studio-state--*` panel; move `data-studio-primary-state` to the active panel. |
| Stale running banner | DevTools: workspace root → filter `[class*="studio-state--"]` | On job completion, `hidden` the running panel before revealing `studio-state--completed` or `studio-state--error`. |
| Status primitive + state stack | `forge-status-banner` beside `.studio-state--*` | Keep one primary state region; fold copy into the banner or hide the redundant `studio-state--*` sibling. |
| Harness regression | `rule-defect-fixtures/.../det-app-primary-state-fail.html` | Mirror the **After example**; re-run harness with `--only-rule DET.APP.PRIMARY_STATE`. |

**Commands (Kitchen Sink repo root):**

```bash
python3 generator/build_rule_defect_fixtures.py
tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.PRIMARY_STATE
node tools/website-ux-auditor/analyze-website-ux.mjs --help
```

Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-primary-state.check.js` (`collectPrimaryStateReport`). After HTML changes to studio surfaces, run `python3 generator/build-showcase.py` when showcase pages include workspace chrome.

## Related rules

- `DET.APP.PRIMARY_CTA` — at most one visible primary action per workspace; pair when status and action toolbars share a card.
- `DET.APP.SHELL_INTEGRATION` — avoid duplicate Bootstrap `alert` / `badge` metaphors beside governed `forge-status-banner` roots.
- `DET.APP.CONTROL_A11Y` — status banners and controls need correct `role` / `aria-*` when the primary state panel updates.
- `DET.APP.DEMO_DISCLOSURE` — demo/mock workspaces still obey one visible state; label sample flows separately.
- `AI.APP.WORKFLOW.CONTINUITY` — subjective check that the visible state matches the user's current task step.
