---
rule_id: DET.PY.OPTIONAL_REGIONS
lane: deterministic
title: Python optional regions
summary: Optional Python-rendered slots (announcements, breadcrumbs, listing sidebars, mega-footer strips) must omit or collapse when empty—no visible ghost headings or empty chrome shells.
page_version: 855a50dba569006c705edcf7d346e6220f908e672ab7a26044839f3e45a69106
generated_at: 2026-05-29T12:00:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-py-optional_regions
related_rules:
  - DET.PY.KS_HASH_ATTRS
  - DET.SECTION.HEADING
  - DET.SECTION.SINGLE_JOB
  - DET.HTML.EMPTY_INLINE
  - AI.PY.HTML_AUTHORING_QUALITY
---

## Purpose

Kitchen Sink Python generators (`components/layouts.py` **`landing_page`** / **`product_page`**, `components/enterprise_marketing.py` **`render_listing_shell`** / **`render_mega_footer`**, handbook chrome in `components/components.py`) emit **optional** regions: site announcements, doc breadcrumbs, listing filter sidebars, and mega-footer brand/legal/bottom strips. When the caller passes blank HTML or omits link columns, the renderer must **return an empty string** or emit a **collapsed** subtree (height ≤ 8px, `display: none`, or `hidden`) so crawlers do not surface headings, labels, or padding with no substantive body.

This deterministic rule runs in the **metrics** phase via Playwright (`det-py-optional-regions.check.js`). It scans known optional slot selectors—`[data-ks-optional]`, **`.fs-site-announcement`**, **`.ks-doc-breadcrumb`**, **`.fs-listing-shell__sidebar`**, **`.fs-mega-footer__brand`**, **`.fs-mega-footer__legal`**, **`.fs-mega-footer__bottom`**, and mega-footer grid columns—and classifies two violation kinds:

- **`ghost-heading`** — visible slot height > 8px, heading/label text ≥ 2 characters, body text < 3 characters, and no qualifying body nodes (`p`, lists, links, cards, forms, etc.).
- **`empty-visible-slot`** — visible slot with height ≥ 8px but no heading text and no substantive body.

**Plan:** Trace optional kwargs (`announcement_html`, `sidebar_html`, footer columns) from site generators to layout helpers. **Do:** Guard with `.strip()` checks before emitting wrappers (see `landing_page` announcement guard and `render_listing_shell` single-column path). **Check:** `metrics.optionalRegionsReport.violations` is empty after `analyze-website-ux.mjs`. **Adjust:** Pair with **`AI.PY.HTML_AUTHORING_QUALITY`** when the same empty-slot pattern repeats across page types.

## Passing signals

- **`landing_page`** / **`product_page`**: `announcement_html.strip()` is falsy → no **`.fs-site-announcement`** block; when populated, announcement inner HTML includes body copy (not a lone **`<h2 class="h6">`**).
- **`render_listing_shell`**: empty `sidebar_html` → **`fs-listing-shell--single`** layout without **`.fs-listing-shell__sidebar`**; non-empty sidebar includes filter controls or links inside **`fs-listing-shell__main`** companion column.
- **`render_mega_footer`**: all of `columns`, `brand_line_html`, `legal_html`, and `bottom_html` empty → returns `""` (no **`.fs-mega-footer`**); each grid column has links when **`.fs-mega-footer__col-title`** is present.
- Optional slots marked **`data-ks-optional="true"`** are omitted from the DOM or hidden with zero visible height when content is blank.
- **`metrics.optionalRegionsReport`**: `{ optionalSlotCount: N, violations: [] }` on audited URLs.
- Collapsed announcement or sidebar subtrees have **`getBoundingClientRect().height` ≤ 8** (passes without a finding).
- Populated optional regions include ≥ 3 characters of non-heading body or at least one visible body node matching **`BODY_CONTENT_SELECTOR`**.

## Failing signals

- **`optional_region_ghost-heading`** — **`.fs-site-announcement`** shows **"Release notes"** (or **`.section-label`**) with no paragraph, link, or card underneath (**warn**, information architecture).
- **`optional_region_ghost-heading`** on **`listing-sidebar`**: **`.fs-listing-shell__sidebar`** renders **`.fs-listing-shell__sidebar-title`** ("Filters") but no filter controls, links, or form fields.
- **`optional_region_ghost-heading`** on **`mega-footer-column`**: **`.fs-mega-footer__col-title`** with zero **`.fs-mega-footer__list a[href]`** in the same column.
- **`optional_region_empty-visible-slot`** — empty **`.fs-site-announcement`** or **`.fs-mega-footer__legal`** wrapper still occupies vertical space (padding/border) without text.
- **`ks-doc-breadcrumb`** present with visible height but no trail links (handbook pages that always emit breadcrumb chrome).
- Findings cap at **`MAX_OPTIONAL_REGION_FINDINGS` (8)** with trailing "additional issues omitted" when many slots fail.
- Page may still pass **`DET.SECTION.HEADING`** while failing here—outline order is independent of optional-slot emptiness.
- Passing this rule does **not** prove hash governance (**`DET.PY.KS_HASH_ATTRS`**) or non-empty inline emphasis (**`DET.HTML.EMPTY_INLINE`**).

## Before example

Failing marketing landing fragment: Python emitted announcement and filter sidebar shells with labels but no body (typical unguarded `announcement_html` / `sidebar_html` kwargs).

```html
<div class="fs-landing">
  <div class="fs-site-announcement" role="region" aria-label="Site announcement">
    <h2 class="h6 mb-0">Release notes</h2>
  </div>
  <header class="landing-header">
    <nav class="navbar navbar-expand-lg landing-header-navbar py-0">
      <div class="container-fluid landing-header-inner px-3 px-xxl-5">
        <a class="navbar-brand fs-brand text-decoration-none mb-0" href="/">Forge SDLC</a>
      </div>
    </nav>
  </header>
  <main id="main" class="fs-landing-main">
    <section class="landing-hero fs-landing-hero-band">
      <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
        <div class="landing-hero-grid-wrap">
          <div class="row align-items-center g-4 landing-hero-grid">
            <div class="col-12 col-xl-7 landing-hero-copy">
              <p class="landing-hero-kicker mb-0">Methodology</p>
              <h1 class="font-display landing-hero-title mb-3">Governed delivery</h1>
              <p class="forge-support landing-hero-tagline mb-2">
                Human-owned intent with agent-ready execution.
              </p>
              <div class="landing-hero-actions">
                <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 mb-0">
                  <a class="btn btn-forge" href="/start/">Get started</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="fs-landing-body-shell">
      <div class="fs-listing-shell">
        <div class="row g-4 align-items-start">
          <aside class="col-lg-3 fs-listing-shell__sidebar" role="complementary" aria-label="Filters">
            <p class="fs-listing-shell__sidebar-title text-uppercase small mb-3">Filters</p>
          </aside>
          <div class="col-lg-9 fs-listing-shell__main">
            <div class="forge-card p-4">
              <p class="forge-support mb-0">Listing renders, but filter column is a ghost shell.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <footer class="fs-mega-footer" data-fs-section="mega-footer">
    <div class="fs-mega-footer__inner">
      <div class="row g-4 g-lg-5 fs-mega-footer__grid">
        <div class="col-6 col-md-4 col-lg">
          <p class="fs-mega-footer__col-title">Resources</p>
          <ul class="fs-mega-footer__list list-unstyled mb-0"></ul>
        </div>
      </div>
    </div>
  </footer>
</div>
```

## After example

Passing landing: optional slots omitted or fully populated (aligned with `layouts.landing_page` announcement guard and `enterprise_marketing.render_listing_shell` / `render_mega_footer` empty checks).

```html
<div class="fs-landing">
  <header class="landing-header">
    <nav class="navbar navbar-expand-lg landing-header-navbar py-0">
      <div class="container-fluid landing-header-inner px-3 px-xxl-5">
        <a class="navbar-brand fs-brand text-decoration-none mb-0" href="/">Forge SDLC</a>
      </div>
    </nav>
  </header>
  <main id="main" class="fs-landing-main">
    <section class="landing-hero fs-landing-hero-band">
      <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
        <div class="landing-hero-grid-wrap">
          <div class="row align-items-center g-4 landing-hero-grid">
            <div class="col-12 col-xl-7 landing-hero-copy">
              <p class="landing-hero-kicker mb-0">Methodology</p>
              <h1 class="font-display landing-hero-title mb-3">Governed delivery</h1>
              <p class="forge-support landing-hero-tagline mb-2">
                Human-owned intent with agent-ready execution.
              </p>
              <div class="landing-hero-actions">
                <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 mb-0">
                  <a class="btn btn-forge" href="/start/">Get started</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="fs-landing-body-shell">
      <div class="fs-listing-shell fs-listing-shell--single">
        <div class="fs-listing-shell__main">
          <div class="forge-card p-4">
            <h2 class="h4 mb-2">Practice catalog</h2>
            <p class="forge-support mb-3">
              No filter sidebar—empty <code>sidebar_html</code> omits the complementary column.
            </p>
            <a class="btn btn-outline-forge btn-sm" href="/docs/">Browse docs</a>
          </div>
        </div>
      </div>
    </div>
  </main>
  <footer class="fs-mega-footer" data-fs-section="mega-footer">
    <div class="fs-mega-footer__inner">
      <div class="fs-mega-footer__brand mb-4">
        <p class="forge-support mb-0">Forge SDLC — governed human + agent delivery.</p>
      </div>
      <div class="row g-4 g-lg-5 fs-mega-footer__grid">
        <div class="col-6 col-md-4 col-lg">
          <p class="fs-mega-footer__col-title">Resources</p>
          <ul class="fs-mega-footer__list list-unstyled mb-0">
            <li class="fs-mega-footer__item">
              <a class="fs-mega-footer__link" href="/docs/">Documentation</a>
            </li>
            <li class="fs-mega-footer__item">
              <a class="fs-mega-footer__link" href="/showcase/">Showcase</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="fs-mega-footer__legal mt-4 pt-3">
        <p class="small text-muted mb-0">© Forge SDLC. Methodology content is guidance, not certification.</p>
      </div>
    </div>
  </footer>
</div>
```

When a promo strip is required, populate **`announcement_html`** with body copy—not a heading alone:

```html
<div class="fs-site-announcement" role="region" aria-label="Site announcement">
  <p class="mb-0 forge-support">
    <strong>New:</strong> Visual catalog contracts now ship with every showcase hash.
    <a href="/showcase/design-catalog.html">View catalog</a>
  </p>
</div>
```

## Evidence and remediation

1. **Detect:** Run `node tools/website-ux-auditor/analyze-website-ux.mjs --repo <site-root> --url <page>` and inspect `metrics.optionalRegionsReport.violations` (kinds `ghost-heading` / `empty-visible-slot`, `selectorHint`, `headingChars`, `bodyChars`, `height`).
2. **Reproduce locally:** `python3 generator/build_rule_defect_fixtures.py` then `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.PY.OPTIONAL_REGIONS`.
3. **Fix Python emitters:**
   - Guard **`announcement_html`** with `.strip()` before emitting **`.fs-site-announcement`** (`components/layouts.py` **`landing_page`** / **`product_page`**).
   - Route empty listing filters through **`render_listing_shell(..., sidebar_html="")`** so **`fs-listing-shell--single`** is used.
   - Skip mega-footer columns without links; return `""` from **`render_mega_footer`** when all optional strips are blank.
   - Add **`data-ks-optional="true"`** on optional roots when the catalog contract requires explicit slot marking.
4. **Verify:** Rebuild (`python3 generator/build-showcase.py` or consumer site generator), re-audit until `violations` is empty; confirm no new **`DET.SECTION.HEADING`** or **`DET.HTML.EMPTY_INLINE`** regressions on the same pages.
5. **Pilot fixer:** `DET.PY.OPTIONAL_REGIONS` is listed in `lib/ux-deterministic-fixers/pilot-registry.json` (repo-production scaffold for `forge-autodoc/forge_autodoc/optional_regions.py`).

Thresholds from the check module: **`MIN_SLOT_BODY_CHARS = 3`**, **`MIN_HEADING_CHARS = 2`**, **`MIN_VISIBLE_SLOT_HEIGHT = 8`**.

## Related rules

- `DET.PY.KS_HASH_ATTRS` — optional regions that remain should still use `ks_hash_attrs` / `chrome_region_attrs` on governed roots.
- `DET.SECTION.HEADING` — populated optional slots must not introduce skipped heading levels in the main outline.
- `DET.SECTION.SINGLE_JOB` — omit empty promo/sidebar shells so each visible section keeps one clear job.
- `DET.HTML.EMPTY_INLINE` — do not leave empty `<strong>` / `<em>` placeholders inside optional slot bodies.
- `AI.PY.HTML_AUTHORING_QUALITY` — judgment review when optional-slot guards are correct but page narrative still feels hollow or redundant.
