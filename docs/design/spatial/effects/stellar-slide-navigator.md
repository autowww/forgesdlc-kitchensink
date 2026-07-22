# Stellar Slide Navigator (`Stn`)

**Hash:** `Stn` · **Slug:** `stellar-slide-navigator` · **Showcase:** `#sec-stellar-slide-navigator`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Stellar slide navigator

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Stn.json`](../oracles/Stn.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Stn"`.
- Motion respects `prefers-reduced-motion: reduce`.
