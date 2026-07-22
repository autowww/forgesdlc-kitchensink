# KS dynamic UI API

Programmatic integration tiers for Kitchen Sink controls.

## Tiers

| Tier | Pattern | Update after mount |
|------|---------|-------------------|
| A | Python `render_*` kwargs | Re-emit HTML |
| B | `data-ks-*` auto-init IIFE | Re-mount or use factory |
| C | ES module `create*(container, options)` | `getValue` / `setValue` / `refresh` |
| D | `window.*` globals | Imperative calls |
| E | JSON + REST | Roadmap / mindmap editable |
| F | React props | Lenses Studio |
| G | Bootstrap `data-bs-*` | Bootstrap API |

## Factory contract (tier C)

```javascript
const api = createX(container, {
  id: "optional-id",
  onChange: (state) => {},
  // control-specific options…
});
api.getValue();
api.setValue(next);
api.destroy();
// optional: api.refresh(partialOptions)
```

Declarative mounts use `data-ks-*` attributes; scripts auto-init on `DOMContentLoaded` with `dataset.*Bound` guards.

Custom events: `ks-<name>-change` with `{ detail }` on the root element.

## Controls with tier-C factories

| Hash | Name | Module | Factory |
|------|------|--------|---------|
| Pgt | pagination-tactile | `ks-pagination-tactile.js` | `createPaginationTactile` |
| Fcs | filter-chip-scroller | `ks-filter-chip-scroller.js` | `createFilterChipScroller` |
| Sab | sticky-action-bar | `ks-sticky-action-bar.js` | `createStickyActionBar` |
| Gcb | governed-combobox | `ks-governed-combobox.js` | `createGovernedCombobox` (wraps tree combobox) |
| Tcb | tree-combobox | `ks-tree-combobox.js` | `createTreeCombobox` |
| Svc | segmented-control | `ks-segmented-control.js` | `createSegmentedControl` |
| Swz | stepper-wizard | `ks-stepper-wizard.js` | `createStepperWizard` |
| Ftb | filter-toolbar | `ks-filter-toolbar.js` | `createFilterToolbar` |
| Dtb | data-table | `ks-data-table.js` | `createDataTable` |

## Python mount helpers

`components.components` exposes mount emitters (empty host + JSON config):

- `render_data_table_mount(mount_id, config)`
- `render_filter_toolbar_mount(mount_id, config)`
- `render_tree_combobox_mount(mount_id, config)`
- `render_governed_combobox_mount(mount_id, config)`

Pattern matches `render_ks_chart_mount`: host `div` + `<script type="application/json" data-ks-*-config>`.

## Form controller

`createFormController(root, { onChange, validate })` in `ks-form-controller.js` — reads/writes values on existing `render_form_*` markup.

## Out of scope

Editable spreadsheet grids, date/time pickers, third-party Tom Select — use `.forge-widget-host` + external library per Controls showcase.
