---
rule_id: DET.BUTTON.GROUP.MAX
lane: deterministic
title: Horizontal button group cap
summary: Horizontal CTA and toolbar clusters expose at most three visible actions before overflow or disclosure; extras belong in menus, secondary links, or follow-on sections.
page_version: deeade550dd6b0bb8987b0b16d7952b8861123ca79a4a809e802a5c6b4179d3e
generated_at: 2026-05-19T20:15:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-button-group-max
---

## Purpose

Kitchen Sink landing and product heroes render conversion actions in **`landing-hero-actions`** with a **`landing-hero-actions__buttons`** flex row (`components/components.py`, `css/forgesdlc-theme.css`). When four or five filled buttons sit side by side, scanners cannot pick a primary path and touch targets crowd on mobile.

This deterministic rule counts **visible horizontal action controls**—`<button>`, `input[type=button|submit|reset]`, `[role="button"]`, and `<a class="btn …">`—inside known group containers (`.landing-hero-actions`, `.btn-group`, `.btn-toolbar`, `[class*="hero-actions"]`, `[class*="cta-row"]`, `[role="group"]`, and flex-row clusters in `main`). The default cap is **three** (`MAX_VISIBLE_HORIZONTAL_ACTIONS`). Navigation, pagination, tab lists, dropdown menus, and cookie banners are excluded.

**Plan:** Inventory first-screen horizontal button rows on landing and product pages. **Do:** Keep one **`btn btn-forge`** primary and one **`btn-cyan-outline`** secondary; demote extras to **`landing-hero-secondary-link`** text links or a "More" disclosure. **Check:** Run the auditor metrics phase or confirm `buttonGroupMaxReport` has no violations. **Adjust:** When marketing keeps adding CTAs, move depth links below the fold instead of widening the hero row.

## Passing signals

- **`landing-hero-actions__buttons`** contains **≤ 3** visible horizontal actions (typical pattern: **`btn btn-forge`** + **`btn btn-cyan-outline`**, optional low-emphasis **`btn btn-forge-outline`**).
- Additional destinations use **`landing-hero-secondary-links`** with **`landing-hero-secondary-link`** anchors (not counted as button actions).
- Toolbar-style clusters use Bootstrap **`.btn-group`** / **`.btn-toolbar`** with at most three visible controls, or overflow behind a single menu trigger.
- Flex-row action rows in `main` (`.d-flex`, `.flex-row`, `[class*="flex-row"]`) respect the same cap when actions align on one horizontal baseline.
- Violation severity stays absent in **`metrics.buttonGroupMaxReport`** (`groupCount: 0`).

## Failing signals

- **`landing-hero-actions__buttons`** shows **four or more** sibling `.btn` links or buttons on one horizontal line (auditor reports `visible_actions=4` or higher, **major**; **critical** when count exceeds `maxAllowed + 1`).
- Product or marketing heroes stack **multiple filled primaries** (`btn-forge`, `btn-warning`, `btn-success`) with no demotion to outline or text links.
- Custom **`[class*="cta-row"]`** or **`[class*="__actions"]`** wrappers repeat the same overcrowding outside the landing helper.
- Evidence strings include `group=".landing-hero-actions__buttons"` or `selectorHint` pointing at a flex container with `labels="Start | Docs | API | Pricing | …"`.
- Page passes **`DET.CTA.HIERARCHY`** (one primary class) yet still fails this rule because **count**, not class role, is the gate.

## Before example

Failing KS markup: five horizontal `.btn` actions in the canonical hero actions row—exceeds the cap of three.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="button-group-max-fail"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="row align-items-center g-4 landing-hero-grid">
      <div class="col-12 col-xl-7 landing-hero-copy text-center text-xl-start">
        <h1 class="font-display forge-gradient-text product-landing-title mb-3">
          Governed human + agent delivery
        </h1>
        <p class="forge-support landing-hero-tagline mb-4">
          One methodology spine from intent to evidence.
        </p>
        <div class="landing-hero-actions">
          <p
            class="landing-hero-actions__buttons d-flex flex-wrap gap-2 align-items-center justify-content-center justify-content-xl-start mb-3 mb-md-2"
          >
            <a class="btn btn-forge" href="/quickstart">Start quickstart</a>
            <a class="btn btn-forge" href="/demo">Book demo</a>
            <a class="btn btn-cyan-outline" href="/docs">Read docs</a>
            <a class="btn btn-forge-outline" href="/trust">Trust model</a>
            <a class="btn btn-warning" href="/pricing">See pricing</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

## After example

Passing KS markup: two button actions plus muted secondary links—same destinations, within the horizontal action budget.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="button-group-max-pass"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="row align-items-center g-4 landing-hero-grid">
      <div class="col-12 col-xl-7 landing-hero-copy text-center text-xl-start">
        <h1 class="font-display forge-gradient-text product-landing-title mb-3">
          Governed human + agent delivery
        </h1>
        <p class="forge-support landing-hero-tagline mb-4">
          One methodology spine from intent to evidence.
        </p>
        <div class="landing-hero-actions">
          <p
            class="landing-hero-actions__buttons d-flex flex-wrap gap-2 align-items-center justify-content-center justify-content-xl-start mb-3 mb-md-2"
          >
            <a class="btn btn-forge" href="/quickstart">Start quickstart</a>
            <a class="btn btn-cyan-outline" href="/docs">Read docs</a>
          </p>
          <p class="landing-hero-secondary-links forge-support text-muted mb-0">
            <a class="landing-hero-secondary-link" href="/trust">Trust model</a>
            <span class="landing-hero-secondary-sep" aria-hidden="true">·</span>
            <a class="landing-hero-secondary-link" href="/pricing">Pricing</a>
            <span class="landing-hero-secondary-sep" aria-hidden="true">·</span>
            <a class="landing-hero-secondary-link" href="/demo">Book demo</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

## Evidence and remediation

**Evidence:** Auditor field **`metrics.buttonGroupMaxReport`** with `maxAllowed: 3` and `violations[]` entries (`kind: too-many-actions`, `actionCount`, `selectorHint`, `labels`). Findings cite `visible_actions=N max=3` and the offending group class. Reproduce in DevTools by selecting `.landing-hero-actions__buttons` and counting visible `.btn` / `button` siblings on one row.

**Remediate (in order):**

1. Collapse the hero row to **one** **`btn-forge`** primary and **one** **`btn-cyan-outline`** (or **`btn-forge-outline`**) secondary; add a third button only when it is clearly low-emphasis.
2. Move pricing, trust, demo, and docs paths into **`landing-hero-secondary-links`** or a follow-on **`forge-section`** band.
3. For toolbars, use a single "More" / dropdown trigger instead of a fourth visible `.btn` in **`.btn-group`**.
4. Reconcile with **`DET.CTA.HIERARCHY`** so one primary class remains dominant after count reduction.
5. Re-run `analyze-website-ux.mjs` metrics on hero URLs; align homepage budgets with **`DET.CONTEXT.BURDEN`** (hero-fold interactive controls ≤ 3).

## Related rules

- `DET.CTA.HIERARCHY` — one primary CTA class per logical viewport region (complements count caps).
- `DET.CTA.LABEL_NONEMPTY` — every retained button/link has an accessible name.
- `DET.CONTEXT.BURDEN` — first-screen interactive control budget on home/landing pages.
- `DET.CARD.ACTION_LIMIT` — per-card footer action count (card scope, not hero row).
- `AI.VISUAL.HIERARCHY` — judgment when buttons pass count checks but still compete at equal visual weight.
