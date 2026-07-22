# Roadmap unified save API (v2)

## GET load

**Request:** `GET {load_url}` → RoadmapDocument JSON (v2).

## POST save

**Request:** `POST {save_url}` with `Content-Type: application/json`

**Body:**

```json
{
  "version": 2,
  "roadmap_id": "demo-api",
  "rel_path": "ROADMAP.md",
  "title": "FY-26 portfolio (demo)",
  "columns": [{ "id": "q1", "label": "Q1", "start": "2026-01-01", "end": "2026-03-31" }],
  "tracks": [{ "id": "platform", "label": "Platform" }],
  "bars": [{
    "id": "r-epic",
    "epic_id": "r-epic",
    "label": "Reliability program",
    "trackId": "platform",
    "startColumnId": "q1",
    "endColumnId": "q3"
  }],
  "date_rows": [{
    "epic_id": "r-epic",
    "label": "Reliability program",
    "initial_start": "2026-01-01",
    "initial_end": "2026-03-31",
    "target_start": "2026-01-01",
    "target_end": "2026-09-30"
  }]
}
```

**Success:** `{ "ok": true }`

**Failure:** `{ "ok": false, "error": "..." }`

## Lenses v1 compatibility

Existing `POST /api/roadmap-dates` with `{ rel_path, updates }` remains supported for standalone date editor mounts. Unified v2 POST may extend the same endpoint when `version: 2` is present.

## Static hosting demo

`data-ks-roadmap-save-demo="1"` persists full document to `sessionStorage` key `ks-roadmap-demo:{roadmap_id}`.
