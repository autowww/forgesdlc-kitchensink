# Mmd — Mind-map dynamic

**Hash:** `Mmd` · **Type:** component · **Family:** mindmap · **Status:** active

Source: `components/mindmap.py::render_mindmap_dynamic` · Showcase: `ks-creation-mindmap.html` `#sec-mindmap-dynamic`

## Purpose

Client-rendered mind-map with branch collapse, resize reflow, and narrow-viewport vertical stack (&lt; 480px).

## Expected look

Same visual language as `Mms`; chevrons on branch nodes; initial expand depth 1.

## Mount attributes

| Attribute | Purpose |
|-----------|---------|
| `data-ks-mindmap` | Mount marker |
| `data-ks-mindmap-collapsible` | `1` / `0` |
| `data-ks-mindmap-initial-depth` | Collapse below this depth |

## Accessibility

- `role="treeitem"` on nodes with children; Enter/Space toggles branch.
- Focus ring on interactive nodes; `prefers-reduced-motion` disables morph transitions.

## Deterministic checks

- `[data-ks-hash="Mmd"]` present in built HTML.
- `tools/mindmap/tests/layout.test.mjs` — collapsed subtree omitted, narrow regroup.
