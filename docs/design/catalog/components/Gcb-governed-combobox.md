## Governed combobox (Gcb)

Programmatic flat-list combobox via `createGovernedCombobox` / `createTreeCombobox` with `visualHash: "Gcb"`.

### JS API

```javascript
import { createGovernedCombobox } from "./assets/ks-governed-combobox.js";
const api = createGovernedCombobox(host, {
  items: [{ value: "sdlc", label: "SDLC" }],
  onChange: (item) => {},
});
api.getValue();
api.setValue("sdlc");
api.destroy();
```

Auto-init: `[data-ks-combobox]` + optional `<script type="application/json" data-ks-combobox-data>`.

### Deterministic checks

- Root `[data-ks-hash="Gcb"]` visible
- Trigger opens panel (`forge-tree-combobox--open`)
