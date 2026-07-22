# Sphere Family (`Orb`)

**Hash:** `Orb` · **Slug:** `sphere-family` · **Showcase:** `#sec-sphere-family`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Sphere family ambient

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Orb.json`](../oracles/Orb.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Orb"`.
- Motion respects `prefers-reduced-motion: reduce`.
