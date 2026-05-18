# Visual registry coverage

Generated: 2026-05-18T13:01:03.395Z (from check-visual-catalog.mjs; counts reflect current registry and inventory inputs)

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

## Inventory snapshot (visual-inventory.generated.json)

- Inventory items: 363
- Inventory generatedAt: 2026-05-18

### By proposed_type
- diagram-or-asset: 79
- design-terminology: 70
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

