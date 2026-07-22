# Backlog: layouts and enterprise marketing components

Prioritized gaps versus common **enterprise marketing** patterns (and Figma Community website template categories). See [PAGE-LAYOUT-TAXONOMY.md](PAGE-LAYOUT-TAXONOMY.md) for the mapping.

**Tags:** `layout` · `component` · `css` · `js` · `doc`

**Status:** Open · **Done** (shipped in ks)

---

## Done (baseline + this pass)

| ID | Item | Tags | Figma category | Notes |
|----|------|------|----------------|-------|
| BL-17 | **`listing_page` layout** — marketing chrome + optional filter sidebar + main listing column | layout, css | Business, Blog | [`components/layouts.py`](../components/layouts.py), `fs-listing-*` in `forgesdlc-theme.css`, preview `showcase/preview-listing.html` |
| BL-18 | **`render_mega_footer`** — grouped link columns + legal / bottom slot | component, css | Business, Landing | [`components/enterprise_marketing.py`](../components/enterprise_marketing.py) |
| BL-19 | **`render_tab_panel`** — accessible Bootstrap tablist + tab panels | component, css, js | SaaS, Landing | Same module; requires Bootstrap JS |
| BL-20 | **`render_faq_section`** — Bootstrap accordion FAQ | component, css, js | SaaS, Landing | Same module |
| BL-21 | **Listing helpers** — `render_listing_shell`, `render_listing_pagination`, `render_listing_empty_state` | component, css | Business, Blog | Same module |
| BL-22 | **Consumer marketing primitives** — centered hero, steps band, zigzag features, media showcase grid | component, css | Landing, SaaS | [`components/consumer_marketing.py`](../components/consumer_marketing.py), `forgesdlc-pack-consumer.css`, preview `showcase/consumer-marketing.html` |
| BL-23 | **Section swimlanes** — stacked title dock under header (garage-door collapse, max 3 lanes) | component, css, js | Landing, SaaS | `css/fs-section-swimlanes.css`, `js/ks-section-swimlanes.js`, `showcase/section-swimlanes.html`; extends BL-03 scrollspy direction |
| BL-06 | **Alternating feature row** (zigzag image + copy) | component, css | Landing, SaaS | `render_alternating_feature_row` in `consumer_marketing.py` |
| BL-14 | **Showcase demo** — `enterprise-marketing.html` exercises tabs, FAQ, mega footer, `listing_page` | doc | — | [`generator/pages/enterprise_marketing.py`](../generator/pages/enterprise_marketing.py) |
| BL-15 | **Layouts + For agents inventory** — `listing_page` in layouts demo, modal preview, `_for_agents_content.py` | doc | — | [`layouts_demo.py`](../generator/pages/layouts_demo.py), [`showcase.js`](../js/showcase.js) |

---

## Open — high leverage

| ID | Item | Tags | Figma category |
|----|------|------|----------------|
| BL-01 | **Mega-menu / navbar dropdown panels** (multi-column + optional promo tile) | component, css, js | Business |
| BL-02 | **Utility bar** above primary nav (locale, contact, investor links) | component, css | Business |
| BL-03 | **Marketing scrollspy / horizontal section nav** (sticky anchor bar under header, `forgesdlc-theme.css`) | layout, css, js | Landing, SaaS |
| BL-04 | **Video / ambient-motion hero** fragment (`prefers-reduced-motion`, poster, no autoplay abuse) | component, css, js | Landing |
| BL-05 | **Pricing / plan feature matrix** (highlight column, sticky header row, a11y) | component, css | SaaS |
| BL-07 | **Event / webinar card** (date badge, timezone, CTA) | component, css | Business |
| BL-08 | **Press / news list row** (date, category, headline) | component, css | Business, Blog |
| BL-09 | **Trust badge strip** (certifications, analyst — not client logos) | component, css | Business |
| BL-10 | **Asymmetric marketing interior** (main + persistent promo aside; beyond small `render_cross_refs`) | layout, css | Business |

---

## Open — interactive / heavier

| ID | Item | Tags | Figma category |
|----|------|------|----------------|
| BL-11 | **Faceted filter UI + filterable card grid** (JS contract, URL state optional) | component, layout, js | Business, Blog |
| BL-12 | **Global search overlay shell** (static markup + focus trap; optional Pagefind later) | component, js | Business |
| BL-13 | **Listing layout: live filter behavior** wiring for `listing_page` (beyond static sidebar HTML) | layout, js | Blog, Business |
| BL-16 | **Consumer integration** — forgesdlc.com or other sites adopt new primitives where useful | doc | — |

---

## How to pick up work

1. Implement in **standalone** [`forgesdlc-kitchensink`](../) only (submodule consumers bump separately).
2. One logical change per commit (layout vs component vs CSS).
3. After HTML/CSS/JS changes, run `python3 generator/build-showcase.py` from repo root.
4. When an open item ships, move its row to **Done** and update [PAGE-LAYOUT-TAXONOMY.md](PAGE-LAYOUT-TAXONOMY.md) gap columns.
