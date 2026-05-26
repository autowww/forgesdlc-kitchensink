---
rule_id: DET.JS.NO_CONSOLE_ERROR
lane: deterministic
title: No console errors on scripted golden paths
summary: Playwright smoke must complete tab, collapse, theme, and nav toggles without console errors or uncaught page exceptions on Kitchen Sink scripted surfaces.
page_version: 01cb5ec00334415a9f9108a46f624c90a59e31b6735c536e0871f57174fd74e7
generated_at: 2026-05-25T20:15:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-js-no_console_error
related_rules:
  - DET.JS.PROGRESSIVE
  - DET.NAV.FOCUS_ORDER
  - DET.MOTION.PREFERS_REDUCED
  - AI.JS.BEHAVIOR_DISCOVERABILITY
---

## Purpose

Kitchen Sink pages ship **Bootstrap 5** toggles (`data-bs-toggle="tab"`, `collapse`, `pill`), **`<details>`** summaries, **theme** controls (`forge-theme-trigger`, `[data-theme-toggle]`), and **mobile nav** (`navbar-toggler`). Companion scripts under `js/` (`forge-theme.js`, `portal-nav.js`, `ks-diagram-modal.js`, and related **Ksj** family modules) attach to those hooks during load and on user interaction.

This deterministic rule proves that **golden-path smoke**—a bounded sequence of up to five clicks on the selectors the auditor probes—does not emit **`console` type `error`** messages or **`pageerror`** uncaught exceptions. Failures usually mean a missing DOM hook, a script loaded before its dependency, or inline page logic that throws when a tab or theme control is activated.

**Plan:** Treat showcase and handbook routes with scripted chrome as smoke targets. **Do:** Fix the underlying exception in `js/` or page wiring, then re-run Playwright smoke. **Check:** `metrics.jsConsoleErrorReport` has `errorCount: 0`. **Adjust:** Pair with **`DET.JS.PROGRESSIVE`** when content also depends on script to render; this rule does not replace noscript baseline checks.

## Passing signals

- **`metrics.jsConsoleErrorReport`**: `{ errorCount: 0, errors: [], smokeSteps: N }` after `collectJsConsoleErrorReport` (or precomputed crawl metrics).
- Golden-path clicks on **`[data-bs-toggle="tab"]`**, **`collapse`**, **`pill`**, **`<details> summary`**, **theme toggles**, and **`.navbar-toggler[data-bs-toggle="collapse"]`** complete without new console errors.
- **`fs-tab-panel`** tab buttons switch panes via Bootstrap only; no inline handler calls `console.error` or references undefined globals (`forgeAmbient`, chart hosts, etc.).
- **`forge-theme-trigger`** dropdown opens and applies theme without throwing; `forge-theme.js` finds expected `data-bs-theme-value` nodes when present.
- **`pageerror`** channel stays silent during load and smoke (no `Uncaught ReferenceError` / `TypeError` from missing bundles).
- Ignored noise only: favicon load failures, `ResizeObserver loop`, extension URLs, devtools source-map chatter (`shouldIgnoreConsoleMessage` filters these).
- Showcase smoke and consumer handbook builds pass the same probe on audited URLs.

## Failing signals

- **`console` error** during load or smoke—for example `Chart init failed: missing container` with `kind=console` and `location=…app.js:12`.
- **`pageerror`**—for example `Uncaught ReferenceError: forgeAmbient is not defined` (**major** severity).
- Finding evidence includes `kind=console` or `kind=pageerror`, quoted `message="…"`, optional `location=`, `smokeStep=N`, and `url=`.
- Tab click on **`fs-tab-panel__tabs`** triggers an intentional `console.error` from inline `<script>` (harness defect pattern).
- Theme or mobile nav toggle runs before `forge-theme.js` / `portal-nav.js` is loaded, leaving handlers on `undefined`.
- Errors appear only after the **fifth** smoke step—still a fail if any non-ignored error occurred earlier on that URL.
- Page may still expose readable HTML without script (**`DET.JS.PROGRESSIVE`**) while failing here—console hygiene is independent of noscript baseline.

## Before example

Failing KS markup: enterprise-style tab panel plus inline script that logs a console error when the auditor clicks the tab control (same pattern as the ruleset harness defect fixture).

```html
<main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pb-5 doc-main">
  <h1 class="font-display mb-3">Interaction scripts</h1>
  <p class="forge-support mb-3">
    Tab panels and theme controls must survive golden-path smoke without console errors.
  </p>
  <section class="fs-tab-panel" hash="Ksj" data-ks-hash="Ksj" data-ks-type="script-family" data-ks-name="Kitchen Sink interaction scripts">
    <ul class="nav nav-tabs fs-tab-panel__tabs flex-wrap gap-1 border-bottom-0" role="tablist" aria-label="Script demos">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="ks-demo-overview-tab" data-bs-toggle="tab"
          data-bs-target="#ks-demo-overview-pane" type="button" role="tab"
          aria-controls="ks-demo-overview-pane" aria-selected="true">Overview</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="ks-demo-theme-tab" data-bs-toggle="tab"
          data-bs-target="#ks-demo-theme-pane" type="button" role="tab"
          aria-controls="ks-demo-theme-pane" aria-selected="false">Theme</button>
      </li>
    </ul>
    <div class="tab-content fs-tab-panel__panes">
      <div class="tab-pane fade show active" id="ks-demo-overview-pane" role="tabpanel"
        aria-labelledby="ks-demo-overview-tab" tabindex="0">
        <div class="fs-tab-panel__body pt-3">
          <div class="forge-card breathe-static p-3">
            <p class="forge-support mb-0">Bootstrap tab wiring only—broken follow-up script below.</p>
          </div>
        </div>
      </div>
      <div class="tab-pane fade" id="ks-demo-theme-pane" role="tabpanel"
        aria-labelledby="ks-demo-theme-tab" tabindex="0">
        <div class="fs-tab-panel__body pt-3">
          <button type="button" class="forge-theme-trigger dropdown-toggle" data-bs-toggle="dropdown"
            data-bs-display="static" aria-expanded="false" id="forgeThemeMenu"
            aria-haspopup="true" aria-label="Appearance and color theme" title="Theme">
            <span class="forge-theme-trigger__inner">
              <span class="forge-theme-trigger__copy">Theme</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>
  <script>
    document.getElementById('ks-demo-theme-tab')?.addEventListener('click', function () {
      console.error('KS smoke: intentional console error on tab activation');
      if (typeof forgeAmbient === 'undefined') forgeAmbient.init();
    });
  </script>
</main>
```

## After example

Passing KS markup: same tab and theme affordances with standard bundles and no throwing inline handlers.

```html
<main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pb-5 doc-main">
  <h1 class="font-display mb-3">Interaction scripts</h1>
  <p class="forge-support mb-3">
    Tab panels and theme controls complete golden-path smoke without console or page errors.
  </p>
  <section class="fs-tab-panel" hash="Ksj" data-ks-hash="Ksj" data-ks-type="script-family" data-ks-name="Kitchen Sink interaction scripts">
    <ul class="nav nav-tabs fs-tab-panel__tabs flex-wrap gap-1 border-bottom-0" role="tablist" aria-label="Script demos">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="ks-demo-overview-tab" data-bs-toggle="tab"
          data-bs-target="#ks-demo-overview-pane" type="button" role="tab"
          aria-controls="ks-demo-overview-pane" aria-selected="true">Overview</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="ks-demo-theme-tab" data-bs-toggle="tab"
          data-bs-target="#ks-demo-theme-pane" type="button" role="tab"
          aria-controls="ks-demo-theme-pane" aria-selected="false">Theme</button>
      </li>
    </ul>
    <div class="tab-content fs-tab-panel__panes">
      <div class="tab-pane fade show active" id="ks-demo-overview-pane" role="tabpanel"
        aria-labelledby="ks-demo-overview-tab" tabindex="0">
        <div class="fs-tab-panel__body pt-3">
          <div class="forge-card breathe-static p-3">
            <p class="forge-support mb-0">Scripts enhance navigation; core copy stays in the DOM.</p>
          </div>
        </div>
      </div>
      <div class="tab-pane fade" id="ks-demo-theme-pane" role="tabpanel"
        aria-labelledby="ks-demo-theme-tab" tabindex="0">
        <div class="fs-tab-panel__body pt-3">
          <div class="dropdown">
            <button type="button" class="forge-theme-trigger dropdown-toggle" data-bs-toggle="dropdown"
              data-bs-display="static" aria-expanded="false" id="forgeThemeMenu"
              aria-haspopup="true" aria-label="Appearance and color theme" title="Theme">
              <span class="forge-theme-trigger__inner">
                <span class="forge-theme-trigger__copy">Theme</span>
              </span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="forgeThemeMenu">
              <li><button type="button" class="dropdown-item" data-bs-theme-value="dark">Dark</button></li>
              <li><button type="button" class="dropdown-item" data-bs-theme-value="light">Light</button></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
  <script src="/js/forge-theme.js" defer></script>
</main>
```

## Evidence and remediation

**Evidence:** Playwright listeners in **`beginJsConsoleErrorCapture`** record `console` **error** lines and **`pageerror`** events while **`runGoldenPathSmoke`** clicks up to five visible controls from `SMOKE_SELECTORS` (tabs, collapse, pills, details summary, theme toggle, navbar toggler). Findings cite `kind=`, `message="…"`, optional `location=`, `smokeStep=`, and `url=`. Module: `design-rules/deterministic/generated/det-js-no-console-error.check.js`. Metric: **`metrics.jsConsoleErrorReport`**.

**Remediate (in order):**

1. **Reproduce locally:** Open DevTools → Console, load the failing route, click the same tab/theme/nav controls the auditor uses; note the first non-ignored error line.
2. **Fix script defects:** Guard optional modules (charts, ambient layers, diagram modals) until DOM hosts exist; load `js/` bundles with `defer` in dependency order; remove debug `console.error` and inline throws from generators.
3. **Align DOM hooks:** Match `data-bs-target` / `aria-controls` ids to pane markup (`fs-tab-panel__panes`); ensure theme dropdown items expose `data-bs-theme-value` when `forge-theme.js` is included.
4. **Verify ignores:** Confirm failures are not favicon, ResizeObserver, or extension noise—those are filtered and should not mask real app errors.
5. **Re-verify:** Run `python3 generator/build-showcase.py`, then `analyze-website-ux.mjs` on showcase or consumer `website/` roots; confirm `jsConsoleErrorReport.errorCount === 0`. Harness: `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.JS.NO_CONSOLE_ERROR`.

## Related rules

- `DET.JS.PROGRESSIVE` — critical copy visible without script; complements but does not replace console hygiene.
- `DET.NAV.FOCUS_ORDER` — keyboard order when scripts move focus after tab or offcanvas open.
- `DET.MOTION.PREFERS_REDUCED` — motion scripts must not throw when reduction prefs disable animation.
- `AI.JS.BEHAVIOR_DISCOVERABILITY` — judgment on whether scripted affordances are understandable; requires clean console on golden paths first.
