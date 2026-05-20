# Visual registry coverage

Generated: 2026-05-19T06:02:15.373Z (from check-visual-catalog.mjs; counts reflect current registry and inventory inputs)

- Registry entries: 91

## By type
- layout: 9
- page: 23
- layout-preview: 7
- chrome-region: 6
- react-primitive: 10
- primitive-family: 1
- style-family: 1
- visual-style: 5
- script-family: 1
- interaction-script: 5
- diagram-family: 1
- diagram-asset-group: 5
- python-renderer-family: 1
- python-component-module: 11
- docs-family: 1
- showcase-app-family: 1
- desktop-interface: 1
- museum-chrome-asset: 1
- library-consumer: 1

## By category
- chrome-region: 6
- design-documentation: 1
- desktop-chrome-asset: 1
- desktop-interface: 1
- diagram: 5
- diagram-family: 1
- interaction: 5
- interaction-family: 1
- layout: 9
- layout-preview: 7
- library-consumer: 1
- page: 23
- primitive-family: 1
- python-renderer: 11
- python-renderer-family: 1
- react-primitive: 10
- showcase-app: 1
- stylesheet: 5
- stylesheet-family: 1

## By emits_html
- false: 17
- true: 74

## By status
- active: 91

## By contract_status
- own: 54
- family-covered: 37

## By screenshot_status
- captured: 48
- not-applicable: 41
- blocked: 2

## Intentional family-covered rows

These entries share a roll-up contract; child hashes and path-level contracts carry per-file specificity. Presence here is expected.

| Hash | Type | Name | Contract | Parent hash |
|---|---|---|---|---|
| ARv | python-component-module | Python module nested_roadmap | `docs/design/catalog/components/Kpr-fam-python-renderers.md` | `Kpr` |
| bNG | python-component-module | Python module roadmap_date_editor | `docs/design/catalog/components/Kpr-fam-python-renderers.md` | `Kpr` |
| Bru | interaction-script | Tiles and presentation | `docs/design/catalog/interactions/Ksj-fam-scripts.md` | `Ksj` |
| DVN | visual-style | Shared UI and diagram surfaces | `docs/design/catalog/styles/Ksc-fam-styles.md` | `Ksc` |
| Ech | visual-style | Core site themes | `docs/design/catalog/styles/Ksc-fam-styles.md` | `Ksc` |
| Fda | react-primitive | ForgeDecisionActionBar | `docs/design/catalog/primitives/FAM-react-primitives.md` | — |
| Fdg | react-primitive | ForgeDiagnosticPanel | `docs/design/catalog/primitives/FAM-react-primitives.md` | — |
| Fen | react-primitive | ForgeEventTimeline | `docs/design/catalog/primitives/FAM-react-primitives.md` | — |
| Fkg | react-primitive | ForgeKeyValueGrid | `docs/design/catalog/primitives/FAM-react-primitives.md` | — |
| Frh | react-primitive | ForgeRunHeader | `docs/design/catalog/primitives/FAM-react-primitives.md` | — |
| Fsb | react-primitive | ForgeStatusBanner | `docs/design/catalog/primitives/FAM-react-primitives.md` | — |
| Fvw | react-primitive | ForgeReviewPanel | `docs/design/catalog/primitives/FAM-react-primitives.md` | — |
| Fwb | react-primitive | ForgeWorkflowStageBar | `docs/design/catalog/primitives/FAM-react-primitives.md` | — |
| FXK | visual-style | Desktop app chrome styles | `docs/design/catalog/styles/Ksc-fam-styles.md` | `Ksc` |
| Gtf | python-component-module | Python module diagram_catalog | `docs/design/catalog/components/Kpr-fam-python-renderers.md` | `Kpr` |
| hMR | diagram-asset-group | Ambient SVG motifs | `docs/design/catalog/diagrams/Ksv-fam-svg.md` | `Ksv` |
| KEm | visual-style | Ambient and atmospheric styles | `docs/design/catalog/styles/Ksc-fam-styles.md` | `Ksc` |
| Kfr | interaction-script | Diagram and chart interactions | `docs/design/catalog/interactions/Ksj-fam-scripts.md` | `Ksj` |
| Khx | python-component-module | KS hash and catalog attribute helpers | `docs/design/catalog/components/Kpr-fam-python-renderers.md` | `Kpr` |
| LJa | interaction-script | Portal, docs, and nav interactions | `docs/design/catalog/interactions/Ksj-fam-scripts.md` | `Ksj` |
| LkY | diagram-asset-group | Layout schematic SVGs | `docs/design/catalog/diagrams/Ksv-fam-svg.md` | `Ksv` |
| Mar | visual-style | Theme packs and light theme | `docs/design/catalog/styles/Ksc-fam-styles.md` | `Ksc` |
| nzA | python-component-module | Python module diagram_modal_fragment | `docs/design/catalog/components/Kpr-fam-python-renderers.md` | `Kpr` |
| pUW | interaction-script | Roadmap interactions | `docs/design/catalog/interactions/Ksj-fam-scripts.md` | `Ksj` |
| pvx | python-component-module | Python module presentation | `docs/design/catalog/components/Kpr-fam-python-renderers.md` | `Kpr` |
| qrv | python-component-module | Python module transforms | `docs/design/catalog/components/Kpr-fam-python-renderers.md` | `Kpr` |
| rJd | python-component-module | Python module enterprise_marketing | `docs/design/catalog/components/Kpr-fam-python-renderers.md` | `Kpr` |
| Tdc | react-primitive | TileDropdownControl | `docs/design/catalog/primitives/FAM-react-primitives.md` | — |
| TNH | interaction-script | Theme, ambient, and motion | `docs/design/catalog/interactions/Ksj-fam-scripts.md` | `Ksj` |
| TXK | diagram-asset-group | Background SVG library | `docs/design/catalog/diagrams/Ksv-fam-svg.md` | `Ksv` |
| VPc | python-component-module | Python module marketing_sections | `docs/design/catalog/components/Kpr-fam-python-renderers.md` | `Kpr` |
| VtQ | python-component-module | Python module components | `docs/design/catalog/components/Kpr-fam-python-renderers.md` | `Kpr` |
| vYA | museum-chrome-asset | Museum studio chrome graphics | `docs/design/catalog/desktop-interfaces/Msm-museum-studio.md` | `Msm` |
| vZr | python-component-module | Python module living_background | `docs/design/catalog/components/Kpr-fam-python-renderers.md` | `Kpr` |
| Wlc | react-primitive | WorkspaceLensControl | `docs/design/catalog/primitives/FAM-react-primitives.md` | — |
| Zmg | diagram-asset-group | Living background SVGs | `docs/design/catalog/diagrams/Ksv-fam-svg.md` | `Ksv` |
| Zxd | diagram-asset-group | Diagram template SVGs | `docs/design/catalog/diagrams/Ksv-fam-svg.md` | `Ksv` |

## Inventory snapshot (visual-inventory.generated.json)

- Inventory items: 369
- Inventory generatedAt: 2026-05-19

### By proposed_type
- diagram-or-asset: 79
- design-terminology: 76
- component: 59
- generated-showcase-page: 29
- page-instance: 23
- museum-surface-asset: 23
- visual-style: 22
- interaction-module: 18
- primitive: 10
- layout: 9
- layout-preview: 7
- chrome-region: 6
- python-component-anchor: 4
- visual-helper: 1
- showcase-app-source: 1
- desktop-interface: 1
- library-consumer: 1

Family rows (Ksc, Ksj, Ksv, Kpr) retain roll-up contracts; per-file or per-group coverage lives in child rows (visual-style, interaction-script, diagram-asset-group, python-component-module).

## Registry ↔ inventory alignment

- All non-family registry rows matched at least one inventory item.

## Uncovered or deferred museum inventory paths

- **Deferred (justified):** Vite bundles under `museum/studio/assets/*` use content-addressed filenames; they are covered at the **Msm** shell family level rather than per-chunk hashes until artifact names stabilize.

### Needs registry attention

- (none)

### Deferred bundle files (21 current inventory paths)

`museum/studio/assets/*` — listed in inventory but not individually registered (see policy above).

