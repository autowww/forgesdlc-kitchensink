# Deterministic accessibility rules (`DET.A11Y.*`)

**Convention:** `DET.A11Y.<SCOPE>.<NAME>` where `<SCOPE>` is `GENERIC` or `KS`. Generated check modules **must** include `-generic-` or `-ks-` in the filename.

## Generic (`DET.A11Y.GENERIC.*`)

| Rule ID | Check |
|---------|--------|
| `DET.A11Y.GENERIC.LANG` | Root `html[lang]` present |
| `DET.A11Y.GENERIC.TITLE` | Document title non-empty |
| `DET.A11Y.GENERIC.VIEWPORT` | Meta viewport suitable for reflow (WCAG 2.1 **1.4.10**) |
| `DET.A11Y.GENERIC.RESIZE_TEXT` | Zoom/viewport and overflow heuristics for **1.4.4** (WCAG 2.0) |
| `DET.A11Y.GENERIC.LANDMARKS` | `main`, `nav`, header/footer landmarks |
| `DET.A11Y.GENERIC.IMAGES_ALT` | Visible images have alt |
| `DET.A11Y.GENERIC.CONTRAST` | Heuristic low-contrast samples |
| `DET.A11Y.GENERIC.USE_OF_COLOR` | Color-only status cues (**1.4.1**) |
| `DET.A11Y.GENERIC.MOTION_REDUCED` | `prefers-reduced-motion` honored (WCAG 2.1 **2.3.3**) |
| `DET.A11Y.GENERIC.MOTION_FLASH` | No hazardous auto-play flash (**2.3.1**) |
| `DET.A11Y.GENERIC.FLASH_THRESHOLD` | High-frequency flash (**2.3.2** AAA) |
| `DET.A11Y.GENERIC.FOCUS_ORDER` | Focus order vs visual nav (**2.4.3**) |
| `DET.A11Y.GENERIC.DATA_TABLE_HEADERS` | Tables with meaningful headers |
| `DET.A11Y.GENERIC.DIAGRAM_ALT` | Diagram images have alt |
| `DET.A11Y.GENERIC.APP_FOCUS_TRAP` | Modals trap focus appropriately |
| `DET.A11Y.GENERIC.FOCUS_CONTEXT_CHANGE` | No unexpected context change on focus (**3.2.1**) |
| `DET.A11Y.GENERIC.INPUT_CONTEXT_CHANGE` | No unexpected context change on input (**3.2.2**) |
| `DET.A11Y.GENERIC.READING_ORDER` | Meaningful sequence heuristics (**1.3.2**) |
| `DET.A11Y.GENERIC.IMAGES_OF_TEXT` | Images of text patterns (**1.4.5** / **1.4.9**) |
| `DET.A11Y.GENERIC.SECTION_HEADINGS` | Section headings in long content (**2.4.10** AAA) |
| `DET.A11Y.GENERIC.CONSISTENT_LABELS` | Consistent component labels sitewide (**3.2.4**) |
| `DET.A11Y.GENERIC.CONSISTENT_NAV` | Consistent primary nav sitewide (**3.2.3**) |
| `DET.A11Y.GENERIC.KEYBOARD_ACCESS` | Mouse-only handlers / focus traps (**2.1.1**) |
| `DET.A11Y.GENERIC.PAUSE_STOP_HIDE` | Pause/stop for moving content (**2.2.2**) |
| `DET.A11Y.GENERIC.LINK_PURPOSE` | Link text and purpose (**2.4.4**) |
| `DET.A11Y.GENERIC.LANG_OF_PARTS` | `lang` on foreign-language blocks (**3.1.2**) |
| `DET.A11Y.GENERIC.LABELS_INSTRUCTIONS` | Labels and form instructions (**3.3.2**) |
| `DET.A11Y.GENERIC.PAGE_LOCATION` | Breadcrumb / location (**2.4.8** AAA) |
| `DET.A11Y.GENERIC.MEDIA_TRACKS` | Supplemental media/caption hints (**1.2.x**, manual catalog) |
| `DET.A11Y.GENERIC.AUTOPLAY_AUDIO` | Autoplay audio (**1.4.2**, supplemental) |
| `DET.A11Y.GENERIC.TIMING` | Time limits and meta refresh (**2.2.1**, supplemental) |
| `DET.A11Y.GENERIC.SENSORY_CUES` | Sensory-only instructions (**1.3.3**, supplemental) |
| `DET.A11Y.GENERIC.ERROR_PREVENTION` | Legal/financial confirm steps (**3.3.4**, supplemental) |
| `DET.A11Y.GENERIC.MULTIPLE_WAYS` | Nav/search/sitemap heuristics (**2.4.5**, supplemental) |
| `DET.A11Y.GENERIC.ORIENTATION` | Orientation not locked (**1.3.4**, WCAG 2.1) |
| `DET.A11Y.GENERIC.INPUT_PURPOSE` | `autocomplete` on common personal-data fields (**1.3.5**) |
| `DET.A11Y.GENERIC.TEXT_SPACING` | Clipping / fixed spacing heuristics (**1.4.12**) |
| `DET.A11Y.GENERIC.LABEL_IN_NAME` | Visible label substring in accessible name (**2.5.3**) |
| `DET.A11Y.GENERIC.POINTER_GESTURES` | Touch-only handlers without click alt (**2.5.1**, supplemental) |
| `DET.A11Y.GENERIC.CONCURRENT_INPUT` | Input modality restrictions (**2.5.6** AAA, supplemental) |
| `DET.A11Y.GENERIC.NON_TEXT_CONTRAST` | Non-text UI contrast samples (**1.4.11**) |
| `DET.A11Y.GENERIC.HOVER_FOCUS_CONTENT` | Hover/focus content persistence (**1.4.13**) |
| `DET.A11Y.GENERIC.CHARACTER_SHORTCUTS` | Single-character shortcuts (**2.1.4**) |
| `DET.A11Y.GENERIC.POINTER_CANCELLATION` | Pointer cancellation (**2.5.2**) |
| `DET.A11Y.GENERIC.MOTION_ACTUATION` | Motion actuation (**2.5.4**) |
| `DET.A11Y.GENERIC.STATUS_MESSAGES` | Status message roles / live regions (**4.1.3**) |
| `DET.A11Y.GENERIC.CONTRAST_ENHANCED` | Enhanced contrast samples (**1.4.6** AAA) |

**WCAG 2.0 SC 4.1.1 Parsing** — obsolete for HTML5; catalog marks `manual_only`. Rely on axe and well-formed DOM; no dedicated DET rule.

**Supplemental** rules (media, timing, sensory, etc.) keep catalog `manual_only`; they emit **warnings** only and do not claim conformance.

## Kitchen Sink (`DET.A11Y.KS.*`)

| Rule ID | Check |
|---------|--------|
| `DET.A11Y.KS.HASH_MARKERS` | `hash` + `data-ks-hash` on visual roots |
| `DET.A11Y.KS.BREADCRUMB` | Handbook breadcrumb chrome (`Kbc`) |
| `DET.A11Y.KS.REACT_A11Y_ROLE` | React primitives expose ARIA roles |
| `DET.A11Y.KS.PY_HASH_ATTRS` | Python emitters use `ks_hash_attrs` helpers |
| `DET.A11Y.KS.HANDBOOK_SINGLE_H1` | One `h1` in handbook chapter layout |

Implementations live under `tools/website-a11y-auditor/design-rules/deterministic/generated/`.
