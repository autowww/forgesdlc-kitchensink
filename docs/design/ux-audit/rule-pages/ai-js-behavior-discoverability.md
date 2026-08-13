---
rule_id: AI.JS.BEHAVIOR_DISCOVERABILITY
lane: ai
title: JavaScript behavior discoverability
summary: Non-obvious scripted interactions must be hinted or documented—visible affordances, helper copy, and keyboard/touch parity—not hover-only secrets.
page_version: e638667f9d533645c674de90c85c95850f2beb4d8c45892240832af5e61139e4
generated_at: 2026-05-19T21:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-js-behavior-discoverability
---

## Purpose

Kitchen Sink ships **interaction scripts** under `js/` (family **`Ksj`**: nav/offcanvas, theme picker, diagram modals, chart mounts, presentation fullscreen, roadmap edits, home tile expansion). Many behaviors are progressive enhancements on markup from `components/layouts.py` and transforms—not obvious from static HTML alone.

Deterministic gates (`DET.JS.PROGRESSIVE`, `DET.JS.NO_CONSOLE_ERROR`, `DET.NAV.FOCUS_ORDER`, `DET.MOTION.PREFERS_REDUCED`) prove baseline degradation, console hygiene, focus order, and motion prefs. This AI rule judges **discoverability**: can a visitor or operator infer what will happen before they click, tap, or hover—and find a keyboard/touch path when the script adds behavior?

**Plan:** Walk golden paths on showcase and handbook shells; list controls whose behavior is script-only (expand, modal, offcanvas, theme, chart fetch, fullscreen). **Do:** Add visible affordances (`forge-diagram-trigger`, labeled buttons, `forge-support` helper lines) and document non-obvious shortcuts in page copy or contracts. **Check:** Each non-default interaction has at least one of: visible label/hint, persistent helper copy, or documented operator note; hover-only cues are supplemented for keyboard/touch. **Adjust:** When the same gap repeats (e.g. every expandable diagram missing `forge-diagram-trigger`), propose a `DET.*` candidate or tighten **`Ksj`** forbidden patterns.

## Passing signals

- Expandable diagrams use `forge-diagram-trigger` / `ks-diagram-trigger` so CSS surfaces "Click to expand" (and catalog keys like `data-diagram-key` tie to `openDiagramWithDetail`).
- Mobile handbook chrome exposes a fixed `data-bs-toggle="offcanvas"` control with `aria-label="Open navigation"` and `aria-controls="docNavOffcanvas"` (`Kco`).
- Theme switching uses `forge-theme-trigger` with `aria-label`, `title`, and visible copy—not icon-only mystery meat.
- Script-driven nav (`docs-nav.js`, `fs-nav-dropdown.js`) keeps `aria-expanded` in sync with open panels.
- Chart mounts (`data-ks-chart`, `ks-chart-mount`) show loading/empty copy from `forge-data-charts.js` before data arrives.
- Non-obvious operator flows (presentation fullscreen exit, roadmap edit handles) have visible controls or in-page "How to use" copy.
- Keyboard users reach the same outcomes as hover-reveal hints (`DET.NAV.FOCUS_ORDER` when focus is managed).

## Failing signals

- Clickable diagram or tile with no `forge-diagram-trigger`, no helper line, and no `aria-label`—behavior exists only after trial-and-error.
- Hover-only affordance (`::after` "Click to expand") with no focus-visible equivalent or persistent text for touch users.
- Mobile nav hidden behind a missing, unlabeled, or desktop-only control while `main` assumes sidebar IA.
- Global shortcuts or double-click edits (`nested-roadmap.js`) with no documented affordance on the page or in the contract.
- `onclick` handlers on inert-looking blocks (`figure`, `div`) with no role, label, or visual button metaphor.
- Theme, lens, or tab controls that change layout with no `aria-expanded` / active state and no helper copy.
- Chart or modal surfaces that open on load or timer with no dismiss hint (`AI.MOTION.INTENTIONALITY` overlap).

## Before example

Failing KS markup: expandable diagram and mobile nav depend on script, but nothing signals clickability or offcanvas entry; theme control is icon-only.

```html
<section class="forge-section py-5" hash="Dce" data-ks-hash="Dce" data-ks-type="page" data-ks-name="diagram-code-examples">
  <div class="container-fluid px-3 px-xxl-5">
    <h2 class="h4 mb-3">Architecture overview</h2>
    <figure
      class="forge-diagram breathe-static ks-diagram-tile mb-4"
      onclick="openDiagramWithDetail(this, 'gate-chain-delivery')"
    >
      <div class="ks-diagram-canvas">
        <img src="assets/svg/template-gate-chain.svg" alt="Delivery gate chain" loading="lazy" />
      </div>
    </figure>
    <p class="forge-support mb-4">Use the diagram to explain the flow.</p>
    <main class="p-3">
      <p class="mb-0">Handbook content—no nav button on narrow viewports.</p>
    </main>
    <button type="button" class="forge-theme-trigger dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
      <span class="forge-theme-trigger__icons" aria-hidden="true"></span>
    </button>
  </div>
</section>
```

## After example

Passing KS markup: labeled expand affordance, mobile offcanvas trigger, theme control with accessible name, and persistent helper copy.

```html
<section class="forge-section py-5" hash="Dce" data-ks-hash="Dce" data-ks-type="page" data-ks-name="diagram-code-examples">
  <div class="container-fluid px-3 px-xxl-5">
    <h2 class="h4 mb-3">Architecture overview</h2>
    <p class="forge-support small mb-2">Select the diagram to open a larger view with step-by-step notes.</p>
    <div
      class="forge-diagram breathe-static ks-diagram-tile forge-diagram-trigger ks-diagram-trigger mb-4"
      data-diagram-key="gate-chain-delivery"
      role="button"
      tabindex="0"
      aria-label="Expand delivery gate chain diagram"
      onclick="openDiagramWithDetail(this, 'gate-chain-delivery')"
    >
      <div class="ks-diagram-canvas">
        <img src="assets/svg/template-gate-chain.svg" alt="Delivery gate chain" loading="lazy" />
      </div>
    </div>
    <button
      type="button"
      class="btn btn-forge position-fixed top-0 start-0 m-3 d-lg-none shadow"
      style="z-index:1040"
      data-bs-toggle="offcanvas"
      data-bs-target="#docNavOffcanvas"
      aria-controls="docNavOffcanvas"
      aria-label="Open navigation"
    >
      Menu
    </button>
    <div
      class="offcanvas offcanvas-start d-lg-none"
      hash="Kco"
      data-ks-hash="Kco"
      data-ks-type="chrome-region"
      data-ks-name="doc-offcanvas"
      tabindex="-1"
      id="docNavOffcanvas"
      aria-labelledby="docNavLabel"
    >
      <div class="offcanvas-header border-bottom">
        <h2 class="h6 mb-0" id="docNavLabel">Handbook</h2>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close navigation"></button>
      </div>
    </div>
    <button
      type="button"
      class="forge-theme-trigger dropdown-toggle"
      data-bs-toggle="dropdown"
      data-bs-display="static"
      aria-expanded="false"
      id="forgeThemeMenu"
      aria-haspopup="true"
      aria-label="Appearance and color theme"
      title="Theme"
    >
      <span class="forge-theme-trigger__copy">Theme</span>
    </button>
  </div>
</section>
```

## Evidence and remediation

**Capture:** For each scripted surface, record URL, viewport width, and interaction type (click, hover, keyboard). Screenshot default and hover/focus states for `forge-diagram-trigger`, offcanvas open, and theme dropdown. Note whether helper copy appears without hover. Log console for golden paths (`DET.JS.NO_CONSOLE_ERROR`).

**Remediate (in order):**

1. Classify interactions: obvious (native `<button>`, `<a>`) vs non-obvious (diagram expand, tile tilt, roadmap edit, fullscreen).
2. For non-obvious controls: add `forge-diagram-trigger` or a visible button/link; pair with `forge-support` one-liner above the control.
3. Fix naming: `aria-label`, `title`, `aria-controls`, `aria-expanded` on triggers; align with `Kco` / `Ksj` contracts.
4. Replace hover-only discovery with persistent text or focus-visible hints; verify keyboard path (`DET.NAV.FOCUS_ORDER`).
5. Document operator shortcuts in page prose or catalog contract when behavior cannot be inlined.
6. Re-run progressive check: core content readable with JS disabled (`DET.JS.PROGRESSIVE`).
7. If the same missing hint repeats across pages, propose a deterministic companion (e.g. require `forge-diagram-trigger` when `onclick` opens diagram modal).

## Related rules

- `DET.JS.PROGRESSIVE` — critical content visible without script; enhancements gated.
- `DET.JS.NO_CONSOLE_ERROR` — scripted golden paths do not throw uncaught errors.
- `DET.MOTION.PREFERS_REDUCED` — motion scripts honor reduction prefs.
- `DET.NAV.FOCUS_ORDER` — focus order and traps when scripts manage focus (modals, offcanvas).
- `AI.MOTION.INTENTIONALITY` — motion should guide attention, not replace discoverability cues.
