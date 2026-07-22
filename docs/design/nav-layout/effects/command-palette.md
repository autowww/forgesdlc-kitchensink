# Command Palette (`Cps`)

**Hash:** `Cps` · **Slug:** `command-palette` · **Showcase:** `overlays-transitions.html` `#sec-command-palette`

Emitter: `components/nav_layout.py::render_command_palette` · CSS root: `.ks-nav--command-palette`

## Purpose

Governed nav-layout primitive: command palette.

## Expected behavior

See showcase section `#sec-command-palette` on `overlays-transitions.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`cps-dom-present`

Machine oracle: [`../oracles/Cps.json`](../oracles/Cps.json) · Contract: [`../../catalog/components/Cps-command-palette.md`](../../catalog/components/Cps-command-palette.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Cps"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
