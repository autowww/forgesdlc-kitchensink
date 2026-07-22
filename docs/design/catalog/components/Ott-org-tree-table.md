# Ott — Org tree table

**Hash:** `Ott` · **Type:** component · **Family:** data-tables · **Status:** active

Expandable org-unit hierarchy with lazy-loaded user tables per branch. Implemented in `js/ks-org-tree-table.js`.

## Expected look

- Tree list (`role="tree"`) of org rows with expand toggles, name, and headcount meta.
- Expanded org shows nested data table of users with per-branch pagination.
- Optional **Unassigned** root row when users lack an org unit.

## Root element

```html
<div class="forge-org-tree-table" hash="Ott" data-ks-hash="Ott"
     data-ks-type="component" data-ks-name="org-tree-table" role="tree">
```

## Accessibility

- Org rows are `role="treeitem"` with `aria-expanded`.
- Expand buttons have **Expand** / **Collapse** labels.
- User tables reuse **Dtb** header and pagination semantics.
