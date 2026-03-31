# Kitchensink React primitives

Optional React components that share behavior and CSS with the design system. They are **not** part of the Python showcase build.

**Studio shell (Electron + `/studio/` layout, `/__ks/` loading):** see [`../docs/design/lenses-studio-shell.md`](../docs/design/lenses-studio-shell.md).

## WorkspaceLensControl

- **Canonical source:** this folder (`WorkspaceLensControl.tsx`, `workspaceLensTypes.ts`, `index.ts`).
- **Styles:** `../css/workspace-lens.css` (`.ks-workspace-lens` and `.le-lens` refinements).
- **Lenses Studio:** copies files into `forge-lenses/lenses-enterprise/src/forgesdlc-kitchensink/` (Vite resolves `react` only under the app root). After editing here, run from `lenses-enterprise`: `npm run sync-kitchensink-react`.

Props: controlled `mode` / `onModeChange`, optional `suggestedLens`, `hintDismissed`, `onDismissHint`, `className`, and optional `presentation` (`dropdown` default, or `toggle` for the segmented Flow | Artifacts control in Lenses Studio).

Peer: `react`, `react-dom` (see `package.json` if using as an npm `file:` dependency).
