# Deterministic accessibility rules (`DET.A11Y.*`)

**Convention:** `DET.A11Y.<SCOPE>.<NAME>` where `<SCOPE>` is `GENERIC` or `KS`. Generated check modules **must** include `-generic-` or `-ks-` in the filename.

## Generic (`DET.A11Y.GENERIC.*`)

| Rule ID | Check |
|---------|--------|
| `DET.A11Y.GENERIC.LANG` | Root `html[lang]` present |
| `DET.A11Y.GENERIC.TITLE` | Document title non-empty |
| `DET.A11Y.GENERIC.VIEWPORT` | Meta viewport suitable for reflow |
| `DET.A11Y.GENERIC.LANDMARKS` | `main`, `nav`, header/footer landmarks |
| `DET.A11Y.GENERIC.IMAGES_ALT` | Visible images have alt |
| `DET.A11Y.GENERIC.CONTRAST` | Heuristic low-contrast samples |
| `DET.A11Y.GENERIC.MOTION_REDUCED` | `prefers-reduced-motion` honored |
| `DET.A11Y.GENERIC.MOTION_FLASH` | No hazardous auto-play flash |
| `DET.A11Y.GENERIC.FOCUS_ORDER` | Focus order vs visual nav |
| `DET.A11Y.GENERIC.DATA_TABLE_HEADERS` | Tables with meaningful headers |
| `DET.A11Y.GENERIC.DIAGRAM_ALT` | Diagram images have alt |
| `DET.A11Y.GENERIC.APP_FOCUS_TRAP` | Modals trap focus appropriately |

## Kitchen Sink (`DET.A11Y.KS.*`)

| Rule ID | Check |
|---------|--------|
| `DET.A11Y.KS.HASH_MARKERS` | `hash` + `data-ks-hash` on visual roots |
| `DET.A11Y.KS.BREADCRUMB` | Handbook breadcrumb chrome (`Kbc`) |
| `DET.A11Y.KS.REACT_A11Y_ROLE` | React primitives expose ARIA roles |
| `DET.A11Y.KS.PY_HASH_ATTRS` | Python emitters use `ks_hash_attrs` helpers |
| `DET.A11Y.KS.HANDBOOK_SINGLE_H1` | One `h1` in handbook chapter layout |

Implementations live under `tools/website-a11y-auditor/design-rules/deterministic/generated/`.
