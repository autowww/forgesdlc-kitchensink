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

### Density: `compact` (default) vs `hero`

- **`tileDensity`:** `'compact' \| 'hero'` on the control (default `'compact'`). Each option may set **`density`** to override for mixed lists.
- **Compact tile** uses `title`, `subtitle`, `description` (or falls back to `body` for the description paragraph), `status`, `meta`.
- **Hero tile** uses optional **`kicker`**, **`title`**, **`status`**, then **`lead`** or, if `lead` is omitted, **`subtitle`**, then body text **`body` ?? `description`** (plain text; line breaks preserved, **no line clamp** in v1 so screen readers and sighted users see the same full string). Optional **`media`** (`{ kind, src, alt }`) renders a lazy-loaded `<img>` (`loading="lazy"`, `decoding="async"`); **`alt` trimmed empty** means decorative (`role="presentation"`). Failed loads hide the image.
- **Closed trigger:** still a single line with ellipsis. Summary text is **`triggerSummary`** if set, else `title — subtitle`, else `title`. `resolveTileDensity(option, tileDensity)` is exported for host logic.

### Props (summary)

| Prop | Type | Notes |
|------|------|--------|
| `value` | `string` | Controlled selected option `value`. |
| `onChange` | `(value: string) => void` | Fired when user picks an enabled option. |
| `options` | `TileDropdownOption[]` | See density section and table below. |
| `placeholder` | `string?` | Trigger text when nothing selected (default `Select…`). |
| `label` | `string?` | Visible label; uses `<label htmlFor={trigger}>` for a11y. |
| `className` | `string?` | Appended on root `.ks-tile-dropdown`. |
| `id` | `string?` | Prefix for stable `id`s on trigger/panel. |
| `disabled` | `boolean?` | Disables the trigger. |
| `emptyMessage` | `string?` | Panel copy when `options` is empty. |
| `panelMaxHeight` | `string?` | CSS max-height on the listbox panel (scroll). |
| `panelClassName` | `string?` | Extra classes on the panel. |
| `panelMinWidth` | `string?` | CSS min-width on the panel (hero rows often need more width than the trigger). |
| `tileDensity` | `'compact' \| 'hero'?` | Default tile layout; per-option `density` overrides. |
| `ariaLabel` | `string?` | Trigger `aria-label` when there is no `label` prop (overrides default). |
| `panelAriaLabel` | `string?` | Listbox `aria-label` when `label` omitted (default `Options`). |
| `renderTile` | `(option, { selected, highlighted }) => ReactNode` | Optional full tile override; host can branch on `option.density` / `resolveTileDensity`. |

### `TileDropdownOption` fields (hero-related)

| Field | Notes |
|-------|--------|
| `density` | `'compact' \| 'hero'` overrides control `tileDensity`. |
| `kicker` | Hero only; small uppercase label above title. |
| `lead` | Hero emphasis line under title; if omitted, `subtitle` fills that slot in hero. |
| `body` | Hero body block; **overrides** `description` for that block in hero. Compact uses `description ?? body` for the small desc paragraph. |
| `media` | `{ kind: 'icon' \| 'image', src, alt }` for default hero renderer only. |
| `triggerSummary` | Closed trigger label when this option is selected. |

Hero-related **BEM** hooks: `.ks-tile-dropdown__tile--hero`, `.ks-tile-dropdown__tile-hero-inner`, `.ks-tile-dropdown__tile-hero-copy`, `.ks-tile-dropdown__tile-kicker`, `.ks-tile-dropdown__tile-lead`, `.ks-tile-dropdown__tile-body`, `.ks-tile-dropdown__meta--hero`, `.ks-tile-dropdown--hero-root` (when `tileDensity="hero"`).

### Behavior and a11y

- Trigger is a **button** with `aria-haspopup="listbox"` / `aria-expanded` / `aria-controls`.
- Panel is `role="listbox"`; each row is `role="option"` with `aria-selected` and roving `tabIndex` while open.
- **Keyboard:** ArrowUp/Down, Home/End, Enter/Space to commit, Escape to close (focus returns to trigger). **Mouse:** click outside closes.
- **Disabled** options are skipped for keyboard navigation and cannot be selected.
- Default hero layout keeps **DOM order** kicker → title/status → lead → body → meta; no nested focusables in the default renderer.

## Forge run primitives (governed runs / Studio)

- **Canonical source:** `ForgeRunHeader.tsx`, `ForgeStatusBanner.tsx`, `ForgeWorkflowStageBar.tsx`, `ForgeDecisionActionBar.tsx`, `ForgeKeyValueGrid.tsx`, `ForgeEventTimeline.tsx`, `ForgeDiagnosticPanel.tsx`, `ForgeReviewPanel.tsx`, `forgeRunTypes.ts`.
- **Styles:** `../css/forge-react-primitives.css` — load from product HTML as `/__ks/css/forge-react-primitives.css` (Lenses Studio `index.html` includes this link).
- **Lenses Studio:** same sync script as `WorkspaceLensControl`; run `npm run sync-kitchensink-react` from `forge-lenses/lenses-enterprise` after edits here.
- **Showcase (static HTML):** `forge-react-primitives.html` — built by `python3 generator/build-showcase.py` from `generator/pages/forge_react_primitives.py`; documents the same `ks-fe-*` classes without React.
