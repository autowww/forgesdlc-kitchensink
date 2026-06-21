---
rule_id: DET.APP.FOCUS_TRAP
lane: deterministic
title: Modal and panel focus trap
summary: Bootstrap modals/offcanvas and KS diagram/topic-preview overlays must keep keyboard focus inside the open shell until dismiss, with a reachable exit control.
page_version: fa5dee2e6870a2b15bf5e0e508bc424767e16479167ec419ca40b8adfa8ccc8b
generated_at: 2026-05-28T18:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-focus-trap
related_rules:
  - DET.NAV.FOCUS_ORDER
  - DET.APP.CONTROL_A11Y
  - DET.APP.PERSISTENT_CHROME
  - AI.JS.BEHAVIOR_DISCOVERABILITY
  - AI.APP.DENSITY_BALANCE
---

## Purpose

Kitchen Sink handbook and product layouts rely on **overlay shells** that block the page until the user dismisses them:

- **Bootstrap** — `.modal` and `.offcanvas` (handbook mobile nav `#docNavOffcanvas`, studio shells).
- **KS diagram lightbox** — `#diagramModal` with `.diagram-modal-backdrop`, `.diagram-modal-close`, and `forgeApplyDiagramModalOpen()` / `closeDiagramModal()` (`forge-theme.js`, `components/diagram_modal_fragment.py`).
- **Topic preview** — `#topicPreviewModal` with `.topic-preview-modal-backdrop`, `[data-topic-preview-close]`, and `openTopicPreviewModal()` / `closeTopicPreviewModal()`.
- **Custom dialogs** — `[role="dialog"]` with `aria-modal="true"`.

While an overlay is open, keyboard users must not tab into background `<main>` content, lose focus outside the shell, or be stuck without a dismiss control. `det-app-focus-trap.check.js` inventories shells on every crawled page and, when a safe opener exists (Bootstrap `data-bs-target` or `forgeApplyDiagramModalOpen` for `#diagramModal`), runs a short Tab-cycle probe on up to **two** shells per page.

**Plan:** Inventory `.modal`, `.offcanvas`, `#diagramModal`, and `#topicPreviewModal` on app and handbook templates. **Do:** Pair shells with visible openers, Bootstrap dismiss wiring, and KS close affordances. **Check:** Open the overlay from the keyboard, Tab through controls, confirm `document.activeElement` stays inside the shell. **Adjust:** Add `aria-modal="true"`, inert/aria-hidden on the page root, or Bootstrap's built-in trap when custom JS bypasses it.

## Passing signals

- Every overlay shell includes a **keyboard-reachable dismiss**: `data-bs-dismiss`, `.btn-close`, `.diagram-modal-close`, `[data-topic-preview-close]`, or a `<button>` whose `aria-label` / visible text contains "close".
- Bootstrap `.offcanvas` / `.modal` shells with an `id` have a **visible opener** using `data-bs-toggle` + `data-bs-target` (or `aria-controls`) — e.g. the fixed `btn btn-forge` control targeting `#docNavOffcanvas` from `components/layouts.py`.
- With the shell **open** (`.show`, `.active`, or `aria-hidden="false"`), repeated **Tab** cycles keep focus inside the shell; the first tabbable in `<main>` is not reachable until dismiss (`trap-escape` and `background-tabbable` absent).
- Open `role="dialog"` overlays expose **`aria-modal="true"`** plus `aria-labelledby` or `aria-label` (`forgeApplyDiagramModalOpen` sets these on `#diagramModal`; `ensureTopicPreviewModal()` does the same for topic preview).
- KS diagram modal uses the shared fragment: `#diagramModal` + `.diagram-modal-close` calling `closeDiagramModal()`; closed state uses the HTML **`hidden`** attribute so scaffold text stays out of the tab order.
- Evidence shape: `appFocusTrapReport.overlayShellCount` ≥ 0, `openTestsRun` may be 0–2, and `violations[]` is empty.

## Failing signals

| Kind | Meaning |
|------|---------|
| **`no-dismiss`** | Shell present (`.modal`, `.offcanvas`, or dialog) with no dismiss control the probe recognizes. |
| **`no-trigger`** | Bootstrap shell has an `id` but no visible `data-bs-target` / `aria-controls` opener in the document (orphan offcanvas/modal). |
| **`trap-escape`** | While open, Tab moves focus to an element **outside** the shell (e.g. a `.nav-link` in page chrome). |
| **`background-tabbable`** | Focus can land on the first tabbable control inside `<main>` while the overlay is open. |
| **`no-focusable`** | Open shell exposes **no tabbable** controls (keyboard users cannot reach actions or close). |
| **`missing-aria-modal`** | Open dialog overlay has `role="dialog"` but not `aria-modal="true"`. |

Severity in findings: `no-dismiss`, `trap-escape`, and `background-tabbable` are **major**; `no-trigger` and `missing-aria-modal` are **minor**; `no-focusable` is **warn**.

## Before example

Failing KS markup: orphan mobile offcanvas (no opener), diagram lightbox open without a close control, and `main` links still in the tab path.

```html
<main id="main" class="doc-main px-4 py-4">
  <a class="nav-link" href="#intro">Introduction</a>
  <figure class="forge-diagram">
    <button type="button" class="btn btn-sm btn-forge" aria-label="Expand diagram">Expand</button>
    <img src="assets/svg/diagrams/sample-flow.svg" alt="Sample flow" />
  </figure>
</main>

<div
  class="offcanvas offcanvas-start"
  tabindex="-1"
  id="docNavOffcanvas"
  aria-labelledby="docNavLabel"
>
  <div class="offcanvas-header">
    <h5 class="offcanvas-title font-display" id="docNavLabel">Handbook</h5>
  </div>
  <div class="offcanvas-body forge-sidebar p-0">
    <nav class="nav flex-column px-2 py-2 nav-rail" aria-label="Mobile navigation"></nav>
  </div>
</div>

<div
  id="diagramModal"
  class="diagram-modal-backdrop active"
  role="dialog"
  aria-hidden="false"
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

Passing KS markup: handbook mobile opener + Bootstrap dismiss, canonical diagram modal fragment, and topic-preview close wiring.

```html
<button
  type="button"
  class="btn btn-forge position-fixed top-0 start-0 m-3 d-lg-none shadow"
  style="z-index:1040"
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

<div
  id="topicPreviewModal"
  class="diagram-modal-backdrop topic-preview-modal-backdrop"
  role="dialog"
  aria-modal="true"
  aria-labelledby="topicPreviewModalTitle"
  hidden
>
  <div class="diagram-modal topic-preview-modal-dialog">
    <h3 id="topicPreviewModalTitle" class="topic-preview-modal-sr-title">Preview</h3>
    <div class="topic-preview-modal-toolbar">
      <button
        type="button"
        class="diagram-modal-close topic-preview-modal-close"
        data-topic-preview-close
        aria-label="Close"
      >
        &times;
      </button>
    </div>
    <div class="diagram-modal-body topic-preview-modal-body">
      <div id="topicPreviewModalCanvas" class="diagram-modal-canvas topic-preview-modal-canvas"></div>
    </div>
  </div>
</div>
```

## Evidence and remediation

**Evidence:** Metrics field `appFocusTrapReport` with `overlayShellCount`, `openTestsRun`, and `violations[]` entries tagged `no-dismiss`, `no-trigger`, `trap-escape`, `background-tabbable`, `no-focusable`, or `missing-aria-modal`. Findings cite shell `id`, truncated `className`, and the element that received focus when escape was detected (`activeTag`, `activeClass`).

**Remediate (in order):**

1. Add a **visible, labeled close** — `.btn-close` + `data-bs-dismiss="offcanvas"` for Bootstrap shells; `.diagram-modal-close` or `[data-topic-preview-close]` for KS modals (`render_diagram_expand_modal_html()`).
2. **Pair Bootstrap shells** with `data-bs-toggle` / `data-bs-target` on the handbook hamburger (`handbook_page` / `chapter_page` mobile nav pattern in `components/layouts.py`).
3. When custom JS opens overlays, call **`forgeApplyDiagramModalOpen` / `forgeApplyDiagramModalClose`** or topic-preview helpers so `hidden`, `aria-hidden`, `active`, and `aria-modal` stay consistent; set `document.body.style.overflow = 'hidden'` only while open.
4. On open, verify **Tab cycles stay inside** the shell; if focus escapes, enable Bootstrap's modal/offcanvas focus trap or set **`inert`** / `aria-hidden="true"` on `main` until dismiss.
5. Set **`role="dialog"`** with **`aria-modal="true"`** and restore focus to the triggering control on close (`DET.NAV.FOCUS_ORDER`).
6. Re-run `analyze-website-ux.mjs` on handbook and showcase URLs that include diagram expand and mobile nav; optional harness: `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.FOCUS_TRAP`.

Pilot fixer: `patchAppFocusTrap` in `lib/ux-deterministic-fixers/fixers/patch-registry.mjs` (when remediation loop is enabled).

## Related rules

- `DET.NAV.FOCUS_ORDER` — logical tab order and focus restoration when overlays close.
- `DET.APP.CONTROL_A11Y` — ARIA roles and keyboard semantics on React primitive overlays.
- `DET.APP.PERSISTENT_CHROME` — shell regions stable across routes; traps apply within that chrome.
- `AI.JS.BEHAVIOR_DISCOVERABILITY` — openers and dismiss paths must be inferable before interaction.
- `AI.APP.DENSITY_BALANCE` — dense operator UIs still need a reachable exit from stacked panels.
