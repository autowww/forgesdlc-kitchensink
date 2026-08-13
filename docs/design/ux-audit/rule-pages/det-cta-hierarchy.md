---
rule_id: DET.CTA.HIERARCHY
lane: deterministic
title: Primary CTA hierarchy
summary: Each logical viewport region—hero, open modal or panel, sticky footer band—exposes at most one filled primary action; competing primaries demote to outline, text link, or disclosure.
page_version: 5c54f7ee8c8b49d2fb13b32a1cb1ac9abd50aecbda1219e125a4feab6ea96d7f
generated_at: 2026-05-19T22:00:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-cta-hierarchy
---

## Purpose

Kitchen Sink landing and product heroes (`components/components.py`, `css/forgesdlc-theme.css`) render conversion actions in **`landing-hero-actions`** with a **`landing-hero-actions__buttons`** row. The canonical pattern is **one** dominant **`btn btn-forge`** primary, an optional **`btn btn-cyan-outline`** secondary, and muted **`landing-hero-secondary-link`** text links below. When two or more filled primaries share the same hero, modal, or sticky footer band, scanners cannot tell which action the page wants them to take.

This deterministic rule scans **logical viewport regions** and counts **primary** action controls—`<a>`, `<button>`, `<input type="button|submit|reset">`, and `[role="button"]` whose classes include **`btn-forge`** or **`btn-primary`**. Outline and low-emphasis styles (`btn-forge-outline`, `btn-cyan-outline`, `btn-outline`, `btn-secondary`, `btn-link`) are **not** primaries. The cap is **one primary per region** (`MAX_PRIMARY_CTAS_PER_REGION = 1`). Regions include:

| Region | Typical KS selectors |
|--------|----------------------|
| Hero | `.landing-hero-wide`, `.landing-hero-grid-wrap`, `.landing-hero`, `.product-hero`, `main .hero` |
| Modal / panel | `.modal.show`, `.offcanvas.show`, `#diagramModal`, `#topicPreviewModal`, `[role="dialog"][aria-modal="true"]` |
| Sticky footer | `.fixed-bottom`, `.sticky-bottom`, `[class*="sticky-footer"]`, `[class*="sticky-cta"]`, fixed/sticky bands pinned to the viewport bottom |

Navigation, pagination, breadcrumbs, dropdown menus, tab lists, and cookie banners are excluded from region scans.

**Plan:** Inventory hero, modal, and sticky-footer bands for duplicate **`btn-forge`** / **`btn-primary`** siblings. **Do:** Keep one filled primary; demote extras to **`btn-cyan-outline`**, **`landing-hero-secondary-link`**, or a disclosure. **Check:** Confirm `metrics.ctaHierarchyReport` has no violations. **Adjust:** When marketing adds a second primary, move the alternate path below the fold or into secondary links instead of matching visual weight.

## Passing signals

- **`landing-hero-actions__buttons`** contains **exactly one** visible **`btn btn-forge`** (or **`btn-primary`**) plus optional **`btn btn-cyan-outline`** or **`btn btn-forge-outline`** secondaries.
- Additional destinations use **`landing-hero-secondary-links`** with **`landing-hero-secondary-link`** anchors—not counted as primaries.
- Open modals and offcanvas panels expose **one** filled primary in the footer or body action row; cancel/close uses outline or link styling.
- Sticky footer bands (`.fixed-bottom`, `[class*="sticky-cta"]`) show **one** filled primary; companion actions use outline or text links.
- **`metrics.ctaHierarchyReport`** reports `maxAllowed: 1`, `violations: []`, and scanned regions with `primaryCount ≤ 1`.

## Failing signals

- **`landing-hero-actions__buttons`** shows **two or more** sibling **`btn-forge`** or **`btn-primary`** links (auditor reports `primary_ctas=2` or higher in the **hero region**, **major** severity; **critical** when count exceeds `maxAllowed + 1`).
- Product heroes (`.product-hero`) stack multiple filled primaries—e.g. "Start quickstart" and "Book demo" both on **`btn-forge`**—with no outline demotion.
- An open **`.modal.show`** or **`#diagramModal`** footer renders two filled submit/confirm buttons.
- A **sticky footer band** (`.fixed-bottom`, `[class*="sticky-footer"]`) exposes two filled primaries such as "Subscribe" and "Contact sales".
- Evidence strings include `region=hero primary_ctas=N max=1`, `selectorHint` pointing at `div.landing-hero…`, and `labels="Get started | Start trial | …"`.
- Page may pass **`DET.BUTTON.GROUP.MAX`** (≤ 3 horizontal actions) yet still fail here because **primary class role**, not total button count, is the gate.

## Before example

Failing KS markup: two filled **`btn-forge`** primaries in the same **`landing-hero`** region—competing conversion paths at equal weight.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="cta-hierarchy-fail"
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
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

## After example

Passing KS markup: one **`btn-forge`** primary, one outline secondary, and muted text links for alternate paths—the canonical KS hero CTA stack.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="cta-hierarchy-pass"
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
            <a class="landing-hero-secondary-link" href="/demo">Book demo</a>
            <span class="landing-hero-secondary-sep" aria-hidden="true">·</span>
            <a class="landing-hero-secondary-link" href="/trust">Trust model</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

## Evidence and remediation

**Evidence:** Auditor field **`metrics.ctaHierarchyReport`** with `maxAllowed: 1` and `violations[]` entries (`kind: too-many-primary-ctas`, `region`, `primaryCount`, `selectorHint`, `labels`). Findings cite `region=hero|modal|stickyFooter`, `primary_ctas=N max=1`, and the offending region root. Reproduce in DevTools by selecting `.landing-hero-actions__buttons` (or an open `.modal.show` footer) and counting visible elements with **`btn-forge`** or **`btn-primary`** that are not outline variants.

**Remediate (in order):**

1. Pick **one** story-aligned primary path; keep a single **`btn btn-forge`** (or **`btn-primary`**) in each hero, modal, and sticky band.
2. Demote competing primaries to **`btn btn-cyan-outline`**, **`btn btn-forge-outline`**, or **`landing-hero-secondary-link`** text links.
3. For modals and offcanvas panels, use one filled confirm/submit and an outline cancel—not two filled actions.
4. For sticky footer bands, collapse to one filled primary; move secondary paths into a menu or link row.
5. Reconcile with **`DET.BUTTON.GROUP.MAX`** so the horizontal row stays ≤ 3 visible actions after demotion.
6. Re-run `analyze-website-ux.mjs` metrics on hero and modal URLs; align homepage budgets with **`DET.CONTEXT.BURDEN`**.

## Related rules

- `DET.BUTTON.GROUP.MAX` — horizontal action count cap (complements primary-class hierarchy).
- `DET.CTA.LABEL_NONEMPTY` — every retained button/link has an accessible name.
- `DET.CONTEXT.BURDEN` — first-screen interactive control budget on home/landing pages.
- `DET.CARD.ACTION_LIMIT` — per-card footer primary count (card scope, not hero band).
- `AI.VISUAL.HIERARCHY` — judgment when pages pass class rules but tiles and accents still compete at equal volume.
