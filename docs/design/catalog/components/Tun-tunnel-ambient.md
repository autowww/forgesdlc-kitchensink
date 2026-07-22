# Tun — Tunnel ambient

**Hash:** `Tun` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_tunnel_ambient` · Showcase anchor: `#sec-tunnel`

## Purpose

Infinite perspective grid hero backdrop.

## Expected look

Rounded container with drifting grid; optional caption overlay.

## States

Animated drift; static grid when prefers-reduced-motion.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Tun.json`):

- **tun-dom-present** — root `[data-ks-hash="Tun"]` visible; threshold 1.0 after scenario actions.
- **tun-reduced-motion** — root `[data-ks-hash="Tun"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-ambient--tunnel -->
<div class="ks-ambient--tunnel" hash="Tun" data-ks-hash="Tun"
     data-ks-type="component" data-ks-name="tunnel-ambient">
```
