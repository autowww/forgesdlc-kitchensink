# Zfg — Alternating feature row

**Hash:** `Zfg` · **Type:** component · **Family:** python-components · **Status:** active

Rendered by `components/consumer_marketing.py::render_alternating_feature_row` and `render_alternating_features_section` (BL-06).

## Purpose

Zigzag image-and-copy rows for feature storytelling — odd rows image-left, even rows image-right on desktop.

## Expected look

- Section wrapper with optional H2 title centered above rows.
- Each row: media frame with rounded border and cover image; copy column with H3, body paragraph, optional text link CTA.
- Vertical spacing between rows (~4rem).

## Root element

```html
<section class="fs-consumer-zigzag" hash="Zfg" data-ks-hash="Zfg" …>
```

## Responsive behavior

- Rows stack with image above copy on viewports below lg.
- `reverse` modifier flips column order on lg+.

## Accessibility contract

- Images require meaningful `alt` text from caller.
- Heading level H3 inside rows when section provides H2.
