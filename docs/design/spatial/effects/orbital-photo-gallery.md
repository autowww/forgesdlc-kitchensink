# Orbital Photo Gallery (`Opg`)

**Hash:** `Opg` · **Slug:** `orbital-photo-gallery` · **Showcase:** `#sec-orbital-photo-gallery`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Orbital photo gallery

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Opg.json`](../oracles/Opg.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Opg"`.
- Motion respects `prefers-reduced-motion: reduce`.
