# Standards traceability — gap report

> Automated axe and deterministic checks do not constitute legal conformance, ADA certification, VPAT completion, or WCAG sign-off. Pair with manual testing and, when needed, forge-accessibility Studio evidence.

Generated: 2026-05-26T14:25:31.887Z

Refresh: `cd tools/website-a11y-auditor && npm run blend-rules`

## wcag21aa

| Metric | Count |
|--------|------:|
| Total success criteria | 50 |
| Covered (axe and/or DET/AI) | 26 |
| Manual expected (catalog) | 12 |
| Uncovered (automation gap) | 12 |
| Untied Forge rules | 0 |
| Axe rules in profile | 68 |

### Uncovered criteria (no axe/DET/AI mapping)

- **1.3.2** — Meaningful Sequence
- **1.4.5** — Images of Text
- **1.4.11** — Non-text Contrast
- **1.4.13** — Content on Hover or Focus
- **2.1.4** — Character Key Shortcuts
- **2.5.2** — Pointer Cancellation
- **2.5.4** — Motion Actuation
- **3.2.1** — On Focus
- **3.2.2** — On Input
- **3.2.4** — Consistent Identification
- **4.1.1** — Parsing
- **4.1.3** — Status Messages

### Manual expected (documented in catalog)

- **1.2.1** — Audio-only and Video-only (Prerecorded)
- **1.2.2** — Captions (Prerecorded)
- **1.2.3** — Audio Description or Media Alternative (Prerecorded)
- **1.2.4** — Captions (Live)
- **1.2.5** — Audio Description (Prerecorded)
- **1.3.3** — Sensory Characteristics
- **1.4.2** — Audio Control
- **2.2.1** — Timing Adjustable
- **2.4.5** — Multiple Ways
- **2.5.1** — Pointer Gestures
- **3.2.3** — Consistent Navigation
- **3.3.4** — Error Prevention (Legal, Financial, Data)

### Untied rules (no WCAG criteria; not forge_only)

- _(none)_

### Forge-only rules (KS governance; excluded from untied)

- `DET.A11Y.KS.HASH_MARKERS`
- `DET.A11Y.KS.PY_HASH_ATTRS`

## wcag22aa

| Metric | Count |
|--------|------:|
| Total success criteria | 56 |
| Covered (axe and/or DET/AI) | 27 |
| Manual expected (catalog) | 16 |
| Uncovered (automation gap) | 13 |
| Untied Forge rules | 0 |
| Axe rules in profile | 69 |

### Uncovered criteria (no axe/DET/AI mapping)

- **1.3.2** — Meaningful Sequence
- **1.4.5** — Images of Text
- **1.4.11** — Non-text Contrast
- **1.4.13** — Content on Hover or Focus
- **2.1.4** — Character Key Shortcuts
- **2.4.11** — Focus Not Obscured (Minimum)
- **2.5.2** — Pointer Cancellation
- **2.5.4** — Motion Actuation
- **3.2.1** — On Focus
- **3.2.2** — On Input
- **3.2.4** — Consistent Identification
- **4.1.1** — Parsing
- **4.1.3** — Status Messages

### Manual expected (documented in catalog)

- **1.2.1** — Audio-only and Video-only (Prerecorded)
- **1.2.2** — Captions (Prerecorded)
- **1.2.3** — Audio Description or Media Alternative (Prerecorded)
- **1.2.4** — Captions (Live)
- **1.2.5** — Audio Description (Prerecorded)
- **1.3.3** — Sensory Characteristics
- **1.4.2** — Audio Control
- **2.2.1** — Timing Adjustable
- **2.4.5** — Multiple Ways
- **2.5.1** — Pointer Gestures
- **2.5.7** — Dragging Movements
- **3.2.3** — Consistent Navigation
- **3.2.6** — Consistent Help
- **3.3.4** — Error Prevention (Legal, Financial, Data)
- **3.3.7** — Redundant Entry
- **3.3.8** — Accessible Authentication (Minimum)

### Untied rules (no WCAG criteria; not forge_only)

- _(none)_

### Forge-only rules (KS governance; excluded from untied)

- `DET.A11Y.KS.HASH_MARKERS`
- `DET.A11Y.KS.PY_HASH_ATTRS`

