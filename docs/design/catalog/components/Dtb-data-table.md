# Dtb — Data table

**Hash:** `Dtb` · **Type:** component · **Family:** data-tables · **Status:** active

Sortable, paginated table for admin lists. Implemented in `js/ks-data-table.js` with styles in `css/forge-data-table.css`.

## Expected look

- Responsive scroll wrapper around a sticky-header table.
- Sortable columns use header buttons with `aria-sort`.
- Pagination footer shows range summary and Previous/Next when `total > pageSize`.

## Root element

```html
<div class="forge-data-table-host" hash="Dtb" data-ks-hash="Dtb"
     data-ks-type="component" data-ks-name="data-table">
```

## Accessibility

- Header cells use `scope="col"`.
- Sort buttons are native `<button type="button">` with ascending/descending `aria-sort` on `<th>`.
- Pagination nav has `aria-label="Table pagination"`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Read-only operational lists in data workbench | ENT.APP.05 | `DET.DATA.TABLE_HEADERS`, `DET.DATA.COLOR_ONLY` |
| Primary job surface with selection → `Sab` | ENT.APP.05, ENT.APP.08 | `DET.APP.BULK_ACTION_SCOPE`, `DET.APP.EMPTY_LOADING_ERROR_SUCCESS` |

**Do not** add informal inline editable cells—use planned `ForgeEditableGridAdapter` (ENT.APP.05 `known_gaps`).

Contract: [`enterprise-app/rules/ENT.APP.05.yaml`](../../enterprise-app/rules/ENT.APP.05.yaml).
