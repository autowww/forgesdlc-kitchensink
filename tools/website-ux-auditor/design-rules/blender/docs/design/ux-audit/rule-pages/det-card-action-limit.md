---
rule_id: DET.CARD.ACTION_LIMIT
lane: deterministic
title: One primary action per card
summary: Each standard Kitchen Sink card exposes at most one filled primary CTA; extra actions use outline/secondary buttons, text links, or an explicit toolbar-card contract.
page_version: cf2a3260b29e73e441d945311198851f63b343202b7f0e347bb46d35a77408ed
generated_at: 2026-05-28T18:00:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-card-action-limit
related_rules:
  - DET.CARD.TITLE
  - DET.CTA.HIERARCHY
  - DET.CTA.LABEL_NONEMPTY
  - DET.BUTTON.GROUP.MAX
  - AI.VISUAL.HIERARCHY
---

## Purpose

Kitchen Sink cards (`.forge-card`, Bootstrap `.card`, `[data-card]`, showcase `preview-card` tiles) are meant to answer one question and offer **one decisive next step**. When a card footer stacks two or more filled primaries (`btn btn-forge`, `btn btn-primary`), scanners cannot tell which action owns the tile and conversion metrics blur across competing labels.

This deterministic rule scans visible card roots in Playwright, counts **primary** actions inside each card (excluding nested child cards), and allows **at most one** (`MAX_PRIMARY_ACTIONS_PER_CARD = 1`). Outline and secondary controls (`btn-forge-outline`, `btn-cyan-outline`, `btn-outline-*`, `btn-secondary`, `btn-link`) do not count toward the cap. Cards that declare a **toolbar-card** contract may host multiple primaries when the pattern is intentional (filter rails, editor toolbars, presentation stage controls).

**Plan:** Audit outcome grids, product tiles, and handbook callout cards on a crawl URL. **Do:** Keep one `btn-forge` (or link-card surface) per card; demote siblings to outline buttons or move overflow into a toolbar card. **Check:** `cardActionLimitReport.violations` is empty. **Adjust:** Split multi-goal tiles into separate cards or adopt `data-card-kind="toolbar"` with `[role="toolbar"]` / `.btn-toolbar` when multiple filled actions are required.

## Passing signals

- A **`.forge-card.breathe-static`** (or `.card`) body ends with **one** filled primary—typically **`btn btn-forge`** or a single **`btn btn-primary`**—plus optional low-emphasis **`btn btn-forge-outline`** or **`btn btn-cyan-outline`** siblings.
- **Link cards** use the whole surface as the primary: **`<a class="forge-card breathe-link" href="…">`** with no additional `btn-forge` buttons inside the same root.
- Nested cards are scoped independently: a primary inside a child `.forge-card` does not count against the parent container.
- **Toolbar cards** are skipped when `data-card-kind="toolbar"`, `data-ks-type` / `data-ks-name` includes `toolbar`, classes `toolbar-card` / `card-toolbar` apply, or the card contains **`[role="toolbar"]`** / **`.btn-toolbar`**.
- Nav, pagination, breadcrumb, dropdown, and cookie regions are excluded even when markup uses `.card` classes.
- `metrics.cardActionLimitReport.violations` is empty after crawl; `primaryCount ≤ 1` for every scanned non-toolbar card.

## Failing signals

- **`too-many-primary-actions`:** A `.forge-card` or `.card` reports `primaryCount=2` or higher (for example `labels="Start tour | Read docs"` both on `btn-forge`).
- **Severity:** **major** when two primaries compete; **critical** when three or more filled primaries appear in one card (`primaryCount > maxAllowed + 1`).
- Evidence strings include `primary_actions=N max=1 card="div.forge-card…"` and truncated button labels.
- A static tile combines **`forge-card breathe-link`** on the root **and** inner **`btn btn-forge`** buttons—double primaries on one card root.
- Marketing or product cards reuse hero semantics inside a card footer (multiple `btn-forge` without toolbar contract).
- Page may pass **`DET.CTA.HIERARCHY`** per viewport region yet still fail here because **each card** is its own conversion surface.

## Before example

Failing KS markup: static outcome card with two filled `btn-forge` actions in the footer—two primaries on one card root.

```html
<div class="col-md-4">
  <div
    class="forge-card breathe-static p-3 h-100 d-flex flex-column"
    hash="Out"
    data-ks-hash="Out"
    data-ks-type="component"
    data-ks-name="outcome-card-fail"
  >
    <p class="card-label mb-1">Outcome</p>
    <h5 class="mt-2 mb-1">Governed delegation</h5>
    <p class="forge-support flex-grow-1 mb-3">
      Shape intent, delegate safely, and keep human review on the critical path.
    </p>
    <div class="d-flex flex-wrap gap-2 mt-auto">
      <a class="btn btn-forge btn-sm" href="/quickstart">Start tour</a>
      <a class="btn btn-forge btn-sm" href="/docs/methodology">Read docs</a>
    </div>
  </div>
</div>
```

## After example

Passing KS markup: one filled primary plus an outline secondary in the same footer—only `btn-forge` counts as primary.

```html
<div class="col-md-4">
  <div
    class="forge-card breathe-static p-3 h-100 d-flex flex-column"
    hash="Out"
    data-ks-hash="Out"
    data-ks-type="component"
    data-ks-name="outcome-card-pass"
  >
    <p class="card-label mb-1">Outcome</p>
    <h5 class="mt-2 mb-1">Governed delegation</h5>
    <p class="forge-support flex-grow-1 mb-3">
      Shape intent, delegate safely, and keep human review on the critical path.
    </p>
    <div class="d-flex flex-wrap gap-2 mt-auto">
      <a class="btn btn-forge btn-sm" href="/quickstart">Start tour</a>
      <a class="btn btn-forge-outline btn-sm" href="/docs/methodology">Read docs</a>
    </div>
  </div>
</div>
```

Alternative passing pattern when multiple filled controls are intentional—declare a toolbar card:

```html
<div
  class="forge-card toolbar-card p-2"
  data-card-kind="toolbar"
  data-ks-type="component"
  data-ks-name="filter-toolbar-card"
  hash="Tbr"
  data-ks-hash="Tbr"
>
  <div class="btn-toolbar gap-2" role="toolbar" aria-label="Filter views">
    <button type="button" class="btn btn-forge btn-sm">All</button>
    <button type="button" class="btn btn-forge btn-sm">Active</button>
    <button type="button" class="btn btn-forge btn-sm">Archived</button>
  </div>
</div>
```

## Evidence and remediation

**Evidence:** Auditor field `metrics.cardActionLimitReport` with `maxAllowed: 1`, `cardCount`, and `violations[]` entries (`kind: too-many-primary-actions`, `primaryCount`, `selectorHint`, `labels`). Findings message: *A card exposes more than one primary action…* with `primary_actions=N max=1` in evidence. Reproduce in DevTools by selecting the card root and counting visible `.btn-forge` / `.btn-primary` descendants (ignore `.btn-forge-outline` and `.btn-secondary`).

**Remediate (in order):**

1. **Pick one owner** — keep the highest-intent label on `btn btn-forge`; demote siblings to **`btn btn-forge-outline`**, **`btn btn-cyan-outline`**, or plain **`forge-support`** text links.
2. **Prefer link-card pattern** — when the whole tile navigates, use **`<a class="forge-card breathe-link">`** alone; remove inner filled buttons.
3. **Split goals** — separate “start” and “learn” into two `.col-md-4` cards in the same `row g-3` grid instead of two primaries in one footer.
4. **Toolbar contract** — when multiple filled toggles are required, set **`data-card-kind="toolbar"`**, add **`role="toolbar"`** or **`.btn-toolbar`**, and document the exception in the design contract.
5. Re-run `analyze-website-ux.mjs` on pages with outcome grids; pair with **`DET.BUTTON.GROUP.MAX`** when the overcrowding is a horizontal hero row rather than a card footer.

## Related rules

- `DET.CARD.TITLE` — every card needs a visible title or `aria-labelledby` before action hierarchy matters.
- `DET.CTA.HIERARCHY` — one primary CTA per viewport region (hero, sticky bar); this rule scopes **per card**.
- `DET.CTA.LABEL_NONEMPTY` — demoted buttons and links still need accessible names.
- `DET.BUTTON.GROUP.MAX` — horizontal button rows (for example `landing-hero-actions__buttons`) cap visible actions at three; complementary to card footers.
- `AI.VISUAL.HIERARCHY` — judgment layer when a single primary is present but visual weight still competes across the grid.
