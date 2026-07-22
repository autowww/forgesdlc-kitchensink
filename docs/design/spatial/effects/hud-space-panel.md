# Hud Space Panel (`Hud`)

**Hash:** `Hud` · **Slug:** `hud-space-panel` · **Showcase:** `#sec-hud-space-panel`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

HUD in space panel

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Hud.json`](../oracles/Hud.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Hud"`.
- Motion respects `prefers-reduced-motion: reduce`.
