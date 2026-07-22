# Cps — Command Palette

**Hash:** `Cps` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_command_palette` · Showcase: `overlays-transitions.html` `#sec-command-palette`

## Purpose

Governed nav-layout primitive: command palette.

## Expected look

See showcase section `#sec-command-palette` on `overlays-transitions.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Cps.json`):

- **cps-dom-present** — root `[data-ks-hash="Cps"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--command-palette" hash="Cps" data-ks-hash="Cps"
     data-ks-type="component" data-ks-name="command-palette">
```
