---
hash: Krm
name: Roadmap family
type: style-family
status: active
source_paths:
  - css/ks-roadmap.css
  - components/roadmap.py
showcase_url: https://ks.forgesdlc.com/cases/showcase/nested-roadmap.html
---

# Krm — Roadmap family

## Purpose

Parent roll-up for governed swimlane roadmap primitives sharing RoadmapDocument contract v2.

## Children

| Hash | Tier | Emitter |
|------|------|---------|
| `Rms` | Static printable SVG | `render_roadmap_static` |
| `Rmd` | Dynamic drill-down | `render_roadmap_dynamic` |
| `Rme` | Editable drag + dates | `render_roadmap_editable` |

## Deterministic checks

- Built `nested-roadmap.html` emits `data-ks-hash` on each tier root.
- `tools/roadmap/tests/layout.test.mjs` for date↔column sync.
