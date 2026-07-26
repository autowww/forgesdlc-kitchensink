---
id: forge.scroll-overflow-policy
kind: design-principle
status: active
owner: Forge UX
applies_to:
  - forgesdlc.com
  - blueprints.forgesdlc.com
  - platform.forgesdlc.com
  - fleet.forgesdlc.com
  - lcdl.forgesdlc.com
  - lenses.forgesdlc.com
updated: 2026-07-26
---

# Scroll and overflow policy

Canonical rules for **where scrollbars may appear** on Forge public sites and handbooks. Pair with [forge-enterprise-ai-website-standard.md](forge-enterprise-ai-website-standard.md) and per-site [PAGE-DESIGN-CONSTRAINTS.md](../templates/PAGE-DESIGN-CONSTRAINTS.md).

## Core rule

**Only the browser viewport (page scroll) may show the native/default scrollbar.**

Regional containers must not expose default scrollbar chrome. When overflow is required, use **hidden scrollbars** plus **explicit controls** (peek-rail chevrons, expand, wrap/stack, or dedicated pan UI).

## Surface matrix

| Surface | Rule |
|---------|------|
| **Page viewport** | Native scrollbar permitted — primary reading scroll. |
| **L1–L2 landing/hub bands** (Hlr, Hlp, Hst, Dck, Epr peek rails) | No native scrollbar. Arrow/peek controls (`ks-peek-rail.js`) or vertical stack on narrow viewports. |
| **Handbook sidebar / ToC** | No visible native bar; hidden scrollbar if overflow unavoidable; prefer page-length expansion on hub pages. |
| **Tables** | `.forge-table-wrap` may use horizontal containment with **visible** scroll — the only content-region exception. |
| **Code blocks** | Prefer wrap; if overflow required, **hidden scrollbar** (not a visible regional bar). |
| **Maps / canvases / functional viewports** | Dedicated scroll/pan control — not an exposed default scrollbar. |

## Forbidden patterns

- `overflow-auto` on marketing rails without peek controls.
- Duplicate static diagram under an interactive layer rail when the rail is the primary visual.
- Landing spatial styles defined only in `docs-theme.css` when the page bundle loads `forge-theme.css` only.
- Broken handbook image paths (`assets/…` in HTML when published assets live under a site-specific prefix such as `platform-handbook-assets/`).

## KS implementation

| Mechanism | Location |
|-----------|----------|
| Hidden scroll utility | `.ks-scroll-region` in `css/forge-theme.css` |
| Table scroll exception | `.forge-table-wrap` |
| Peek rail gutter | `.ks-editorial-peek-rail` in `css/ks-nav-layout.css` |
| Landing band styles | `css/forge-theme.css` § handbook landing spatial bands |
| Base `fs-rail` rules | `css/ks-spatial.css` |

## Deterministic check

**`DET.SCROLL.PAGE_ONLY`** — crawl/viewport metrics: no visible native scrollbar on elements other than `html`/`body`, except `.forge-table-wrap`. Peek rails must expose prev/next controls when the track overflows.

## Authoring

Website repos ship `docs/PAGE-DESIGN-CONSTRAINTS.md` (from `docs/templates/PAGE-DESIGN-CONSTRAINTS.md`) with site-specific asset prefixes and L1 paths. Read that file before authoring or remediating L1–L2 pages.
