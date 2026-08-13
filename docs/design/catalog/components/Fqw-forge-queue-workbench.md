# Fqw — Forge queue workbench

**Hash:** `Fqw` · **Type:** composition · **Family:** enterprise-app · **Status:** active

Filter toolbar + data table + selection-scoped sticky actions + saved views. Implemented in `js/ks-queue-workbench.js`. Showcase: `enterprise-app-compositions.html` `#sec-eac-queue`.

## Purpose

Operational queue workbench for ENT.APP.05—compose `Ftb`, `Dtb`, and `Sab` with saved views, freshness signal, and bulk selection scope.

## Expected look

- Header row with saved-view toggle buttons and a freshness status line.
- Filter toolbar, paginated data table, and sticky bulk-action bar that appears only when rows are selected.
- Selection count precedes bulk actions; active view button uses cyan highlight.

## Root element

```html
<div class="forge-queue-workbench" hash="Fqw" data-ks-hash="Fqw"
     data-ks-type="composition" data-ks-name="forge-queue-workbench"
     data-studio-workspace="queue">
```

## Accessibility

- Freshness region uses `role="status"`.
- Selection count uses `aria-live="polite"` before bulk actions.
- Row checkboxes are inside `<label>` elements with visible row text.
- Nested `Ftb` / `Dtb` / `Sab` contracts apply for search, sort, and action buttons.

## Deterministic checks

- Root `[data-ks-hash="Fqw"]` visible with `data-studio-workspace="queue"`.
- When rows are selected, `.forge-queue-workbench__selection-count` states count before bulk toolbar.
- Freshness region updates after `fetchRows` resolves (not stuck on “Loading…”).
- `Sab` host hidden when selection count is zero.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Treat lists as operational work surfaces, not read-only galleries | ENT.APP.05 | `DET.APP.EMPTY_LOADING_ERROR_SUCCESS`, `DET.DATA.TABLE_HEADERS` |
| Saved views + filters + bulk actions with visible scope | ENT.APP.05, ENT.APP.02 | `DET.APP.BULK_ACTION_SCOPE`, `DET.APP.DATA_REFRESH_STALENESS` |
| Keep inspection and decisions beside the queue | ENT.APP.08 | `DET.APP.BULK_ACTION_SCOPE`, `AI.APP.WORKFLOW_CONTINUITY` |

Contract: [`enterprise-app/rules/ENT.APP.05.yaml`](../../enterprise-app/rules/ENT.APP.05.yaml).
