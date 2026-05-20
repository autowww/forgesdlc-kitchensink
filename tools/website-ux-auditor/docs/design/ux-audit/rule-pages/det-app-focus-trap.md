---
rule_id: DET.APP.FOCUS_TRAP
lane: deterministic
title: Modal and panel focus trap
summary: Bootstrap modals/offcanvas and KS diagram/topic-preview overlays must keep keyboard focus inside the open shell until dismiss, with a reachable exit control.
page_version: b00d291ded12c54043f412b186dfb0ed74880144c3ffab69d19386d2c6be1b47
generated_at: 2026-05-19T20:15:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 6773fda516344e110b5a7b1435e655e1264e773825ca8bbe62194189891c42ba
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-focus-trap
related_rules:
  - DET.NAV.FOCUS_ORDER
  - DET.REACT.A11Y_ROLE
  - DET.APP.PERSISTENT_CHROME
  - AI.JS.BEHAVIOR_DISCOVERABILITY
  - AI.APP.DENSITY_BALANCE
---

## Purpose

Kitchen Sink handbook and product layouts rely on **overlay shells** that block the page until the user dismisses them:

- **Bootstrap** — `.modal` and `.offcanvas` (mobile handbook nav `docNavOffcanvas`, `Kco`).
- **KS diagram lightbox** — `#diagramModal` with `.diagram-modal-backdrop`, `.diagram-modal-close`, and `closeDiagramModal()` (`forge-theme.js`).
- **Topic preview** — `#topicPreviewModal` with `.topic-preview-modal-backdrop`, `[data-topic-preview-close]`, and `openTopicPreviewModal()` / `closeTopicPreviewModal()`.
- **Custom dialogs** — `[role="dialog"]` surfaces with `aria-modal="true"`.

While an overlay is open, keyboard users must not tab into background `<main>` content, lose focus outside the shell, or be stuck without a dismiss control. This deterministic rule scans overlay markup on every crawled page and, when a safe opener exists, runs a short Tab-cycle probe (up to two shells per page).

**Plan:** Inventory `.modal`, `.offcanvas`, `#diagramModal`, and `#topicPreviewModal` on app/handbook templates. **Do:** Pair shells with visible openers, Bootstrap dismiss wiring, and KS close affordances. **Check:** Open the overlay with keyboard, Tab through controls, confirm focus never lands on `main` links. **Adjust:** Add `aria-modal="true"`, inert/aria-hidden on the page root, or Bootstrap's built-in trap when custom JS bypasses it.

## Passing signals

- Every overlay shell includes a **keyboard-reachable dismiss**: `data-bs-dismiss`, `.btn-close`, `.diagram-modal-close`, `[data-topic-preview-close]`, or a `<button>` whose `aria-label` / text contains "close".
- Bootstrap `.offcanvas` / `.modal` shells with an `id` have a **visible opener** using `data-bs-toggle` + `data-bs-target` (or `aria-controls`) — e.g. the fixed `btn btn-forge` control targeting `#docNavOffcanvas`.
- With the shell **open** (`show` / `active` / `aria-hidden="false"`), repeated **Tab** cycles keep `document.activeElement` inside the shell; `main` links are not focusable until dismiss.
- Open `role="dialog"` overlays expose **`aria-modal="true"`** plus `aria-labelledby` or `aria-label` (topic preview sets these in `ensureTopicPreviewModal()`).
- KS diagram modal uses the shared fragment: `#diagramModal` + `.diagram-modal-close` calling `closeDiagramModal()`; closed state uses the `hidden` attribute so scaffold text stays out of the tab order.

## Failing signals

- **`no-dismiss`** — Shell present (`.modal`, `.offcanvas`, or `[role="dialog"]`) with no dismiss control the probe recognizes.
- **`no-trigger`** — Bootstrap shell has an `id` but no visible `data-bs-target` / `aria-controls` opener in the document (orphan offcanvas/modal).
- **`trap-escape`** — While open, Tab moves focus to an element **outside** the shell (e.g. a `.nav-link` in the page chrome).
- **`background-tabbable`** — Focus can land on the first tabbable control inside `<main>` while the overlay is open.
- **`no-focusable`** — Open shell exposes **no tabbable** controls (keyboard users cannot reach actions or close).
- **`missing-aria-modal`** — Open dialog overlay has `role="dialog"` but not `aria-modal="true"`.

## Before example

Failing KS markup: diagram lightbox open without a close control; background prose remains in the tab order.

```html
<main class="forge-main">
  <a class="nav-link" href="#intro">Introduction</a>
  <figure class="forge-diagram">
    <img src="assets/svg/diagrams/sample-flow.svg" alt="Sample flow" />
  </figure>
</main>

<div
  id="diagramModal"
  class="diagram-modal-backdrop active"
  aria-hidden="false"
  role="dialog"
>
  <div class="diagram-modal">
    <div class="diagram-modal-header">
      <div id="diagramModalTitle" class="diagram-modal__title forge-gradient-text" role="heading" aria-level="2">
        Expanded diagram
      </div>
    </div>
    <div class="diagram-modal-body">
      <div id="diagramModalCanvas" class="diagram-modal-canvas"></div>
    </div>
  </div>
</div>
```

## After example

Passing KS markup: canonical diagram modal fragment plus handbook offcanvas with Bootstrap dismiss and a paired mobile opener.

```html
<button
  type="button"
  class="btn btn-forge position-fixed top-0 start-0 m-3 d-lg-none shadow"
  data-bs-toggle="offcanvas"
  data-bs-target="#docNavOffcanvas"
  aria-controls="docNavOffcanvas"
  aria-label="Open navigation"
>
  <span class="navbar-toggler-icon" aria-hidden="true"></span>
</button>

<div
  class="offcanvas offcanvas-start"
  tabindex="-1"
  id="docNavOffcanvas"
  aria-labelledby="docNavLabel"
>
  <div class="offcanvas-header">
    <h5 class="offcanvas-title font-display" id="docNavLabel">Handbook</h5>
    <button
      type="button"
      class="btn-close btn-close-white"
      data-bs-dismiss="offcanvas"
      aria-label="Close"
    ></button>
  </div>
  <div class="offcanvas-body forge-sidebar p-0">
    <nav class="nav flex-column px-2 py-2 nav-rail" aria-label="Mobile navigation"></nav>
  </div>
</div>

<div id="diagramModal" class="diagram-modal-backdrop" hidden aria-hidden="true">
  <div class="diagram-modal">
    <div class="diagram-modal-header">
      <div id="diagramModalTitle" class="diagram-modal__title forge-gradient-text" role="heading" aria-level="2"></div>
      <button
        type="button"
        class="diagram-modal-close"
        onclick="closeDiagramModal()"
        aria-label="Close"
      >
        <span class="diagram-modal-close-icon" aria-hidden="true"></span>
      </button>
    </div>
    <div class="diagram-modal-body">
      <div id="diagramModalCanvas" class="diagram-modal-canvas"></div>
      <div id="diagramModalDetail" class="diagram-modal-detail"></div>
    </div>
  </div>
</div>
```

## Evidence and remediation

**Evidence:** Metrics field `appFocusTrapReport` with `overlayShellCount`, `openTestsRun`, and `violations[]` entries tagged `no-dismiss`, `no-trigger`, `trap-escape`, `background-tabbable`, `no-focusable`, or `missing-aria-modal`. Findings cite shell `id`, truncated `className`, and the element that received focus when escape was detected.

**Remediate (in order):**

1. Add a **visible, labeled close** — `.btn-close` + `data-bs-dismiss="offcanvas"` for Bootstrap shells; `.diagram-modal-close` or `[data-topic-preview-close]` for KS modals.
2. **Pair Bootstrap shells** with `data-bs-toggle` / `data-bs-target` on the handbook hamburger (`components/layouts.py` mobile nav pattern).
3. When custom JS opens overlays, mirror **`forgeApplyDiagramModalOpen` / `closeDiagramModal`** or topic-preview helpers so `hidden` / `aria-hidden` / `active` stay consistent and background content is inert or aria-hidden.
4. On open, verify **Tab cycles stay inside** the shell; if focus escapes, enable Bootstrap's modal/offcanvas focus trap or set `inert` on `main` until dismiss.
5. Set **`role="dialog"`** with **`aria-modal="true"`** and restore focus to the triggering control on close (`DET.NAV.FOCUS_ORDER`).
6. Re-run `analyze-website-ux.mjs` on handbook and showcase URLs that include diagram expand and mobile nav.

## Related rules

- `DET.NAV.FOCUS_ORDER` — logical tab order and focus restoration when overlays close.
- `DET.REACT.A11Y_ROLE` — ARIA roles and keyboard semantics on React primitive overlays.
- `DET.APP.PERSISTENT_CHROME` — shell regions stable across routes; traps apply within that chrome.
- `AI.JS.BEHAVIOR_DISCOVERABILITY` — openers and dismiss paths must be inferable before interaction.
- `AI.APP.DENSITY_BALANCE` — dense operator UIs still need reachable exit from stacked panels.
