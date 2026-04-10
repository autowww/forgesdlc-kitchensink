# Page layout taxonomy (Figma Community ↔ Kitchen Sink)

This document maps [Figma Community website templates](https://www.figma.com/community/website-templates) categories to **forgesdlc-kitchensink** (`ks`) layouts and section primitives. Use it when planning marketing or product sites and when filing backlog items in [BACKLOG-layouts-components.md](BACKLOG-layouts-components.md).

## How to read the tables

| Column | Meaning |
|--------|---------|
| **Figma category** | Designer-facing bucket on Figma Community (names vary slightly over time). |
| **Typical sections** | Blocks commonly found in those templates. |
| **Primary KS layout** | Python layout in `components/layouts.py` (or compose multiple). |
| **KS components** | `render_*` helpers in `components/` (non-exhaustive). |
| **Gaps / backlog** | `BL-xx` ids in `docs/BACKLOG-layouts-components.md` (open items only). |

Full-page layouts live in [`components/layouts.py`](../components/layouts.py). Marketing fragments use `forgesdlc-theme.css` (`fs-*` classes) unless noted.

---

## Landing

**Typical sections:** hero, value props, social proof (logos, quotes), feature grid, CTA band, footer.

| Field | Value |
|-------|--------|
| Primary KS layout | `landing_page` |
| KS components | `render_product_landing_hero`, `render_logo_strip`, `render_stage_carousel` / `render_hero_carousel`, `render_marketing_stat_band`, `render_testimonial_slider`, `render_case_study_spotlight`, `render_mega_footer` (enterprise chrome) |
| Gaps / backlog | BL-01, BL-02, BL-03, BL-04, BL-05, BL-06, BL-07, BL-08, BL-09, BL-10, BL-11, BL-12, BL-13, BL-16 |

---

## SaaS (product marketing)

**Typical sections:** hero + product shot, tabbed benefits, pricing table, FAQ, integrations logo rail, signup CTA.

| Field | Value |
|-------|--------|
| Primary KS layout | `landing_page`, `marketing_page` |
| KS components | Same as Landing, plus `render_tab_panel`, `render_faq_section`, `render_listing_shell` (for docs/resources lists inside marketing chrome) |
| Gaps / backlog | BL-04, BL-05, BL-06, BL-07, BL-08, BL-11, BL-12, BL-13, BL-16 |

---

## Business / corporate marketing

**Typical sections:** campaign hero, capability grid, industries, insights feed, events, mega-nav (often custom), dense multi-column footer, regional / investor links.

| Field | Value |
|-------|--------|
| Primary KS layout | `landing_page`, `marketing_page`, `listing_page` |
| KS components | `render_people_showcase`, `render_card_rail`, `render_mega_footer`, `render_listing_shell`, `render_listing_pagination`, `render_listing_empty_state` |
| Gaps / backlog | BL-01, BL-02, BL-03, BL-06, BL-07, BL-08, BL-09, BL-10, BL-11, BL-12, BL-13, BL-16 |

---

## Blog

**Typical sections:** article hero, prose, related posts, author, comments (often third-party).

| Field | Value |
|-------|--------|
| Primary KS layout | `marketing_page` (article), optional `listing_page` (index) |
| KS components | `render_blog_post_wrapper`, `render_blog_recent_section`, `render_breadcrumbs` |
| Gaps / backlog | BL-03, BL-08, BL-11, BL-12, BL-13 |

---

## Portfolio / case catalog

**Typical sections:** project grid, case spotlight, media gallery, client logos.

| Field | Value |
|-------|--------|
| Primary KS layout | `gallery_page`, `landing_page` |
| KS components | `render_thumb_gallery`, `render_gallery_carousel`, `render_case_study_spotlight`, `render_rail` / `render_card_rail` |
| Gaps / backlog | BL-03, BL-08, BL-11 |

---

## Documentation / handbook (not a Figma website template, but KS core)

| Field | Value |
|-------|--------|
| Primary KS layout | `showcase_page`, `handbook_page`, `chapter_page`, `product_page`, `split_page` |
| KS components | `render_toc_sidebar`, `render_page_header`, diagram blocks, tables |

---

## Reference enterprise marketing sites (pattern source)

Public marketing patterns from large services and consulting firms (global chrome, proof strips, hubs, dense footers) align most closely with **Business / corporate** and **Landing** rows above: [epam.com](https://www.epam.com), [softserveinc.com](https://www.softserveinc.com), [infosys.com](https://www.infosys.com), [mckinsey.com](https://www.mckinsey.com), [accenture.com](https://www.accenture.com), [ey.com](https://www.ey.com), [deloitte.com](https://www.deloitte.com).

---

## Maintenance

- When adding a new **layout function**, update this file, [BACKLOG-layouts-components.md](BACKLOG-layouts-components.md), and the agent inventory in `generator/pages/_for_agents_content.py` (`_layouts_inventory_table`).
- When closing a backlog item, remove or annotate its **Gaps** mentions here so the taxonomy stays honest.
