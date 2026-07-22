# Scroll Spy Toc (`Stc`)

**Hash:** `Stc` · **Slug:** `scroll-spy-toc` · **Showcase:** `navigation.html` `#sec-scroll-spy-toc`

Emitter: `components/nav_layout.py::render_scroll_spy_toc` · CSS root: `.ks-nav--scroll-spy-toc`

## Purpose

Governed nav-layout primitive: scroll spy toc.

## Expected behavior

See showcase section `#sec-scroll-spy-toc` on `navigation.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`stc-dom-present`

Machine oracle: [`../oracles/Stc.json`](../oracles/Stc.json) · Contract: [`../../catalog/components/Stc-scroll-spy-toc.md`](../../catalog/components/Stc-scroll-spy-toc.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Stc"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
