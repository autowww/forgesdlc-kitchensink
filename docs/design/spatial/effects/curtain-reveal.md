# Curtain Reveal (`Cur`)

**Hash:** `Cur` · **Slug:** `curtain-reveal` · **Showcase:** `#sec-curtain-reveal`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Curtain reveal

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Cur.json`](../oracles/Cur.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Cur"`.
- Motion respects `prefers-reduced-motion: reduce`.
