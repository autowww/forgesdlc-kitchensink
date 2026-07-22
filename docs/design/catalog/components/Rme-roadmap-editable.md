# Rme — Roadmap editable

**Hash:** `Rme` · **Type:** component · **Family:** roadmap · **Status:** active

Source: `components/roadmap.py::render_roadmap_editable` · Showcase: `nested-roadmap.html` `#sec-roadmap-editable-static`

## Purpose

Editable swimlane with bar move/resize along columns (dynamic mode) and unified Initial/Target date table synced bidirectionally.

## Drag (dynamic mode)

- Body drag: move bar preserving span.
- Left/right handles: resize `startColumnId` / `endColumnId`.
- Arrow keys: nudge; Shift+arrow resizes end; Alt+Shift+arrow resizes start.

## Save POST body (v2)

```json
{
  "version": 2,
  "roadmap_id": "demo-api",
  "rel_path": "ROADMAP.md",
  "columns": [],
  "tracks": [],
  "bars": [],
  "date_rows": []
}
```

See `docs/design/roadmap/API.md`.
