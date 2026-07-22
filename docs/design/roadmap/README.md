# KS roadmap — maintainer notes

Three governed tiers under family **Krm**:

| Hash | Module | Role |
|------|--------|------|
| `Rms` | `render_roadmap_static` | Server SVG, print |
| `Rmd` | `render_roadmap_dynamic` + `ks-roadmap.js` | Drill-down |
| `Rme` | `render_roadmap_editable` + drag + date table | Unified save |

## Data contract (v2)

Fixture: `assets/roadmap-demo.json`

Python: `get_roadmap_demo_doc()`, `upgrade_to_v2()` in `components/roadmap.py`.

## Tests

```bash
node --test tools/roadmap/tests/layout.test.mjs
```

## Build

```bash
python3 generator/build-showcase.py
```
