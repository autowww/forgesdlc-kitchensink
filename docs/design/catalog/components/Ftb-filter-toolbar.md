# Ftb — Filter toolbar

**Hash:** `Ftb` · **Type:** component · **Family:** data-tables · **Status:** active

Search and select filters for admin directory surfaces. Implemented in `js/ks-filter-toolbar.js`.

## Expected look

- Horizontal toolbar with search field, optional select filters, and active filter chips below.
- Chips include remove buttons; multiple active filters show a **Clear all** control.

## Root element

```html
<div class="forge-filter-toolbar" hash="Ftb" data-ks-hash="Ftb"
     data-ks-type="component" data-ks-name="filter-toolbar" role="search">
```

## Accessibility

- Search input has visible label or `aria-label`.
- Chip remove buttons name the filter being cleared.
- Active filter region uses `aria-live="polite"`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Scope filters as workbench chrome—not a peer page job | ENT.APP.05 | `DET.STUDIO.JOB_BUDGET` |
| Pair with `Dtb` and `Sab` in queue workbench | ENT.APP.05 | `DET.APP.BULK_ACTION_SCOPE`, `DET.APP.DATA_REFRESH_STALENESS` |

Contract: [`enterprise-app/rules/ENT.APP.05.yaml`](../../enterprise-app/rules/ENT.APP.05.yaml).
