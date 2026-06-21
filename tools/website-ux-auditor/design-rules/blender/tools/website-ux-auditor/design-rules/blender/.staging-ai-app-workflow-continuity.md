---
rule_id: AI.APP.WORKFLOW_CONTINUITY
lane: ai
title: App workflow continuity
summary: Panels, tabs, and routes must preserve sense of place—stable chrome, orientation cues, and predictable back/forward context.
page_version: 74c7753bf5918efbabb1f895f86bb18af4748aeecb66082cbf65e184d2867c67
generated_at: 2026-05-28T17:50:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-app-workflow-continuity
related_rules:
  - DET.APP.PERSISTENT_CHROME
  - DET.NAV.BREADCRUMB
  - DET.CHROME.BOUNDARY
  - DET.NAV.DEDUP
  - DET.LANDMARKS.REQUIRED
  - AI.APP.DENSITY_BALANCE
---

## Purpose

Kitchen Sink **desktop interfaces** (`data-ks-type="desktop-interface"`, museum studio shell **`Msm`**, `body.museum-studio.forge-app-shell`) let operators move across panels, tabs, Lens segments, and routes without leaving the product. This AI rule judges whether those moves preserve **sense of place**: stable chrome, visible mode state, and headings or breadcrumbs that answer "where am I in the workflow?"

Deterministic checks (`DET.APP.PERSISTENT_CHROME`, `DET.NAV.BREADCRUMB`, `DET.CHROME.BOUNDARY`, `DET.LANDMARKS.REQUIRED`) catch promised shell stability, breadcrumb presence, region separation, and landmarks; this rule covers judgment they miss: chrome that morphs on every tab, generic "Workspace" titles on every route, competing nav rails with conflicting active markers, or panel swaps that feel like a different application.

**Plan:** Crawl or screenshot each major route/panel; note chrome, title, breadcrumb, and active nav on entry and after navigation. **Do:** Keep `header` / `nav` mounted with `data-shell-region`; surface route context in `main` with breadcrumbs, `ks-workspace-lens__segment--active`, or `ks-wizard-flow__session-item` with `aria-current`. **Check:** Back/forward and tab changes never orphan the user—active item, heading, and breadcrumb trail align. **Adjust:** If the same disorientation repeats (for example missing active tab state), propose a deterministic `DET.*` candidate.

## Passing signals

- Persistent shell regions (`data-shell-regions`, `data-shell-region`, `data-route-contract="persistent-shell"`) stay stable across routes when persistence is promised (`DET.APP.PERSISTENT_CHROME`).
- Orientation cues in `main`: route-specific `h1`, Forge breadcrumb trail, or `ks-workspace-lens__segment--active` showing the current Lens mode.
- Tab or Lens mode switches update active state only in the control band; header product label (`nav-section-label`) and side session rail do not reset.
- `ks-wizard-flow__session-list` highlights the active session with `aria-current="true"` on the current `ks-wizard-flow__session-item`.
- Chrome boundaries keep `nav` and aside distinct from workspace content (`DET.CHROME.BOUNDARY`).
- Deep links and browser back return to the same labeled context (breadcrumb leaf, session label, and active segment agree).

## Failing signals

- Entire `header` or side `nav` replaced when switching tabs, settings sections, or Lens segments.
- Every route shows the same generic `h1`/`h2` ("Workspace", "Console") with no breadcrumb or active nav marker.
- Competing nav rails (`header` global links plus duplicate link rows in `main`) point to different "current" places.
- Panel swap clears session context—session list resets with no `aria-current` on any item.
- Modal or offcanvas route hides orientation cues with no return label or `aria-current` on the triggering control.
- Forward navigation lands on content with no heading tie-back to the prior wizard step or Lens segment.

## Before example

Failing KS markup: tab band rebuilds product chrome; generic workspace title; no breadcrumb, Lens active segment, or session marker.

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
    <div class="d-flex gap-1 mt-2" role="tablist" aria-label="Modes">
      <button type="button" class="btn btn-sm btn-primary" role="tab" aria-selected="true">Jobs</button>
      <button type="button" class="btn btn-sm btn-outline-secondary" role="tab">Logs</button>
      <button type="button" class="btn btn-sm btn-outline-secondary" role="tab">Settings</button>
    </div>
  </header>
  <main class="p-3">
    <h2 class="h3 mb-3">Workspace</h2>
    <p class="forge-support mb-0">Content for the selected tab appears here with no trail, Lens segment, or active session marker.</p>
  </main>
</div>
```

## After example

Passing KS markup: stable chrome, breadcrumb, route title, Lens active segment, and wizard session rail (`data-route-contract`).

```html
<div
  id="root"
  hash="Msm"
  data-ks-hash="Msm"
  data-ks-type="desktop-interface"
  data-ks-name="museum-studio"
  data-persistent-chrome="true"
  data-shell-regions="header,nav,main"
  data-route-contract="persistent-shell"
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
            <span class="ks-workspace-lens__segment-desc">Follow work from idea to release</span>
          </button>
          <button type="button" class="ks-workspace-lens__segment">
            <span class="ks-workspace-lens__segment-title">Artifacts</span>
            <span class="ks-workspace-lens__segment-desc">Browse plans, projects, docs, and sites directly</span>
          </button>
        </div>
      </div>
    </details>
  </header>
  <div class="d-flex min-vh-100">
    <nav data-shell-region="nav" class="border-end p-3" style="min-width:14rem" aria-label="Sessions">
      <p class="nav-section-label">Sessions</p>
      <ul class="ks-wizard-flow__session-list list-unstyled mb-0">
        <li>
          <button type="button" class="ks-wizard-flow__session-item w-100 text-start" aria-current="true">
            Docs health — May 28
          </button>
        </li>
        <li>
          <button type="button" class="ks-wizard-flow__session-item w-100 text-start">
            Blueprint wizard — draft
          </button>
        </li>
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

**Capture:** screenshots for at least two routes or tab states in the same shell; record URL, visible breadcrumb, active Lens segment (`ks-workspace-lens__segment--active`), session `aria-current`, and whether `header`/`nav` DOM structure changed. Note browser back behavior and whether `data-route-contract` promises persistence.

**Remediate (in order):**

1. Stabilize chrome: keep `header` and side `nav` mounted; swap only `main` on route or tab change; set `data-persistent-chrome="true"` when contracts require it.
2. Add or fix orientation: Forge breadcrumb, route-specific `h1`, `aria-current` on active Lens segment or `ks-wizard-flow__session-item`.
3. Align competing nav rails—dedupe repeated destinations (`DET.NAV.DEDUP` candidate if labels diverge).
4. Re-check `DET.APP.PERSISTENT_CHROME`, `DET.NAV.BREADCRUMB`, and `DET.LANDMARKS.REQUIRED` where registry contracts apply.
5. If tab or panel disorientation repeats with stable DOM signals, propose a deterministic companion (for example required active tab marker when `[role="tablist"]` is present).

## Related rules

- `DET.APP.PERSISTENT_CHROME` — shell regions stable across routes when persistence is promised.
- `DET.NAV.BREADCRUMB` — product or doc hubs include breadcrumb where the registry marks a breadcrumb contract.
- `DET.CHROME.BOUNDARY` — chrome visually separated from content per contract.
- `DET.NAV.DEDUP` — duplicate nav destinations with conflicting labels break orientation.
- `DET.LANDMARKS.REQUIRED` — `header` / `nav` / `main` / `footer` landmarks for app shells.
- `AI.APP.DENSITY_BALANCE` — dense consoles can pass continuity but still feel chaotic.
