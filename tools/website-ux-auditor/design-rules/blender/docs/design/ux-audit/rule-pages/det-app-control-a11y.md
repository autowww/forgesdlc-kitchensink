---
rule_id: DET.APP.CONTROL_A11Y
lane: deterministic
title: React primitive control accessibility
summary: Governed react-primitive roots expose accessible names, expand/collapse state, listbox/toolbar labels, live-region roles, and widget roles on keyboard-focusable controls.
page_version: 92c34366a639ff1907da7f8e2f1722cfbd0fec9683b31a9fe9122b4ece1455a1
generated_at: 2026-05-28T18:12:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-control_a11y
related_rules:
  - DET.APP.PRIMITIVE_MARKERS
  - DET.APP.PRIMITIVE_SOURCE
  - DET.APP.FOCUS_TRAP
  - DET.NAV.FOCUS_ORDER
  - DET.APP.TAB_PANEL
  - AI.APP.PRIMITIVE_CONSISTENCY
---

## Purpose

Kitchen Sink **React primitives** (`data-ks-react-root="true"`, `data-ks-type="react-primitive"`, child hashes from `ksReactPrimitiveAttrs()` in `react/ksVisualAttrs.ts`) power operator surfaces: tile dropdowns, status banners, decision toolbars, workspace lens pickers, and stage bars. Screen-reader and keyboard users need the same semantics the components implement in TypeScript—not ad-hoc `div` shells with missing names or state.

This deterministic rule scans every visible primitive root on a crawled page and flags repeatable ARIA gaps inside that root: unnamed interactive controls, expand triggers without `aria-expanded`, listbox/toolbar panels without accessible names, `role="option"` nodes without `aria-selected`, `ForgeStatusBanner` roots without `role="status"` or `role="alert"`, and focusable generic `div`/`span` elements without a widget role.

**Plan:** Inventory `react/*.tsx` primitives referenced in `docs/design/catalog/primitives/FAM-react-primitives.md`. **Do:** Mirror accessible names and states in emitted HTML (or fix source). **Check:** Run `collectAppControlA11yReport` via the website UX auditor or ruleset harness. **Adjust:** Prefer native `button`/`a` elements; wire `aria-*` on custom widgets per the family contract.

## Passing signals

- Every visible interactive control inside a primitive root (`button`, `a[href]`, or elements with widget `role`) has a **non-empty accessible name** from visible text, `aria-label`, `aria-labelledby`, or `title`.
- Expand/collapse triggers (`button`, `role="button"`, or `role="combobox"`) that declare `aria-haspopup` or `aria-controls` also set **`aria-expanded="true"` or `"false"`** (e.g. `TileDropdownControl`, `WorkspaceLensControl`, `ForgeDiagnosticPanel`).
- Each visible **`role="listbox"`** has `aria-label` or `aria-labelledby`; each visible **`role="option"`** has **`aria-selected="true"` or `"false"`**.
- Each visible **`role="toolbar"`** (e.g. `ForgeDecisionActionBar`) has **`aria-label`** or `aria-labelledby`.
- **`ForgeStatusBanner`** roots (`data-ks-name="forge-status-banner"` or hash `Fsb`) use **`role="status"`** (default) or **`role="alert"`** for urgent announcements.
- Focusable **`div`/`span` with `tabindex ≥ 0`** inside a primitive root carry a recognized **widget role** (`button`, `option`, `tab`, etc.) or use native focusable elements—no unlabeled generic shells.

## Failing signals

- **`missing-accessible-name`** — Interactive control inside a react-primitive root has no computed accessible name (empty icon-only `button`, chevron-only trigger, etc.).
- **`missing-aria-expanded`** — Trigger exposes `aria-haspopup` / `aria-controls` but omits `aria-expanded`.
- **`listbox-missing-label`** — Visible `role="listbox"` panel lacks an accessible name.
- **`option-missing-selected`** — Visible `role="option"` lacks `aria-selected`.
- **`toolbar-missing-label`** — Visible `role="toolbar"` lacks an accessible name.
- **`banner-missing-live-role`** — `forge-status-banner` root is not `role="status"` or `role="alert"`.
- **`focusable-without-role`** — `div`/`span` with `tabindex ≥ 0` has no widget role (or an unrecognized role).

## Before example

Failing KS markup inside governed primitive roots: unnamed tile trigger, expand trigger without `aria-expanded`, listbox without a label, status banner without a live role, and a focusable generic cell.

```html
<main id="main" class="doc-main px-4 py-4">
  <div
    class="ks-tile-dropdown"
    hash="Tdc"
    data-ks-react-root="true"
    data-ks-type="react-primitive"
    data-ks-hash="Tdc"
    data-ks-name="tile-dropdown-control"
  >
    <button
      type="button"
      class="ks-tile-dropdown__trigger"
      aria-haspopup="listbox"
      aria-controls="tile-panel"
    >
      <span class="ks-tile-dropdown__trigger-chevron" aria-hidden="true"></span>
    </button>
    <div id="tile-panel" class="ks-tile-dropdown__panel" role="listbox">
      <div role="option" class="ks-tile-dropdown__tile">Production</div>
      <div role="option" class="ks-tile-dropdown__tile">Staging</div>
    </div>
  </div>

  <div
    class="ks-fe-banner ks-fe-banner--failed"
    hash="Fsb"
    data-ks-react-root="true"
    data-ks-type="react-primitive"
    data-ks-hash="Fsb"
    data-ks-name="forge-status-banner"
  >
    <strong class="ks-fe-banner__title">Run failed</strong>
    <p class="ks-fe-banner__desc mb-0">Gate rejected the artifact bundle.</p>
  </div>

  <div
    class="ks-fe-actionbar"
    hash="Fda"
    data-ks-react-root="true"
    data-ks-type="react-primitive"
    data-ks-hash="Fda"
    data-ks-name="forge-decision-action-bar"
    role="toolbar"
  >
    <div class="ks-fe-actionbar__inner">
      <button type="button" class="btn btn-forge">Approve</button>
    </div>
  </div>

  <dl
    class="ks-fe-kvgrid ks-fe-kvgrid--dense"
    hash="Fkg"
    data-ks-react-root="true"
    data-ks-type="react-primitive"
    data-ks-hash="Fkg"
    data-ks-name="forge-key-value-grid"
  >
    <div class="ks-fe-kvgrid__row">
      <dt class="ks-fe-kvgrid__label">Artifact</dt>
      <dd class="ks-fe-kvgrid__value" tabindex="0">artifact-7f2a</dd>
    </div>
  </dl>
</main>
```

## After example

Passing KS markup aligned with `TileDropdownControl`, `ForgeStatusBanner`, `ForgeDecisionActionBar`, and `ForgeKeyValueGrid` implementations.

```html
<main id="main" class="doc-main px-4 py-4">
  <div
    class="ks-tile-dropdown"
    hash="Tdc"
    data-ks-react-root="true"
    data-ks-type="react-primitive"
    data-ks-hash="Tdc"
    data-ks-name="tile-dropdown-control"
  >
    <label id="tile-label" class="ks-tile-dropdown__label" for="tile-trigger">Environment</label>
    <button
      type="button"
      id="tile-trigger"
      class="ks-tile-dropdown__trigger"
      aria-expanded="false"
      aria-haspopup="listbox"
      aria-controls="tile-panel"
      aria-label="Environment, Production selected"
    >
      <span class="ks-tile-dropdown__trigger-main">Production</span>
      <span class="ks-tile-dropdown__trigger-chevron" aria-hidden="true"></span>
    </button>
    <div
      id="tile-panel"
      class="ks-tile-dropdown__panel"
      role="listbox"
      aria-labelledby="tile-label"
      tabindex="-1"
      hidden
    >
      <div role="option" class="ks-tile-dropdown__tile ks-tile-dropdown__tile--selected" aria-selected="true">
        Production
      </div>
      <div role="option" class="ks-tile-dropdown__tile" aria-selected="false">Staging</div>
    </div>
  </div>

  <div
    class="ks-fe-banner ks-fe-banner--failed"
    role="status"
    hash="Fsb"
    data-ks-react-root="true"
    data-ks-type="react-primitive"
    data-ks-hash="Fsb"
    data-ks-name="forge-status-banner"
  >
    <div class="ks-fe-banner__body">
      <strong class="ks-fe-banner__title">Run failed</strong>
      <p class="ks-fe-banner__desc mb-0">Gate rejected the artifact bundle.</p>
    </div>
  </div>

  <div
    class="ks-fe-actionbar ks-fe-actionbar--sticky"
    hash="Fda"
    data-ks-react-root="true"
    data-ks-type="react-primitive"
    data-ks-hash="Fda"
    data-ks-name="forge-decision-action-bar"
    role="toolbar"
    aria-label="Run actions"
  >
    <div class="ks-fe-actionbar__inner">
      <button type="button" class="btn btn-forge">Approve</button>
      <button type="button" class="btn btn-outline-forge">Reject</button>
    </div>
  </div>

  <dl
    class="ks-fe-kvgrid ks-fe-kvgrid--dense"
    hash="Fkg"
    data-ks-react-root="true"
    data-ks-type="react-primitive"
    data-ks-hash="Fkg"
    data-ks-name="forge-key-value-grid"
    aria-label="Metadata"
  >
    <div class="ks-fe-kvgrid__row">
      <dt class="ks-fe-kvgrid__label">Artifact</dt>
      <dd class="ks-fe-kvgrid__value" title="artifact-7f2a">artifact-7f2a</dd>
    </div>
  </dl>
</main>
```

## Evidence and remediation

- Auditor evidence cites `hash=…`, control `id`/`className`, and violation `kind` from `design-rules/deterministic/generated/det-app-control-a11y.check.js`.
- **Accessible name:** Add visible label text, `aria-label`, or `aria-labelledby` on triggers and icon-only buttons; follow `docs/design/catalog/primitives/FAM-react-primitives.md` § Accessibility contract.
- **Expand/collapse:** Set `aria-expanded` on any trigger with `aria-haspopup` / `aria-controls` (`TileDropdownControl`, `WorkspaceLensControl`, `ForgeDiagnosticPanel`).
- **Listbox / options:** Name the panel (`aria-label` or `aria-labelledby`); set `aria-selected` on each `role="option"`.
- **Toolbar:** Set `aria-label` on `ForgeDecisionActionBar` (default `"Run actions"` in source).
- **Live banner:** Keep `role="status"` or `role="alert"` on `ForgeStatusBanner`.
- **Generic focus targets:** Use `<button>` / `<a>` or add a widget `role` plus keyboard handlers—do not leave `tabindex` on unlabeled `div`/`span` shells.
- Fix in **`react/*.tsx`** (preferred); static HTML demos should mirror the same attributes. Pilot fixer may stub; most remediations require source edits (`lib/ux-deterministic-fixers/fixers/app-control-a11y-fixer.mjs`).
- Verify: `node tools/website-ux-auditor/auditor-tests/det-app-control-a11y.test.js`, `generator/build_rule_defect_fixtures.py`, and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.CONTROL_A11Y`.

## Related rules

- `DET.APP.PRIMITIVE_MARKERS` — roots emit `hash`, `data-ks-hash`, `data-ks-type`, and `data-ks-name`.
- `DET.APP.PRIMITIVE_SOURCE` — every `KS_REACT_PRIMITIVE` component spreads `ksReactPrimitiveAttrs()`.
- `DET.APP.FOCUS_TRAP` — modal/panel overlays keep keyboard focus until dismiss.
- `DET.NAV.FOCUS_ORDER` — page-level tab order through handbook chrome.
- `DET.APP.TAB_PANEL` — tablists wire `aria-selected` and visible panels.
- `AI.APP.PRIMITIVE_CONSISTENCY` — subjective cross-primitive visual and interaction coherence after deterministic ARIA passes.
