# Chapter Progress (`Cpb`)

**Hash:** `Cpb` · **Slug:** `chapter-progress` · **Showcase:** `layout-shells.html` `#sec-chapter-progress`

Emitter: `components/nav_layout.py::render_chapter_progress` · CSS root: `.ks-nav--chapter-progress`

## Purpose

Governed nav-layout primitive: chapter progress.

## Expected behavior

See showcase section `#sec-chapter-progress` on `layout-shells.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`cpb-dom-present`

Machine oracle: [`../oracles/Cpb.json`](../oracles/Cpb.json) · Contract: [`../../catalog/components/Cpb-chapter-progress.md`](../../catalog/components/Cpb-chapter-progress.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Cpb"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
