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
