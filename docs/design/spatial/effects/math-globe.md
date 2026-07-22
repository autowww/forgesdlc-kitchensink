# Math Globe (`Glb`)

**Hash:** `Glb` · **Slug:** `math-globe` · **Showcase:** `#sec-math-globe`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Math globe ambient

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Glb.json`](../oracles/Glb.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Glb"`.
- Motion respects `prefers-reduced-motion: reduce`.
