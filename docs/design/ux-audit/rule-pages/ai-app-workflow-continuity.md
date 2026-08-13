---
rule_id: AI.APP.WORKFLOW_CONTINUITY
lane: ai
title: App workflow continuity
summary: Panels, tabs, and routes must preserve sense of place—stable chrome, orientation cues, and predictable back/forward context.
page_version: 37680431d16e42e1bb215d977e5fdc1147adbd2285fe097e43c8fb7fa2755adf
generated_at: 2026-05-19T20:15:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-app-workflow-continuity
---

## Purpose

Kitchen Sink **desktop interfaces** (`data-ks-type="desktop-interface"`, museum studio shell **`Msm`**, Lenses-style operator UIs) let users move across panels, tabs, and routes while staying inside one product. This AI rule judges whether those moves preserve **sense of place**: stable chrome, visible mode/tab state, and headings or breadcrumbs that answer “where am I in the workflow?”

Deterministic checks (`DET.APP.PERSISTENT_CHROME`, `DET.NAV.BREADCRUMB`, `DET.CHROME.BOUNDARY`) catch promised shell stability and breadcrumb presence; this rule covers judgment they miss: chrome that morphs on every tab, generic “Workspace” titles for every route, duplicate nav rails that disagree about location, or panel swaps that feel like a different application.

**Plan:** Crawl or screenshot each major route/panel; note chrome, title, breadcrumb, and active nav on entry and after navigation. **Do:** Keep `header` / `nav` stable; surface route context in `main` with breadcrumbs, Lens segments, or session labels. **Check:** Back/forward and tab changes never orphan the user—active item, heading, and breadcrumb trail align. **Adjust:** If the same disorientation repeats (e.g. missing active tab state), propose a deterministic `DET.*` candidate.

## Passing signals

- Persistent shell regions (`data-shell-regions`, `data-shell-region`) stay stable across routes when persistence is promised (`DET.APP.PERSISTENT_CHROME`).
- Orientation cues in main: page-specific h1 or h2, Forge breadcrumb trail, or `ks-workspace-lens__segment--active` showing the current mode.
- Tab or Lens mode switches update active state only in the control band; header product name and side session rail do not reset.
- `ks-wizard-flow__session-list` highlights the active session.
- Chrome boundaries keep nav and aside distinct from workspace content (`DET.CHROME.BOUNDARY`).
- Deep links and browser back return to the same labeled context.

## Failing signals

- Entire header or side nav replaced when switching tabs or Lens segments.
- Every route shows the same generic title with no breadcrumb or active nav marker.
- Competing nav rails point to different current places.
- Panel swap clears session context.
- Modal or offcanvas route hides orientation cues with no aria-current or return label.
- Forward navigation lands on content with no heading tie-back to the prior step.

## Before example

Failing KS markup: tab switch rebuilds chrome; no breadcrumb, active state, or route-specific heading.

```html
<div
  id="root"
  hash="Msm"
  data-ks-hash="Msm"
  data-ks-type="desktop-interface"
  data-ks-name="museum-studio"
>
  <header class="px-3 py-2 border-bottom">
    <h1 class="h4 mb-0">Console</h1>
    <div class="d-flex gap-1 mt-2">
      <button type="button" class="btn btn-sm btn-primary">Jobs</button>
      <button type="button" class="btn btn-sm btn-outline-secondary">Logs</button>
      <button type="button" class="btn btn-sm btn-outline-secondary">Settings</button>
    </div>
  </header>
  <main class="p-3">
    <h2 class="h3 mb-3">Workspace</h2>
    <p class="forge-support mb-0">Content for the selected tab appears here with no trail or active marker.</p>
  </main>
</div>
```

## After example

Passing KS markup: stable chrome, breadcrumb, route title, Lens active segment, and session rail.

```html
<div
  id="root"
  hash="Msm"
  data-ks-hash="Msm"
  data-ks-type="desktop-interface"
  data-ks-name="museum-studio"
  data-persistent-chrome="true"
  data-shell-regions="header,nav,main"
>
  <header data-shell-region="header" class="d-flex align-items-center gap-3 px-3 py-2 border-bottom">
    <p class="nav-section-label mb-0">Lenses Studio</p>
    <details class="ks-workspace-lens">
      <summary class="ks-workspace-lens__trigger" aria-label="Workspace navigation mode">
        <span class="ks-workspace-lens__eyebrow" style="display:inline;margin-right:0.35rem">Workspace Lens</span>
        <span class="ks-workspace-lens__trigger-label">Flow</span>
      </summary>
      <div class="ks-workspace-lens__panel">
        <div class="ks-workspace-lens__segments" role="group" aria-label="Lens mode">
          <button type="button" class="ks-workspace-lens__segment ks-workspace-lens__segment--active" aria-current="true">
            <span class="ks-workspace-lens__segment-title">Flow</span>
          </button>
          <button type="button" class="ks-workspace-lens__segment">
            <span class="ks-workspace-lens__segment-title">Artifacts</span>
          </button>
        </div>
      </div>
    </details>
  </header>
  <div class="d-flex min-vh-100">
    <nav data-shell-region="nav" class="border-end p-3" style="min-width:14rem">
      <p class="nav-section-label">Sessions</p>
      <ul class="ks-wizard-flow__session-list list-unstyled mb-0">
        <li><button type="button" class="ks-wizard-flow__session-item w-100 text-start" aria-current="true">Docs health — May 19</button></li>
      </ul>
    </nav>
    <main data-shell-region="main" class="flex-grow-1 p-3">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-1" style="font-size:0.75rem">
          <li class="breadcrumb-item"><a href="/studio" class="text-cyan" style="text-decoration:none">Studio</a></li>
          <li class="breadcrumb-item"><a href="/flow" class="text-cyan" style="text-decoration:none">Flow</a></li>
          <li class="breadcrumb-item active text-dim" aria-current="page">Docs health job</li>
        </ol>
      </nav>
      <h1 class="h4 mb-3">Docs health job</h1>
      <div class="forge-card p-3">
        <p class="card-label mb-1">Step 3 of 5</p>
        <p class="forge-support mb-0">Review argv and queue placement before run.</p>
      </div>
    </main>
  </div>
</div>
```

## Evidence and remediation

**Capture:** screenshots for at least two routes or tab states in the same shell; record URL, visible breadcrumb, active nav/tab markers, and whether `header`/`nav` DOM structure changed. Note browser back behavior.

**Remediate (in order):**

1. Stabilize chrome: keep header and side nav DOM stable; swap only main content on route or tab change.
2. Add or fix orientation: Forge breadcrumb, route-specific h1, aria-current on active Lens segment or session item.
3. Align competing nav rails (`DET.NAV.DEDUP` candidate if labels diverge).
4. Re-check `DET.APP.PERSISTENT_CHROME` and `DET.NAV.BREADCRUMB` where contracts require them.
5. If tab or panel disorientation repeats, propose a deterministic companion.

## Related rules

- `DET.APP.PERSISTENT_CHROME` — shell regions stable across routes when persistence is promised.
- `DET.NAV.BREADCRUMB` — product or doc hubs include breadcrumb where the registry marks a breadcrumb contract.
- `DET.CHROME.BOUNDARY` — chrome visually separated from content per contract.
- `DET.NAV.DEDUP` — duplicate nav destinations with conflicting labels break orientation.
- `AI.APP.DENSITY_BALANCE` — dense consoles can pass continuity but still feel chaotic.
