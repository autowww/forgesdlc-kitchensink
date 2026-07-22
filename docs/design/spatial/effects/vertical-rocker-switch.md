# Vertical Rocker Switch (`Vrk`)

**Hash:** `Vrk` · **Slug:** `vertical-rocker-switch` · **Showcase:** `#sec-vertical-rocker-switch`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Vertical rocker switch

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Vrk.json`](../oracles/Vrk.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Vrk"`.
- Motion respects `prefers-reduced-motion: reduce`.
