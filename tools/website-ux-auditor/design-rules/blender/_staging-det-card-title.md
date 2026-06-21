---
rule_id: DET.CARD.TITLE
lane: deterministic
title: Card accessible title
summary: Every Kitchen Sink card root exposes a visible title (heading or .card-title) or an equivalent accessible name via aria-labelledby or aria-label.
page_version: 1b57231fd335f5339a55c23d0043aeed82a476b154e29f86cdca2d5f37c3eefa
generated_at: 2026-05-28T16:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-card-title
related_rules:
  - DET.CARD.ACTION_LIMIT
  - DET.CTA.LABEL_NONEMPTY
  - AI.VISUAL.PRODUCT_EXPLANATORY_VALUE
  - AI.PREMIUM.ENTERPRISE_FEEL
---

## Purpose

Outcome and feature tiles in Kitchen Sink use **`.forge-card`** (often with **`.breathe-link`** or **`.breathe-static`**, sometimes **`.card-amber`**) and Bootstrap **`.card`** shells in handbook layouts. Screen-reader users and sighted scanners both need a **named card**: a short label that states what the tile is about before body copy or actions.

This deterministic rule scans card roots (`.forge-card`, `.card`, `[data-card]`, `preview-card` and other `*-card` preview shells) and requires at least **two characters** of visible title text (`MIN_CARD_TITLE_CHARS = 2`) from:

- Headings **`h1`–`h6`** inside the card (not inside a nested card),
- **`.card-title`**, **`.card-label`**, or `[class*="card-title"]`,
- **`[role="heading"]`** with visible text,
- **`aria-label`** on the card root, or
- **`aria-labelledby`** pointing at visible title text elsewhere.

**Excluded:** cards inside global nav, pagination, breadcrumbs, menus, cookie banners, and **toolbar cards** (`data-card-kind="toolbar"`, `data-ks-type` / `data-ks-name` containing `toolbar`, `.toolbar-card` / `.card-toolbar`, or `[role="toolbar"]` / `.btn-toolbar` descendants).

**Plan:** Inventory card grids on landing and handbook pages. **Do:** Add a heading or `.card-label` + title pair in every `.forge-card` cell. **Check:** Run the auditor metrics phase (`cardTitleReport`) or spot-check with the accessibility tree. **Adjust:** When icons carry meaning, wire `aria-labelledby` instead of leaving only decorative body copy.

## Passing signals

- **`.forge-card.breathe-static`** tiles include **`p.card-label`** plus **`h5`** (Forge display scale) above **`p.forge-support`** body copy, matching showcase patterns in `generator/pages/_for_agents_content.py`.
- Link cards use **`<a class="forge-card breathe-link" href="…">`** with a visible **`card-label`** and **`h5`** inside the anchor; the link name matches the card title.
- Bootstrap **`.card`** blocks expose **`.card-title`** or a section heading in **`.card-header`** with non-empty text (≥ 2 characters after trim).
- Icon-forward tiles set **`aria-label="…"`** on the card root or **`aria-labelledby`** referencing a visible **`id`** on title text (pattern used when the visible label sits outside the card border).
- Nested cards: title elements inside an inner card do not satisfy the outer card unless the outer card has its own title or `aria-labelledby`.
- Toolbar cards and nav-region cards are skipped by the scanner even when markup uses `.card` classes.
- `metrics.cardTitleReport.violations` is empty after crawl.

## Failing signals

- **`.forge-card`** (or **`.card`**, `[data-card]`) contains only **`p.forge-support`** or bullet lists with no heading, `.card-title`, `.card-label`, or `aria-*` name.
- Body copy starts with a long paragraph while the “title” is implied by bold styling on a `<span>` (not a heading or sanctioned title class).
- **`aria-labelledby`** references a missing **`id`** or an element with fewer than two visible characters.
- Title text lives only in an **`alt`** on a decorative image with no visible heading (image alt does not count for this DOM scan).
- Duplicate unnamed cards in a grid (auditor caps at eight findings per page; evidence `missing_card_title card="div.forge-card.breathe-static"`).
- **Severity:** **major** for each card root missing an accessible name (`defaultSeverity: major`, `MIN_CARD_TITLE_CHARS = 2`).

## Before example

Failing KS markup: static outcome tile with **`forge-support`** body only—no **`card-label`**, heading, or accessible name on the card root.

```html
<div class="col-md-4">
  <div
    class="forge-card breathe-static p-3 h-100 d-flex flex-column"
    hash="KCt"
    data-ks-hash="KCt"
    data-ks-type="component"
    data-ks-name="outcome-tile-unnamed"
  >
    <p class="forge-support flex-grow-1 mb-3">
      Govern intent, delegate safely, and ship with evidence—without a visible card title.
    </p>
    <a class="btn btn-forge btn-sm mt-auto" href="#learn-more">Learn more</a>
  </div>
</div>
```

## After example

Passing KS markup: canonical Forge card anatomy—**`card-label`** eyebrow, **`h5`** title, then **`forge-support`** body copy (same grid cell as showcase “Static” card).

```html
<div class="col-md-4">
  <div
    class="forge-card breathe-static p-3 h-100 d-flex flex-column"
    hash="KCt"
    data-ks-hash="KCt"
    data-ks-type="component"
    data-ks-name="outcome-tile-named"
  >
    <p class="card-label mb-1">Outcome</p>
    <h5 class="mt-2 mb-2">Governed delivery</h5>
    <p class="forge-support flex-grow-1 mb-3">
      Shape intent, delegate safely, and release with reviewable evidence.
    </p>
    <a class="btn btn-forge btn-sm mt-auto" href="#learn-more">Learn more</a>
  </div>
</div>
```

Passing link-card variant for comparison:

```html
<div class="col-md-4">
  <a
    class="forge-card breathe-link p-3 h-100"
    href="#methodology"
    hash="Mth"
    data-ks-hash="Mth"
    data-ks-type="component"
    data-ks-name="methodology-link-card"
  >
    <p class="card-label mb-1">Methodology</p>
    <h5 class="mt-2 mb-2">Forge SDLC</h5>
    <p class="forge-support mb-0">Human-owned, agent-executed delivery spine.</p>
  </a>
</div>
```

## Evidence and remediation

**Evidence:** Metrics field `metrics.cardTitleReport` with `minTitleChars: 2`, `cardCount`, and `violations[]` entries (`kind: "missing-card-title"`, `selectorHint` with tag + classes + optional `[@hash]`, `className`). Findings surface as **major** accessibility issues with evidence `missing_card_title card="…"` and page URL when available. Message: *A card is missing a visible title; add a heading, .card-title, or wire aria-labelledby / aria-label.*

**Remediate (in order):**

1. Add **`p.card-label`** (eyebrow) and **`h5`** (or `h3`/`h4` in denser grids) as the first substantive content inside **`.forge-card`**.
2. For Bootstrap **`.card`**, use **`.card-title`** in **`.card-body`** or a heading in **`.card-header`**.
3. When the visible title must sit outside the card chrome, set **`aria-labelledby`** on the card root to the title element’s **`id`** (keep referenced text visible and ≥ 2 characters).
4. For compact icon tiles with no visible heading, set a concise **`aria-label`** on the card root (do not rely on icon `alt` alone).
5. Do not count nested **`.forge-card`** titles toward an outer wrapper—give each card root its own name.
6. Re-run `analyze-website-ux.mjs` on pages with card grids; pair with **`DET.CARD.ACTION_LIMIT`** when fixing CTA-heavy tiles.

## Related rules

- `DET.CARD.ACTION_LIMIT` — caps primary actions per card after the card is named and scannable.
- `DET.CTA.LABEL_NONEMPTY` — buttons and links inside cards still need non-empty accessible names.
- `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE` — judgment layer for whether the title plus body explain the product mechanism.
- `AI.PREMIUM.ENTERPRISE_FEEL` — subjective check that card grids feel calm and enterprise-grade once titles are present.
