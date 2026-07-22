# Conf Data Block (`Dbf`)

**Hash:** `Dbf` · **Slug:** `conf-data-block` · **Showcase:** `#sec-conf-data-block`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

FF conf data block

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Dbf.json`](../oracles/Dbf.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Dbf"`.
- Motion respects `prefers-reduced-motion: reduce`.
