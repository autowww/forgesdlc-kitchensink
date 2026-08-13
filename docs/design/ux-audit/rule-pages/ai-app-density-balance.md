---
rule_id: AI.APP.DENSITY_BALANCE
lane: ai
title: App density balance
summary: Operator and console surfaces may be information-dense, but grouping, labels, and affordances must keep scans calm—not chaotic.
page_version: d235fe4bf58f85445e606bcbbf8ba0b335b9208aeac14c9aa6bb5f880fcffecd
generated_at: 2026-05-19T18:22:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-app-density-balance
---

## Purpose

Kitchen Sink **desktop interfaces** (`data-ks-type="desktop-interface"`, museum studio shell **`Msm`**, Lenses-style operator UIs) may show more controls per screen than marketing pages. This AI rule judges whether that density still feels **governed**: grouped regions, labeled chrome, and obvious next actions—not a flat wall of equal-weight widgets.

Deterministic checks (`DET.APP.PERSISTENT_CHROME`, `DET.LANDMARKS.REQUIRED`) catch stable shell landmarks and hashes; this rule covers judgment they miss: mystery icon toolbars, duplicate nav rails, diagnostic dumps without headings, and workspace panes where every block shouts at the same volume.

**Plan:** On shell screenshots, trace header → side nav → workspace. Note where labels, grouping, or hierarchy break down. **Do:** Regroup into `forge-card` / `ks-wizard-flow__panel`, promote mode switching into `ks-workspace-lens__segments`, and label persistent regions. **Check:** An operator can answer “where am I?”, “what failed?”, and “what do I click next?” in one pass. **Adjust:** If unlabeled control grids or panel stacks repeat, propose a deterministic `DET.*` threshold.

## Passing signals

- Persistent chrome (`header`, `nav`, `aside`) stays stable; route-specific density lives in **`main`** (`DET.APP.PERSISTENT_CHROME`).
- Regions use visible labels: `nav-section-label`, `card-label`, `ks-workspace-lens__eyebrow`, or `ks-wizard-flow__muted`—not anonymous icon-only toolbars.
- Related controls cluster in `forge-card` or `ks-wizard-flow__panel` blocks with **one job per card** (status, sessions, setup, diagnostics).
- Workspace Lens (`ks-workspace-lens__segments`) and wizard session lists (`ks-wizard-flow__session-list`) separate modes instead of repeating the same destinations in three places.
- Monospace or diagnostic output sits in bounded, scrollable panels with a takeaway heading; primary actions use `btn btn-primary` (or `btn-sm` when secondary) on labeled surfaces.
- Overflow uses scroll containers; panels do not overlap unreadably at documented minimum widths (`Msm` contract).

## Failing signals

- Flat grids of identical `btn btn-sm` controls with no text labels, `aria-label`, or grouping—reads as “mystery icons.”
- Three or more competing focal bands at the same visual weight (hero-sized titles inside a console, duplicate nav rails, floating unlabeled stacks).
- Diagnostics, tables, and forms interleaved in one column with no `forge-card` or panel boundaries.
- Support copy shrunk with ad-hoc `opacity-50` or inline `font-size` hacks instead of promoting content to a labeled region.
- Session lists, breadcrumbs, and global nav repeat the same destinations with different labels.
- Dense data without takeaway headings—operators cannot tell which block answers “what failed?” vs “what do I do next?”

## Before example

Failing KS markup: `Msm` shell with unlabeled icon wall, raw dumps, and no regional grouping.

```html
<div
  id="root"
  hash="Msm"
  data-ks-hash="Msm"
  data-ks-type="desktop-interface"
  data-ks-name="museum-studio"
  data-persistent-chrome="true"
>
  <header>
    <h1 class="h4 mb-0">Studio</h1>
    <div class="d-flex gap-1 flex-wrap">
      <button type="button" class="btn btn-sm btn-outline-secondary" aria-hidden="true">R</button>
      <button type="button" class="btn btn-sm btn-outline-secondary" aria-hidden="true">S</button>
      <button type="button" class="btn btn-sm btn-outline-secondary" aria-hidden="true">T</button>
      <button type="button" class="btn btn-sm btn-outline-secondary" aria-hidden="true">M</button>
      <button type="button" class="btn btn-sm btn-primary">Run</button>
    </div>
  </header>
  <main class="p-2" style="font-size:0.7rem">
    <h2 class="h3">Workspace</h2>
    <pre class="mb-1" style="opacity:0.55">job=forge-lenses-docs-health status=RUNNING queue=3 worker=node-7</pre>
    <pre class="mb-1" style="opacity:0.55">last_event=2026-05-19T18:01:02Z detail=container argv drift</pre>
    <ul class="list-unstyled mb-2">
      <li><a href="/flow">Flow</a> · <a href="/artifacts">Artifacts</a> · <a href="/flow/plan">Plan</a> · <a href="/artifacts/docs">Docs</a></li>
    </ul>
    <input class="form-control form-control-sm mb-2" placeholder="Filter everything…" />
    <div class="d-flex gap-1 flex-wrap mb-2">
      <button type="button" class="btn btn-sm btn-outline-secondary">All</button>
      <button type="button" class="btn btn-sm btn-outline-secondary">Jobs</button>
      <button type="button" class="btn btn-sm btn-outline-secondary">Logs</button>
      <button type="button" class="btn btn-sm btn-outline-secondary">Config</button>
    </div>
    <p class="forge-support opacity-50 mb-0">Select an item.</p>
  </main>
</div>
```

## After example

Passing KS markup: labeled chrome, Lens mode control, wizard session rail, and card-grouped workspace panes.

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
          <button type="button" class="ks-workspace-lens__segment ks-workspace-lens__segment--active">
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
    <button type="button" class="btn btn-sm btn-primary ms-auto">Run health check</button>
  </header>
  <div class="d-flex min-vh-100">
    <nav data-shell-region="nav" class="border-end p-3" style="min-width:14rem">
      <p class="nav-section-label">Sessions</p>
      <ul class="ks-wizard-flow__session-list list-unstyled mb-0">
        <li><button type="button" class="ks-wizard-flow__session-item w-100 text-start">Docs health — May 19</button></li>
        <li><button type="button" class="ks-wizard-flow__session-item w-100 text-start">Blueprint wizard — draft</button></li>
      </ul>
    </nav>
    <main data-shell-region="main" class="flex-grow-1 p-3">
      <div class="row g-3">
        <div class="col-lg-7">
          <div class="forge-card p-3">
            <p class="card-label mb-1">Active job</p>
            <h2 class="h5 mb-2">forge-lenses-docs-health</h2>
            <p class="forge-support mb-2">Container argv job · queue 3 · worker node-7</p>
            <button type="button" class="btn btn-sm btn-outline-secondary">Open logs</button>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="ks-wizard-flow__panel p-3">
            <h3 class="h6 mb-2">Diagnostics</h3>
            <p class="ks-wizard-flow__muted mb-2">Last event 2026-05-19T18:01:02Z — argv drift detected</p>
            <pre class="small mb-0" style="max-height:8rem;overflow:auto">detail=container argv drift</pre>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
```

## Evidence and remediation

**Capture:** full-shell screenshot at desktop width and at the `Msm` minimum width; crop header, side nav, and primary workspace card. On route change, confirm chrome stays stable while only `main` swaps.

**Remediate (in order):**

1. Label every persistent region (`nav-section-label`, `card-label`, Lens eyebrows); add `aria-label` to icon-only controls or replace with text buttons.
2. Group related blocks into `forge-card` or `ks-wizard-flow__panel`; one primary action per card.
3. Move mode switching into `ks-workspace-lens__segments`; dedupe repeated nav links (`DET.NAV.DEDUP` candidate if stable).
4. Bound diagnostics in scrollable panels with a takeaway heading—not raw `<pre>` stacks in the main column.
5. Re-check `DET.APP.PERSISTENT_CHROME` and `DET.LANDMARKS.REQUIRED`; if icon grids or panel stacks repeat, propose a deterministic threshold (e.g. max unlabeled controls per toolbar).

## Related rules

- `DET.APP.PERSISTENT_CHROME` — shell regions stable across routes when persistence is promised.
- `DET.APP.FOCUS_TRAP` — overlays and modals keep keyboard focus until dismissed.
- `DET.LANDMARKS.REQUIRED` — `header` / `nav` / `main` / `footer` landmarks for app shells.
- `AI.APP.WORKFLOW_CONTINUITY` — panels, tabs, and routes preserve sense of place.
- `AI.CONTEXT.BURDEN_SUBJECTIVE` — subjective overload even when numeric burden checks pass.
