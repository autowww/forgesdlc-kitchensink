---
rule_id: DET.SECTION.HEADING
lane: deterministic
title: Section heading and document outline
summary: Each major section or article exposes one primary heading (h2–h6 or aria-labelledby), and visible heading levels advance sequentially without skipped ranks.
page_version: 39a8f3db87bd1379afac33e0bfeb9cf8aa9943e5b55dc22fa884319a9a4ba840
generated_at: 2026-05-29T12:00:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-section-heading
related_rules:
  - DET.SECTION.SINGLE_JOB
  - DET.PROSE.LENGTH
  - DET.LANDMARKS.REQUIRED
  - DET.LAYOUT.GRID_CONSISTENCY
  - DET.NAV.IN_PAGE_TOC
  - DET.PY.OPTIONAL_REGIONS
  - DET.HTML.EMPTY_INLINE
  - AI.NARRATIVE.COHERENCE
  - AI.CONTEXT.COGNITIVE_CLARITY
  - AI.VISUAL.HIERARCHY
---

## Purpose

Forge landing pages, handbook chapters, and showcase docs are built from **`main#main`** bands of **`section`** / **`article`** shells (`forge-section`, `ks-section`, `fs-landing-section`) separated by **`font-display`** titles and **`section-label`** eyebrows. Screen-reader users and in-page TOC scripts both depend on a **named section** and a **coherent outline**: one primary title per major block, then nested subheads that do not skip ranks (for example `h2` then `h4` without an intervening `h3`).

This deterministic rule runs in the **metrics** phase (`det-section-heading.check.js`). With Playwright it builds `sectionHeadingReport` by scanning visible `section` and `article` nodes inside `main` and the document heading outline in reading order. A block counts as a **major section** when it has at least **45 visible words** or height **≥ 48px** (`MIN_MAJOR_SECTION_WORDS`, `MIN_MAJOR_SECTION_HEIGHT_PX`). Chrome inside `nav`, `.forge-toc`, `.ks-doc-toc`, `aside.forge-sidebar`, `#ks-sidebar-aside`, `.fs-sidebar`, `footer`, and cookie banners is excluded from both section scans and outline walks. Platform handbook **inner** doc URLs (`siteKind: platform` with inner paths) are skipped entirely.

**Plan:** Crawl product and handbook URLs; list `sectionHeadingReport.sections` and outline jumps. **Do:** Add one `h2`–`h4` (or `aria-labelledby` on visible title text) at the top of each major `forge-section`; keep page `h1` unique; demote card titles to `h3+` inside nested blocks. **Check:** `violations` is empty and `findingsFromSectionHeadingReport` returns no rows (cap **8** findings per page). **Adjust:** Fix Python emitters (`components/layouts.py`, `marketing_sections.py`) or consumer Markdown before re-running `analyze-website-ux.mjs`.

## Passing signals

- Each major **`section.forge-section.ks-section`** (or **`article`**) with ≥ 45 words exposes exactly **one** primary heading (`h2`–`h6` or `[role="heading"]`) at the section root—not only a **`p.section-label`** eyebrow.
- Page hero uses a single **`h1.font-display`** (handbook `handbook_page`, landing `product_page`); band titles use **`h2`** / **`h3`** with Bootstrap scale classes (`h4`, `h5`, `h6`) without skipping a rank in DOM order.
- Nested **`article`** / inner **`section`** headings do not satisfy the parent section’s primary-heading count (headings inside a child `section`/`article` are ignored for the parent).
- Regions without a literal heading may pass via **`aria-labelledby`** pointing at visible title text (≥ 2 characters).
- Document outline in `main` advances sequentially (`h1` → `h2` → `h3`); no `skipped-heading-level` between visible headings.
- `metrics.sectionHeadingReport` reports `primaryHeadingCount: 1` for long mechanism, trust, and outcome bands; `outlineHeadings` sorts by viewport `top` without rank gaps.
- Generic product and handbook URLs are in scope; platform inner handbook paths intentionally return no findings.

## Failing signals

- **`missing-section-heading`:** A major `section` / `article` has **no** primary heading—only body copy and optional **`p.section-label`**—evidence `missing_section_heading section="section.forge-section" words=90`. Severity **minor** (`defaultSeverity: minor` for this kind).
- **`duplicate-section-heading`:** One major section exposes **two or more** primary headings at the same depth—evidence `duplicate_section_heading section="section.cards" primary_headings=2`. Severity **major**.
- **`skipped-heading-level`:** Visible outline jumps ranks (for example `h1` then `h3`, or `h2` then `h4`)—evidence `skipped_heading_level h2→h4 text="Trust" top=400`. Severity **major**.
- Stylized **`p.card-label`** or bold **`span`** text used as the only “title” for a long band (not counted as a heading).
- Two competing **`h2.font-display`** siblings at the top of one **`forge-section`** (duplicate primary headings).
- Headings inside excluded chrome (sidebar TOC, `.forge-toc`) do not fix a missing title in `main` content.
- Page may pass **`DET.LAYOUT.GRID_CONSISTENCY`** yet still fail here when sections lack scan labels or the outline confuses assistive-tech navigation.

## Before example

Failing KS markup: a long mechanism band has only a **`section-label`** paragraph (no `h2`), and the page outline skips from **`h2`** to **`h4`**—triggers `missing-section-heading` and `skipped-heading-level`.

```html
<main id="main" class="doc-main px-4 py-4">
  <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
    <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed delivery</h1>
    <p class="forge-support mt-2 mb-0">Human-owned, agent-executed software delivery.</p>
  </header>
  <section class="forge-section ks-section" id="mechanism">
    <p class="section-label text-cyan mb-2">Mechanism</p>
    <p class="forge-support mb-0">
      Teams delegate more work to agents but still need clear intent, review gates, and evidence on every release.
      Forge structures intent, workspace visibility, governed reasoning, and controlled execution so operators can audit
      outcomes without turning the landing page into a handbook dump or hiding the primary section title from assistive tech.
    </p>
  </section>
  <section class="forge-section ks-section" id="outcomes">
    <h2 class="h4 font-display mb-3">Outcomes</h2>
    <h4 class="h6 mb-2">Evidence trail</h4>
    <p class="forge-support mb-0">Outline jumps from h2 to h4 without an h3 subheading for this band.</p>
  </section>
</main>
```

## After example

Passing KS markup: each major band has one section title; outline steps **`h2`** then **`h3`** under the same `forge-section` pattern used in layouts and marketing sections.

```html
<main id="main" class="doc-main px-4 py-4">
  <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
    <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed delivery</h1>
    <p class="forge-support mt-2 mb-0">Human-owned, agent-executed software delivery.</p>
  </header>
  <section class="forge-section ks-section" id="mechanism">
    <p class="section-label text-cyan mb-2">Mechanism</p>
    <h2 class="h4 font-display mb-3">How Forge structures work</h2>
    <p class="forge-support mb-0">
      Shape intent, delegate safely, and release with reviewable evidence across methodology, workspace visibility,
      and controlled execution.
    </p>
  </section>
  <section class="forge-section ks-section" id="outcomes">
    <p class="section-label text-cyan mb-2">Outcomes</p>
    <h2 class="h4 font-display mb-3">What teams gain</h2>
    <h3 class="h5 mb-2">Evidence trail</h3>
    <p class="forge-support mb-0">Sequential heading ranks match the visual hierarchy and feed in-page TOC anchors.</p>
  </section>
</main>
```

## Evidence and remediation

1. **Collect:** Run `analyze-website-ux.mjs` on the target site or open `metrics.sectionHeadingReport` / `sectionHeadingReport.violations` from the ruleset harness (`auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.SECTION.HEADING`). Defect fixture: `det-section-heading-fail.html` (skipped `h1`→`h3` in `main`).
2. **Missing section heading:** Insert `<h2 class="h4 font-display mb-3">…</h2>` immediately after the `section-label` (or set `aria-labelledby` on the `section` pointing at visible title `id`). Pilot fixer `patchSectionHeading` prepends `<h2 class="font-display mt-4">Section</h2>` only when automation is enabled—prefer authored titles in `components/` or generator output.
3. **Duplicate primary heading:** Keep one `h2` per major `forge-section`; demote card grid titles to `h3` / `h5` inside `.forge-card` cells, or split content into separate `section` shells.
4. **Skipped rank:** Renumber headings so each step increases by one (`h2` → `h3` → `h4`); do not rely on CSS class size alone (`h4` on an `h2` element is fine if the tag rank is sequential).
5. **Verify:** Rebuild affected HTML (`python3 generator/build-showcase.py` or consumer `build-site.py` / `build-handbook.py`), re-audit until violations are empty; confirm **`DET.NAV.IN_PAGE_TOC`** and **`DET.SECTION.SINGLE_JOB`** still pass on the same URLs.

## Related rules

- `DET.SECTION.SINGLE_JOB` — one coherent topic per section; heading clarity supports single-job bands.
- `DET.PROSE.LENGTH` — long prose blocks often need section breaks with visible titles.
- `DET.LANDMARKS.REQUIRED` — `main` landmark must exist before section heading scans apply.
- `DET.LAYOUT.GRID_CONSISTENCY` — section titles should align with the same content grid as body copy.
- `DET.NAV.IN_PAGE_TOC` — stable heading ladder and ids feed handbook TOC generation.
- `DET.PY.OPTIONAL_REGIONS` — populated optional slots must not introduce skipped levels in `main`.
- `DET.HTML.EMPTY_INLINE` — empty emphasis nodes are separate from heading structure but often co-occur in autodoc tables.
- `AI.NARRATIVE.COHERENCE` — judgment on whether section titles match the story arc.
- `AI.CONTEXT.COGNITIVE_CLARITY` — subjective scan burden when headings are vague or duplicated.
- `AI.VISUAL.HIERARCHY` — visual weight of display headings versus body support copy.
