# Pro Mode Guard Toggle (`Pmg`)

**Hash:** `Pmg` · **Slug:** `pro-mode-guard-toggle` · **Showcase:** `#sec-pro-mode-guard-toggle`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Pro-mode guard toggle

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Pmg.json`](../oracles/Pmg.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Pmg"`.
- Motion respects `prefers-reduced-motion: reduce`.
