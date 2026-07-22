# Flip Clock Counter (`Fck`)

**Hash:** `Fck` · **Slug:** `flip-clock-counter` · **Showcase:** `#sec-flip-clock-counter`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Flip clock counter

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Fck.json`](../oracles/Fck.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Fck"`.
- Motion respects `prefers-reduced-motion: reduce`.
