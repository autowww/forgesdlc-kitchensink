# Tunnel ambient (`Tun`)

**Hash:** `Tun` · **Slug:** `tunnel-ambient` · **Showcase:** `#sec-tunnel`

Emitter: `components/spatial.py::render_tunnel_ambient` · CSS root: `.ks-ambient--tunnel`

## Purpose

Infinite perspective grid hero backdrop.

## Expected behavior

Rounded container with drifting grid; optional caption overlay.

## States

Animated drift; static grid when prefers-reduced-motion.

## Oracle scenarios

`tun-dom-present`, `tun-reduced-motion`, `tun-warp-variant`

Machine oracle: [`../oracles/Tun.json`](../oracles/Tun.json) · Contract: [`../../catalog/components/Tun-tunnel-ambient.md`](../../catalog/components/Tun-tunnel-ambient.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Tun"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
