# Tumbling Cubes (`Tmb`)

**Hash:** `Tmb` · **Slug:** `tumbling-cubes` · **Showcase:** `#sec-tumbling-cubes`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Tumbling cubes ambient

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Tmb.json`](../oracles/Tmb.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Tmb"`.
- Motion respects `prefers-reduced-motion: reduce`.
