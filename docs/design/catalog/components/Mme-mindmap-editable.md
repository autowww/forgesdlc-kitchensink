# Mme — Mind-map editable

**Hash:** `Mme` · **Type:** component · **Family:** mindmap · **Status:** active

Source: `components/mindmap.py::render_mindmap_editable` · Showcase: `ks-creation-mindmap.html` `#sec-mindmap-editable-static`, `#sec-mindmap-editable-api`

## Purpose

Editable mind-map composing static or dynamic render mode with toolbar (add child/sibling, delete, save, reload).

## Mount attributes

| Attribute | Purpose |
|-----------|---------|
| `data-ks-mindmap-editable` | Mount marker |
| `data-ks-mindmap-mode` | `static` \| `dynamic` |
| `data-ks-mindmap-load-url` | GET tree JSON |
| `data-ks-mindmap-save-url` | POST save endpoint |
| `data-ks-mindmap-save-demo` | `1` = sessionStorage fallback |
| `data-ks-mindmap-id` | Storage key / POST `mindmap_id` |

## Save POST body

```json
{ "version": 1, "mindmap_id": "ks-creation", "tree": { "id": "root", "label": "...", "children": [] } }
```

Response: `{ "ok": true }` or `{ "ok": false, "error": "..." }`.

## Deterministic checks

- Delete root blocked (toolbar disabled).
- Save without URL + `save-demo` shows "Saved locally (demo)".
- See `docs/design/mindmap/API.md` for backend contract.
