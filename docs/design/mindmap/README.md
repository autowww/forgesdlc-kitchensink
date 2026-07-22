# KS mind-map — maintainer notes

Three governed tiers under family **Kmm**:

| Hash | Module | Role |
|------|--------|------|
| `Mms` | `render_mindmap_static` | Server SVG, print |
| `Mmd` | `render_mindmap_dynamic` + `ks-mindmap.js` | Collapse/reflow |
| `Mme` | `render_mindmap_editable` + `ks-mindmap-editable.js` | CRUD UI + API |

## Data contract (v1)

Fixture: `assets/mindmap-ks-creation.json`

```json
{
  "version": 1,
  "title": "Kitchen Sink",
  "root": {
    "id": "root",
    "label": "Kitchen Sink",
    "children": [{ "id": "child", "label": "Branch", "children": [] }]
  }
}
```

Python helper: `get_ks_creation_mindmap_demo()` in `components/mindmap.py`.

## Showcase page

`generator/pages/ks_creation_mindmap.py` (hash **Kcm**) — four sections, no Mermaid.

Assets wired via page `extra_css()` / `extra_js_paths()`:

- `assets/ks-mindmap.css`
- `assets/ks-mindmap-layout.js`
- `assets/ks-mindmap.js`
- `assets/ks-mindmap-editable.js`

## Tests

```bash
node --test tools/mindmap/tests/layout.test.mjs
```

## Build

```bash
python3 generator/build-showcase.py
```
