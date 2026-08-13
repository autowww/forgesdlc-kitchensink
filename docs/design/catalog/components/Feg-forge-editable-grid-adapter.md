# Feg — Forge editable grid adapter

**Hash:** `Feg` · **Type:** component · **Family:** enterprise-app · **Status:** active

Governed inline edit on read-only `Dtb` semantics—validation, summary, and permissions. Implemented in `js/ks-editable-grid-adapter.js`. Showcase: `enterprise-app-compositions.html` `#sec-eac-grid`.

## Purpose

ENT.APP.05 governed alternative to ad hoc editable cells in `createDataTable`—inline edit only on declared columns with validation feedback and optional read-only mode.

## Expected look

- Validation summary line above a scroll-wrapped table.
- Table uses `forge-data-table forge-editable-grid` with sticky header styling from `Dtb`.
- Editable cells render compact `form-control-sm` inputs; read-only cells render plain text.
- Invalid inputs use `is-invalid` and `aria-invalid="true"`.

## Root element

```html
<div class="forge-editable-grid-host" hash="Feg" data-ks-hash="Feg"
     data-ks-type="component" data-ks-name="editable-grid-adapter">
```

## Accessibility

- Column headers use `<th scope="col">`.
- Editable inputs include `aria-label` with column label and row index.
- Validation summary uses `role="status"` and `aria-live="polite"`.
- `readOnly: true` renders text only—no disabled inputs that imply editability.

## Deterministic checks

- Root `[data-ks-hash="Feg"]` visible; table has `forge-editable-grid` class.
- Only columns with `editable: true` render `<input>` cells.
- Failed `validate` sets `is-invalid` and populates `.forge-editable-grid__summary`.
- Successful edit clears summary and calls `onCellEdit` when supplied.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Inline edit without patching `Dtb` informally | ENT.APP.05 | `DET.DATA.TABLE_HEADERS`, `DET.DATA.COLOR_ONLY` |
| Field-level validation with visible error text | ENT.APP.04, ENT.APP.05 | `DET.FORM.LABEL_ERROR_SUMMARY` |
| Respect permission read-only via `readOnly` flag | ENT.APP.05, ENT.APP.06 | `DET.APP.DISABLED_REASON` |

Contract: [`enterprise-app/rules/ENT.APP.05.yaml`](../../enterprise-app/rules/ENT.APP.05.yaml).
