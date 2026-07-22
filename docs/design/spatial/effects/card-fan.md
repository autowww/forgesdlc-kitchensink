# Card Fan (`Fan`)

**Hash:** `Fan` · **Slug:** `card-fan` · **Showcase:** `#sec-card-fan`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Card fan

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Fan.json`](../oracles/Fan.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Fan"`.
- Motion respects `prefers-reduced-motion: reduce`.
