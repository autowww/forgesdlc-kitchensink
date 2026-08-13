---
rule_id: DET.CTA.LABEL_NONEMPTY
lane: deterministic
title: CTA accessible names are non-empty
summary: Every visible button, link, and role=button/link control exposes at least one trimmed character of accessible name via visible text, aria-label, aria-labelledby, value/alt, or sr-only helper text.
page_version: 0cc9e7ee9238b539ceea42e469da1c7d549f7b6457010390c387c1c780f4ffcc
generated_at: 2026-05-19T21:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-cta-label_nonempty
---

## Purpose

Kitchen Sink heroes, cards, and doc chrome expose conversion and navigation through **`<a class="btn …">`**, **`<button>`**, **`input[type=button|submit|reset|image]`**, and elements with **`role="button"`** or **`role="link"`** (`components/components.py`, `components/layouts.py`). Screen readers, voice control, and the UX auditor all resolve an **accessible name** for each visible control. When that name is empty—icon-only markup with no `aria-label`, whitespace-only link text, or a submit input with no `value`—users cannot identify the action and automated checks flag a **major** accessibility defect.

This deterministic rule scans visible interactive controls in the metrics phase (`collectCtaLabelNonemptyReport`), requires at least **`MIN_CTA_LABEL_CHARS` (1)** trimmed character in the computed accessible name, and skips nested controls inside another interactive ancestor, hidden subtrees (`aria-hidden`, `display:none`), and inert nodes. Names may come from **`aria-label`**, **`aria-labelledby`**, visible text, **`title`** (when non-empty), **`input` value/alt**, descendant **`img[alt]`**, or **`.sr-only` / `.visually-hidden`** helper text.

**Plan:** Crawl hero, card footer, and mobile nav URLs. **Do:** Keep human-readable labels on every `.btn`; add `aria-label` for icon-only doc nav toggles. **Check:** `metrics.ctaLabelNonemptyReport.violations` is empty. **Adjust:** Replace placeholder-only CTAs and icon glyphs without names before tuning hierarchy or button-group caps.

## Passing signals

- **`landing-hero-actions__buttons`** anchors include visible text: **`btn btn-forge`** + **`btn btn-cyan-outline`** with labels such as “Start quickstart” and “Read docs”.
- Icon-only controls (mobile offcanvas opener, toolbar glyphs) set **`aria-label="Open navigation"`** (or equivalent) on the **`<button class="btn btn-forge …">`** itself.
- Card footers use **`<a class="btn btn-forge" href="…">Read the guide</a>`** or **`btn btn-forge-outline`** with non-empty link text—not bare icons.
- **`aria-labelledby`** points at visible heading or caption text when the control surface is minimal.
- **`input type="submit"`** / **`type="button"`** ship a non-empty **`value`**; **`type="image"`** includes meaningful **`alt`**.
- **`metrics.ctaLabelNonemptyReport`** reports `violations: []` after crawl; evidence does not contain `empty_accessible_name`.

## Failing signals

- **`kind: empty-accessible-name`** on a visible **`<a class="btn btn-forge" href="…">`** with no text, `aria-label`, or qualifying `aria-labelledby` reference.
- Icon-only **`<button class="btn btn-forge">`** containing only a decorative glyph span, with no `aria-label` and no `.sr-only` helper inside the control.
- Whitespace-only link text that normalizes to fewer than one character after trim.
- **`href="#"`** anchors counted as interactive only when **`role="button"`** or **`role="link"`** is set—still require a non-empty name when visible.
- Evidence strings like `empty_accessible_name tag="a"="a.btn-forge"` or `tag="button"="button.btn-forge"` with **major** severity.
- Page passes **`DET.CTA.HIERARCHY`** or **`DET.BUTTON.GROUP.MAX`** yet fails here because **naming**, not count or class role, is the gate.

## Before example

Failing KS markup: hero primary with no visible text and a mobile nav toggle with icon-only content—both resolve to an empty accessible name.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="cta-label-nonempty-fail"
>
  <button
    type="button"
    class="btn btn-forge position-fixed top-0 start-0 m-3 d-lg-none shadow"
    data-bs-toggle="offcanvas"
    data-bs-target="#docNavOffcanvas"
    aria-controls="docNavOffcanvas"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>
  </button>
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
            <a class="btn btn-forge" href="/quickstart"></a>
            <a class="btn btn-cyan-outline" href="/docs"> </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

## After example

Passing KS markup: same layout with `aria-label` on the icon control and visible hero button text.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="cta-label-nonempty-pass"
>
  <button
    type="button"
    class="btn btn-forge position-fixed top-0 start-0 m-3 d-lg-none shadow"
    data-bs-toggle="offcanvas"
    data-bs-target="#docNavOffcanvas"
    aria-controls="docNavOffcanvas"
    aria-label="Open navigation"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>
  </button>
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
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

## Evidence and remediation

**Evidence:** Auditor field **`metrics.ctaLabelNonemptyReport`** with `minLabelChars: 1`, `controlCount`, and `violations[]` (`kind: empty-accessible-name`, `tag`, `selectorHint`, optional `role` / `href`). Findings cite `empty_accessible_name` and the control hint (for example `a.btn-forge` or `button.btn-forge[@Ldg]`). Reproduce in DevTools by selecting each visible `.btn` / `button` and inspecting the accessibility tree name.

**Remediate (in order):**

1. Add **visible link or button text** to every hero and card CTA (`primary_cta_label`, `secondary_cta_label` in generators—never emit empty strings).
2. For **icon-only** controls, set **`aria-label`** on the interactive element (match `components/layouts.py`: `aria-label="Open navigation"`).
3. Prefer **`aria-labelledby`** when a visible heading already names the action; ensure referenced nodes are not `aria-hidden`.
4. For **`input type="submit"`** / **`type="button"`**, set a non-empty **`value`**; for **`type="image"`**, set meaningful **`alt`**.
5. Re-run `analyze-website-ux.mjs` metrics on affected URLs; reconcile with **`DET.CTA.HIERARCHY`** and **`AI.CREDIBILITY.NO_OVERCLAIM`** so labels stay specific, not generic filler.

## Related rules

- `DET.CTA.HIERARCHY` — one primary CTA class per logical viewport region (naming does not replace hierarchy).
- `DET.BUTTON.GROUP.MAX` — horizontal action count cap; retained buttons must still have names.
- `DET.CARD.ACTION_LIMIT` — per-card primary count; footer buttons and link-cards need non-empty labels.
- `DET.LANDMARKS.REQUIRED` — page-level landmarks complement control-level names.
- `AI.CREDIBILITY.NO_OVERCLAIM` — labels should be specific and truthful, not empty or vague placeholders.
