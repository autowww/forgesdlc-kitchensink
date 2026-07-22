---
hash: Kmm
name: Mind-map family
type: style-family
status: active
source_paths:
  - css/ks-mindmap.css
  - components/mindmap.py
  - js/ks-mindmap-layout.js
  - js/ks-mindmap.js
  - js/ks-mindmap-editable.js
showcase_url: https://ks.forgesdlc.com/cases/showcase/ks-creation-mindmap.html
---

# Kmm — Mind-map family

## Purpose

Parent roll-up for governed mind-map primitives sharing JSON tree contract v1 (`version`, `title`, `root`).

## Children

| Hash | Tier | Emitter |
|------|------|---------|
| `Mms` | Static printable SVG | `render_mindmap_static` |
| `Mmd` | Dynamic collapse/reflow | `render_mindmap_dynamic` |
| `Mme` | Editable GET/POST | `render_mindmap_editable` |

## Expected look

Light palette, orthogonal connectors, `#0f172a` labels on white/`--forge-bg` fills. Interactive tiers use teal accent on focus/selection.

## Deterministic checks

- Built showcase page `ks-creation-mindmap.html` emits `data-ks-hash` on each tier root.
- Layout unit tests: `tools/mindmap/tests/layout.test.mjs`.
