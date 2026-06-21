---
rule_id: DET.APP.PRIMITIVE_STYLES
lane: deterministic
title: React primitive stylesheet wiring
summary: Pages that mount visible KS React primitives must link forge-react-primitives.css and apply ks-fe-* classes on each primitive root.
page_version: c46becf0f3421283779fd56cbf19e9b3e06aa05ebe4bc0961df91e7d5e36b73f
generated_at: 2026-05-28T20:15:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primitive_styles
related_rules:
  - DET.APP.PRIMITIVE_MARKERS
  - DET.APP.PRIMITIVE_SOURCE
  - DET.APP.SHELL_INTEGRATION
  - DET.APP.CONTROL_A11Y
  - AI.APP.PRIMITIVE_CONSISTENCY
---

## Purpose

Kitchen Sink **React primitives** (`ForgeStatusBanner`, `ForgeWorkflowStageBar`, `ForgeRunHeader`, and siblings in `react/*.tsx`) render governed operator surfaces with token classes from **`css/forge-react-primitives.css`** (`ks-fe-banner`, `ks-fe-stagebar`, `ks-fe-run-header`, and related `ks-fe-*` hooks). When a page mounts a visible primitive root (`[data-ks-react-root="true"]` or `[data-ks-type="react-primitive"][data-ks-hash]`), the crawl must prove the stylesheet bundle is linked and each root carries at least one `ks-fe-*` class so presentation does not fall back to unstyled markup or ad-hoc Bootstrap skins.

`collectAppPrimitiveStylesReport` in `design-rules/deterministic/generated/det-app-primitive-styles.check.js` runs in the **metrics** phase. It does not validate hash markers (**`DET.APP.PRIMITIVE_MARKERS`**), source spreading (**`DET.APP.PRIMITIVE_SOURCE`**), or Bootstrap adjacency (**`DET.APP.SHELL_INTEGRATION`**).

**Plan:** Ship or embed a page that mounts React primitives (showcase `forge-react-primitives.html`, `react-primitives-live.html`, or a consumer studio shell). **Do:** Link `forge-react-primitives.css` in `<head>` (or the consumer bundle that includes it) and keep `ks-fe-*` classes on the outermost primitive element as implemented in `react/*.tsx`. **Check:** `node tools/website-ux-auditor/analyze-website-ux.mjs --url …` or the DET harness after `generator/build_rule_defect_fixtures.py`. **Adjust:** Wire the stylesheet before fixing marker drift; a root can pass **`DET.APP.PRIMITIVE_MARKERS`** while still failing here.

## Passing signals

- At least one visible primitive root is present and **`appPrimitiveStylesReport.skipped`** is false with an empty **`violations`** array.
- A `<link rel="stylesheet">` **`href`** contains the substring **`forge-react-primitives`** (for example `/css/forge-react-primitives.css` or showcase `assets/forge-react-primitives.css`).
- Every visible root matching the primitive selector has **`class`** containing at least one token starting with **`ks-fe-`** (for example `ks-fe-banner`, `ks-fe-stagebar`, `ks-fe-run-header`).
- Showcase pages such as `showcase/forge-react-primitives.html` load `assets/forge-react-primitives.css` alongside `forge-theme.css` and mount primitives with variant modifiers (`ks-fe-banner--failed`, `ks-fe-stagebar--nav`).
- Passing this rule does **not** imply markers, ARIA, or cross-primitive visual coherence — see **`DET.APP.PRIMITIVE_MARKERS`**, **`DET.APP.CONTROL_A11Y`**, and **`AI.APP.PRIMITIVE_CONSISTENCY`**.

## Failing signals

- **`missing-stylesheet` (minor):** Visible primitive roots exist but no stylesheet link's `href` includes `forge-react-primitives` (theme-only pages that mount React roots).
- **`missing-ks-fe-class` (minor):** A visible root has governed markers (`data-ks-hash`, `data-ks-react-root`) but no `ks-fe-*` class on the root element (hand-rolled mount or stripped `className` in a fork).
- Findings reference **`area: visual-catalog`**, evidence `kind=` and `hash=` / `ksName=`, and remediation to link `css/forge-react-primitives.css` before mounting react roots.
- Hidden, zero-size, or `display:none` roots are skipped; up to **`MAX_APP_PRIMITIVE_STYLES_FINDINGS` (8)** violations per page.

## Before example

Failing operator surface: hash markers are present and the page loads theme CSS, but **`forge-react-primitives.css`** is missing and the mount root has no `ks-fe-*` hook — the banner renders as unstyled block content inside Bootstrap chrome.

```html
<main id="main" class="doc-main px-4 py-4">
  <div class="mx-auto doc-content" style="max-width:56rem">
    <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
      <p class="section-label text-cyan mb-2">Studio run</p>
      <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.25rem)">Docs health #8842</h1>
    </header>
    <div
      role="alert"
      hash="Fsb"
      data-ks-hash="Fsb"
      data-ks-type="react-primitive"
      data-ks-name="forge-status-banner"
      data-ks-react-root="true"
    >
      <strong>Failed step</strong>
      <div>Container argv drift detected. Resolve before approval.</div>
      <button type="button" class="btn btn-sm btn-outline-secondary">View logs</button>
    </div>
  </div>
</main>
```

(Page `<head>` links only `forge-theme.css` / Bootstrap — no `forge-react-primitives.css`.)

## After example

Passing mount (aligned with `react/ForgeStatusBanner.tsx`): primitive stylesheet linked and the root carries `ks-fe-banner` plus the failed variant modifier and internal `ks-fe-banner__*` structure.

```html
<head>
  <link rel="stylesheet" href="/css/forge-theme.css">
  <link rel="stylesheet" href="/css/forge-react-primitives.css">
</head>
<main id="main" class="doc-main px-4 py-4">
  <div class="mx-auto doc-content" style="max-width:56rem">
    <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
      <p class="section-label text-cyan mb-2">Studio run</p>
      <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.25rem)">Docs health #8842</h1>
    </header>
    <div
      class="ks-fe-banner ks-fe-banner--failed mt-3"
      role="alert"
      hash="Fsb"
      data-ks-hash="Fsb"
      data-ks-type="react-primitive"
      data-ks-name="forge-status-banner"
      data-ks-react-root="true"
    >
      <div class="ks-fe-banner__body">
        <strong class="ks-fe-banner__title">Failed step</strong>
        <div class="ks-fe-banner__desc">Container argv drift detected. Resolve before approval.</div>
      </div>
      <div class="ks-fe-banner__actions">
        <button type="button" class="btn btn-sm btn-outline-secondary">View logs</button>
      </div>
    </div>
  </div>
</main>
```

## Evidence and remediation

1. **Detect:** `node tools/website-ux-auditor/analyze-website-ux.mjs --url …` or `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.PRIMITIVE_STYLES` after `python3 generator/build_rule_defect_fixtures.py`.
2. **Read findings:** Look for `missing-stylesheet` vs `missing-ks-fe-class` in evidence; note `hash` and `ksName` when the root is identified.
3. **Link CSS:** Add `<link rel="stylesheet" href="…/forge-react-primitives.css">` in the page shell, or ensure the consumer build copies `css/forge-react-primitives.css` into the deployed asset tree (showcase uses `assets/forge-react-primitives.css`).
4. **Preserve classes in source:** Keep `ks-fe-*` on the outermost element in `react/*.tsx` (see `ForgeStatusBanner`, `ForgeWorkflowStageBar`, `ForgeRunHeader`); do not strip `className` when spreading `ksReactPrimitiveAttrs()`.
5. **Rebuild:** `python3 generator/build-showcase.py` when showcase embeds change; re-run the DET harness or sitewide UX audit.
6. **Escalate:** If styles and stylesheet pass but Bootstrap `alert`/`badge` sit beside primitives, fix **`DET.APP.SHELL_INTEGRATION`**; if markers are missing, fix **`DET.APP.PRIMITIVE_MARKERS`** first; for subjective cross-primitive polish, use **`AI.APP.PRIMITIVE_CONSISTENCY`**.

## Related rules

- `DET.APP.PRIMITIVE_MARKERS` — governed hash, type, name, and `data-ks-react-root` on each visible primitive root.
- `DET.APP.PRIMITIVE_SOURCE` — repo scan ensures each `KS_REACT_PRIMITIVE` `.tsx` spreads `ksReactPrimitiveAttrs()` in source.
- `DET.APP.SHELL_INTEGRATION` — no Bootstrap alert/badge metaphors adjacent to governed react-primitive roots.
- `DET.APP.CONTROL_A11Y` — interactive primitives expose correct ARIA roles and keyboard behavior after styling hooks exist.
- `AI.APP.PRIMITIVE_CONSISTENCY` — judgment-heavy coherence across adjacent primitives on the same operator surface.
