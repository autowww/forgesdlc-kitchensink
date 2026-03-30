# Forge data charts — JSON contract

`forge-data-charts.js` renders SVG (and simple HTML) from JSON. Used by **forge-lenses** `GET /api/project/<name>/chart-data` and `GET /api/chart-data/overview` (`charts` object), and by the showcase static/API demo pages.

## Top-level API response

```json
{
  "version": 1,
  "scope": "project" | "overview",
  "charts": { "<kind>": { ... } }
}
```

## Kinds

| kind | Payload shape |
|------|-----------------|
| `commit_weekly` | `{ "series": [ { "week": "2025-W12", "count": 3 }, ... ] }` |
| `commit_daily` | `{ "series": [ { "day": "2025-03-30", "count": 1 }, ... ] }` |
| `loc_added_horizontal` | `{ "rows": [ { "name": "repo", "value": 42 }, ... ] }` |
| `loc_total_bars` | Same as `loc_added_horizontal` |
| `loc_share_donut` | `{ "rows": [ { "name": "repo", "value": 1000 }, ... ], "top_n": 8 }` |
| `compliance_bars` | `{ "rows": [ ["repoName", 85], ... ] }` or `{ "rows": [ { "name", "score" } ] }` |
| `extension_heatmap` | `{ "extensions": [ [".py", 40], ... ], "tracked_files": 120 }` |
| `contributors` | `{ "rows": [ ["12", "Author"], ... ] }` |
| `submodule_layout` | `{ "svg_fragment": "<svg>...</svg>..." }` (server-rendered escape hatch) |

## JavaScript

- `ForgeDataCharts.mount(container, { kind, data?, url?, options? })`
- `ForgeDataCharts.mountAll(document)` — finds `[data-ks-chart][data-ks-chart-kind]` with optional `data-ks-chart-url` or `data-ks-chart-json`.
