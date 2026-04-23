# Kitchensink React primitives

Optional React components that share behavior and CSS with the design system. They are **not** part of the Python showcase build.

**Studio shell (Electron + `/studio/` layout, `/__ks/` loading):** see [`../docs/design/lenses-studio-shell.md`](../docs/design/lenses-studio-shell.md).

## WorkspaceLensControl

- **Canonical source:** this folder (`WorkspaceLensControl.tsx`, `workspaceLensTypes.ts`, `index.ts`).
- **Styles:** `../css/workspace-lens.css` (`.ks-workspace-lens` and `.le-lens` refinements).
- **Lenses Studio:** copies files into `forge-lenses/lenses-enterprise/src/forgesdlc-kitchensink/` (Vite resolves `react` only under the app root). After editing here, run from `lenses-enterprise`: `npm run sync-kitchensink-react`.

Props: controlled `mode` / `onModeChange`, optional `suggestedLens`, `hintDismissed`, `onDismissHint`, `className`, and optional `presentation` (`dropdown` default, or `toggle` for the segmented Flow | Artifacts control in Lenses Studio).

Peer: `react`, `react-dom` (see `package.json` if using as an npm `file:` dependency).

## TileDropdownControl

- **Canonical source:** `TileDropdownControl.tsx`, `tileDropdownTypes.ts`, exported from `index.ts`.
- **Styles:** `../css/tile-dropdown.css` — prefix `.ks-tile-dropdown`. Load in the host app after `forge-theme.css` / Bootstrap (same pattern as workspace lens). **Lenses Studio:** `index.html` already includes `/__ks/css/tile-dropdown.css` once the `kitchensink` submodule contains that file under `css/`.
- **Lenses Studio:** run `npm run sync-kitchensink-react` from `forge-lenses/lenses-enterprise` after edits here (the script copies `TileDropdownControl.tsx`, `tileDropdownTypes.ts`, and `index.ts`).

### Props (summary)

| Prop | Type | Notes |
|------|------|--------|
| `value` | `string` | Controlled selected option `value`. |
| `onChange` | `(value: string) => void` | Fired when user picks an enabled option. |
| `options` | `TileDropdownOption[]` | Each option: `value`, `title`, optional `subtitle`, `description`, `meta[]`, `status`, `disabled`. |
| `placeholder` | `string?` | Trigger text when nothing selected (default `Select…`). |
| `label` | `string?` | Visible label; uses `<label htmlFor={trigger}>` for a11y. |
| `className` | `string?` | Appended on root `.ks-tile-dropdown`. |
| `id` | `string?` | Prefix for stable `id`s on trigger/panel. |
| `disabled` | `boolean?` | Disables the trigger. |
| `emptyMessage` | `string?` | Panel copy when `options` is empty. |
| `panelMaxHeight` | `string?` | CSS max-height on the listbox panel (scroll). |
| `ariaLabel` | `string?` | Trigger `aria-label` when there is no `label` prop (overrides default). |
| `panelAriaLabel` | `string?` | Listbox `aria-label` when `label` omitted (default `Options`). |
| `renderTile` | `(option, { selected, highlighted }) => ReactNode` | Optional full tile override; default renders title, status chip, subtitle, description, meta grid. |

### Behavior and a11y

- Trigger is a **button** with `aria-haspopup="listbox"` / `aria-expanded` / `aria-controls`.
- Panel is `role="listbox"`; each row is `role="option"` with `aria-selected` and roving `tabIndex` while open.
- **Keyboard:** ArrowUp/Down, Home/End, Enter/Space to commit, Escape to close (focus returns to trigger). **Mouse:** click outside closes.
- **Disabled** options are skipped for keyboard navigation and cannot be selected.

## Forge run primitives (governed runs / Studio)

- **Canonical source:** `ForgeRunHeader.tsx`, `ForgeStatusBanner.tsx`, `ForgeWorkflowStageBar.tsx`, `ForgeDecisionActionBar.tsx`, `ForgeKeyValueGrid.tsx`, `ForgeEventTimeline.tsx`, `ForgeDiagnosticPanel.tsx`, `ForgeReviewPanel.tsx`, `forgeRunTypes.ts`.
- **Styles:** `../css/forge-react-primitives.css` — load from product HTML as `/__ks/css/forge-react-primitives.css` (Lenses Studio `index.html` includes this link).
- **Lenses Studio:** same sync script as `WorkspaceLensControl`; run `npm run sync-kitchensink-react` from `forge-lenses/lenses-enterprise` after edits here.
- **Showcase (static HTML):** `forge-react-primitives.html` — built by `python3 generator/build-showcase.py` from `generator/pages/forge_react_primitives.py`; documents the same `ks-fe-*` classes without React.
