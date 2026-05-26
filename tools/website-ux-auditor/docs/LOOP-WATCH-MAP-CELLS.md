# Loop-watch defrag map — cell semantics

Canonical rules for the Forge UX loop watch **ruleset × page-fragment** grid. Implementations must match this document (`loop-watch-map-cell-model.js`, `loop-watch-progress-map.js`, `loop-watch-ansi-bars.js`).

## What the grid is

| Axis | Meaning |
|------|--------|
| **Row** | One **ruleset** (DET `area` or AI family), not one parallel worker. |
| **Column** | One **page fragment** (bucket of many URLs from the scorer catalog), not one page. |
| **Cell** | Collapsed state for *(ruleset × all pages in that column bucket)*. |

Trust **header counters** (`Scored N/M`, `Audited N/M`) for crawl progress. The map is a heatmap, not a 1:1 page queue.

## Cell model (required)

Every rendered cell has two layers:

### 1. Base status (persistent)

The **completed** coverage state. Stored in `rulesetMatrix` / progress JSON. **Does not** use in-flight names (`scoring`, `auditing`, `fixing`, `*-dim`).

| Base status | Meaning | Background glyph |
|-------------|---------|------------------|
| `unseen` | URL not in scorer snapshot yet. | `░` dark gray |
| `scored` | Sitewide scorer captured URL; **no** deterministic audit for this ruleset yet. | `▒` light gray |
| `audited-clean` | Audit ran; no findings for this ruleset. | `█` green |
| `audited-minor` | Audit ran; warn/minor only. | `█` amber |
| `audited-major` | Audit ran; major+ (or error-class). | `█` red |
| `pending-ai` | DET done; AI batch not run for URL. | `○` blue |
| `fixed` | Remediation completed clean. | `█` dark green |
| `error` | Page/rule error. | `▒` yellow |

**`unseen` and `scored` must look different** (distinct ANSI colors). Neither is green.

### 2. Process overlay (ephemeral)

While a process runs on **this ruleset × active page/fragment** intersection:

- **Base background stays unchanged** (still `unseen`, `scored`, etc.).
- A **rotating dash** (`─╲│╱`) in the **process color** draws on top of that background.
- Only **one** overlay cell at a time (active ruleset row × active fragment column).

| Overlay | When | Dash color |
|---------|------|------------|
| `scoring` | Sitewide scorer on this URL (`[ux-score]` crawl). | Blue on base background |
| `auditing` | Deterministic rule running on this URL. | Blue on base background |
| `fixing` | Remediation agent on this URL/ruleset. | Blue on base background |

When the process **finishes**, clear the overlay and **update base** to the new stable status (e.g. `scored` → `audited-clean`).

## Phase rules (no false green)

| Phase | Base statuses allowed (DET rows) |
|-------|----------------------------------|
| Scorer / `post_scorer` / before audit crawl | `unseen`, `scored` only — **never** `audited-*`. |
| Deterministic audit | `scored` until rule completes, then `audited-*`. |
| AI audit | `pending-ai` until URL in `aiAuditedUrls`, then `audited-*`. |

Legacy status `clean` means **scored** until audit, not `audited-clean`.

Sitewide scorer output (`ux-quality-score.json`) does **not** imply per-ruleset audit. Empty findings after scorer must remain **`scored` (gray)**, not green.

## Aggregation (column collapse)

When collapsing pages into a fragment column:

- Use **minimum progress** among pages (least far along), except:
- If **every** page in the bucket is ≥ `audited-clean`, column may show worst-case issue (`audited-major` > `audited-minor` > `audited-clean`).
- **Never** promote a column to `audited-clean` because one page passed while others are only `scored`.

## Merge across ticks

- Merge **base** statuses only; drop in-flight names when reading prior JSON.
- During scorer phase, prior `audited-*` must **downgrade** to `scored` when the current snapshot is scorer-only.

## Legend

Legend swatches show **base** colors. Include one example with **overlay dash on base** for `scoring` / `auditing`.
