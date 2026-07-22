# Cdh — Centered display hero

**Hash:** `Cdh` · **Type:** component · **Family:** python-components · **Status:** active

Rendered by `components/consumer_marketing.py::render_centered_display_hero`.

## Purpose

Typography-led centered hero for consumer product landing pages — large display headline, optional kicker, body copy, dual CTAs, and optional visual block below.

## Expected look

- Full-width section with centered text alignment and clamp-based display type (roughly 44–72px).
- Optional kicker in uppercase cyan tracking.
- Body copy muted, max-width near 42rem, centered.
- Pill-shaped primary and outline secondary CTAs in a horizontal row.
- Optional visual slot below actions (screenshot, diagram, or custom HTML).
- Background variants: subtle (default dark), bleed-image tone, or gradient scrim with slow ambient glow.

## Root element

```html
<section class="fs-consumer-hero …" hash="Cdh" data-ks-hash="Cdh" …>
```

## Responsive behavior

- Padding scales with viewport; actions wrap on narrow screens.
- Visual block spans full inner width up to 56rem.

## Accessibility contract

- Single H1 per page when used as primary hero.
- CTAs are anchor elements with visible labels.
- Scrim animation disabled when `prefers-reduced-motion: reduce`.
