# Wizard flow CSS (`wizard-flow.css`)

Shared primitives for **Blueprints Wizard**–style flows in Lenses Studio and static sites:

- **Session list** — `.ks-wizard-flow__session-list` / `__session-item` for hub navigation.
- **Setup panel** — `.ks-wizard-flow__panel` and `__grid` for scope and product metadata forms.

Studio loads this file from `/__ks/css/wizard-flow.css` (kitchensink submodule under the forge-lenses repo). Extend here first, then refresh the submodule pointer in consumers if needed.
