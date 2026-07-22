# Flp — Flip card

**Hash:** `Flp` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_flip_card` · Showcase anchor: `#sec-flip-card`

## Purpose

Reveal back-face content on demand with a governed Y-axis flip.

## Expected look

Card with visible Flip control; inner faces stack in 3D; back face uses glass treatment.

## States

Default shows front; checked trigger rotates inner ~180deg on Y; reduced motion hides back without rotation.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Flp.json`):

- **flp-dom-present** — root `[data-ks-hash="Flp"]` visible; threshold 1.0 after scenario actions.
- **flp-reduced-motion** — root `[data-ks-hash="Flp"]` visible; threshold 1.0 after scenario actions.
- **flp-flip-toggle** — root `[data-ks-hash="Flp"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-card--flip -->
<div class="ks-card--flip" hash="Flp" data-ks-hash="Flp"
     data-ks-type="component" data-ks-name="flip-card">
```
