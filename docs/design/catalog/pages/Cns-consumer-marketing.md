---
hash: "Cns"
name: "Consumer marketing"
type: "page"
status: "active"
source_paths:
  - generator/pages/consumer_marketing.py
showcase_url: "https://ks.forgesdlc.com/showcase/consumer-marketing.html"
screenshot_url: "https://ks.forgesdlc.com/showcase/screenshots/Cns.png"
screenshot_status: "planned"
---

# Cns — Consumer marketing

## Identity

- **Hash:** Cns
- **Name:** Consumer marketing
- **Type:** page
- **Source paths:** `generator/pages/consumer_marketing.py`
- **Showcase URL:** https://ks.forgesdlc.com/showcase/consumer-marketing.html

## Purpose

Demonstrate Squarespace-inspired consumer marketing sections: centered display hero, numbered steps band, alternating feature rows, and linked media showcase grid.

## Expected look

- Spacious vertical rhythm with clamp-based section padding (80–120px desktop feel).
- Typography-led centered hero with optional scrim background and pill CTAs.
- Steps band uses three numbered columns on desktop, centered copy per step.
- Zigzag rows alternate image and copy; subtle border on media frames.
- Showcase grid shows 2–3 linked cards with cover images and hover lift (motion-safe).

## Anatomy

`main#main` showcase article containing demo sections from `consumer_marketing.py` renderers.

Registry **root_selector:** `main#main`.

## States

- **Default:** all sections visible in scroll order.
- **Interactive:** showcase card hover lift only; no tabs or modals on this page.
- **Reduced motion:** hero scrim animation and card hover transform disabled.

## Responsive behavior

- Hero title scales with `clamp`; actions wrap on narrow screens.
- Zigzag stacks image above copy on mobile.
- Showcase grid collapses to one column below md breakpoint.

## Accessibility contract

- Logical heading order: page H1 in showcase header, section H2s in each band.
- Steps use native `<ol>` list semantics.
- Showcase cards are plain links with visible titles.
- Focus states inherit Forge button and link styles.

## Deterministic checks

- Section roots emit `hash` and `data-ks-hash` for Cdh, Stb, Zfg, Msc.
- `forgesdlc-pack-consumer.css` loaded on showcase page.

## AI review notes

- Premium feel: generous whitespace, restrained motion, no stock-photo clichés in demo SVGs.
