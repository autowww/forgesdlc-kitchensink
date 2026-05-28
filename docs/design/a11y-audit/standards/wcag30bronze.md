---
profileId: wcag30bronze
label: "WCAG 3.0 bronze"
wcagVersion: "3.0"
level: "bronze"
packJson: tools/website-a11y-auditor/design-rules/standards-packs/wcag30bronze.pack.json
generatedAt: 2026-05-28T06:40:12.366Z
---

# wcag30bronze

> Automated axe and deterministic checks do not constitute legal conformance, ADA certification, VPAT completion, or WCAG sign-off. Pair with manual testing and, when needed, forge-accessibility Studio evidence.

Standards pack: [`tools/website-a11y-auditor/design-rules/standards-packs/wcag30bronze.pack.json`](../../../../tools/website-a11y-auditor/design-rules/standards-packs/wcag30bronze.pack.json)

## Summary

| Metric | Count |
|--------|------:|
| Total criteria | 37 |
| Covered (axe and/or DET/AI) | 32 |
| Manual expected | 5 |
| Uncovered | 0 |
| Untied Forge rules | 0 |
| Axe rules in profile | 69 |
| DET rules in registry (profile scope) | 68 |
| AI rules in registry | 21 |

## Runtime tooling

| Role | CLI / module | Default lanes / notes |
|------|--------------|-------------------------|
| **Auditor** | `analyze-website-a11y.mjs` | `axe,det`; add `ai` to `--lanes` when agent available |
| **AI auditor** | `run-website-a11y-ai-audit.mjs` | After analyze; requires agent |
| **Compliance scorer** | `score-compliance-a11y.mjs` | Per-SC rollup + `failingByLane` (axe/det/ai) |
| **Quality scorer** | `score-website-a11y.mjs` | Severity + `buildComplianceReport` (`--include-compliance` default on) |
| **DET remediation** | `run-deterministic-fixers.mjs` | Uses `pilot-registry.json` fixerId per rule |
| **AI remediation** | `run-ai-fixers.mjs` | Uses `ai-fixer-registry.json` |

## Criteria traceability

| Criterion | Title | Coverage | Gap | axe | DET (fixer) | AI (fixer) | Doc |
|-----------|-------|----------|-----|-----|-------------|------------|-----|
| **WCAG3-REQ-AD** | Audio description or media alternative | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.MEDIA_TRACKS` (patch_diagram_alt) | `AI.A11Y.GENERIC.MEDIA_ALTERNATIVES` (remediation_note) | [md](../../wcag/3.0/outcomes/wcag3-req-ad-audio-description-or-media-alternative.md) |
| **WCAG3-REQ-CAPTIONS** | Captions for prerecorded audio | axe+det+manual_ai | manual_expected | 1 | `DET.A11Y.GENERIC.MEDIA_TRACKS` (patch_diagram_alt) | `AI.A11Y.GENERIC.MEDIA_ALTERNATIVES` (remediation_note) | [md](../../wcag/3.0/outcomes/wcag3-req-captions-captions-for-prerecorded-audio.md) |
| **WCAG3-REQ-CHAR-SHORTCUTS** | Character key shortcuts | det | covered | — | `DET.A11Y.GENERIC.CHARACTER_SHORTCUTS` (handbook_after) | — | [md](../../wcag/3.0/outcomes/wcag3-req-char-shortcuts-character-key-shortcuts.md) |
| **WCAG3-REQ-CONTRAST-TEXT** | Text contrast (minimum) | axe+det | covered | 1 | `DET.A11Y.GENERIC.CONTRAST` (patch_page_mode) | — | [md](../../wcag/3.0/outcomes/wcag3-req-contrast-text-text-contrast-minimum.md) |
| **WCAG3-REQ-ERROR-ID** | Error identification | manual_ai | covered | — | — | `AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION` (remediation_note) | [md](../../wcag/3.0/outcomes/wcag3-req-error-id-error-identification.md) |
| **WCAG3-REQ-ERROR-SUGGEST** | Error suggestions | manual_ai | covered | — | — | `AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION` (remediation_note) | [md](../../wcag/3.0/outcomes/wcag3-req-error-suggest-error-suggestions.md) |
| **WCAG3-REQ-FOCUS-OBSCURED** | Focus not obscured | det | covered | — | `DET.A11Y.GENERIC.FOCUS_NOT_OBSCURED` (patch_ambient_z) | — | [md](../../wcag/3.0/outcomes/wcag3-req-focus-obscured-focus-not-obscured.md) |
| **WCAG3-REQ-FOCUS-ORDER** | Focus order | det+manual_ai | covered | — | `DET.A11Y.GENERIC.FOCUS_ORDER` (patch_landmarks), `DET.A11Y.GENERIC.APP_FOCUS_TRAP` (patch_app_focus_trap) | `AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` (plan_only) | [md](../../wcag/3.0/outcomes/wcag3-req-focus-order-focus-order.md) |
| **WCAG3-REQ-FOCUS-VISIBLE** | Focus visible | manual_ai | covered | — | — | `AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` (plan_only) | [md](../../wcag/3.0/outcomes/wcag3-req-focus-visible-focus-visible.md) |
| **WCAG3-REQ-HEADINGS** | Headings describe sections | det | covered | — | `DET.A11Y.KS.HANDBOOK_SINGLE_H1` (patch_section_heading) | — | [md](../../wcag/3.0/outcomes/wcag3-req-headings-headings-describe-sections.md) |
| **WCAG3-REQ-INFO-STRUCTURE** | Information and structure programmatically avail | axe+det+manual_ai | covered | 12 | `DET.A11Y.GENERIC.LANDMARKS` (patch_landmarks), `DET.A11Y.GENERIC.DATA_TABLE_HEADERS` (patch_data_table) | `AI.A11Y.KS.REGION_LABELING` (remediation_note) | [md](../../wcag/3.0/outcomes/wcag3-req-info-structure-information-and-structure-programmatically-available.md) |
| **WCAG3-REQ-INPUT-PURPOSE** | Input purpose identified | axe+det | covered | 1 | `DET.A11Y.GENERIC.INPUT_PURPOSE` (patch_page_mode) | — | [md](../../wcag/3.0/outcomes/wcag3-req-input-purpose-input-purpose-identified.md) |
| **WCAG3-REQ-KEYWORD** | Keyboard operable | axe+det+manual_ai | covered | 3 | `DET.A11Y.GENERIC.KEYBOARD_ACCESS` (patch_landmarks) | `AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` (plan_only) | [md](../../wcag/3.0/outcomes/wcag3-req-keyword-keyboard-operable.md) |
| **WCAG3-REQ-LABELS** | Labels and instructions | axe+det | covered | 1 | `DET.A11Y.GENERIC.LABELS_INSTRUCTIONS` (patch_cta_label) | — | [md](../../wcag/3.0/outcomes/wcag3-req-labels-labels-and-instructions.md) |
| **WCAG3-REQ-LANG** | Page language | axe+det | covered | 3 | `DET.A11Y.GENERIC.LANG` (patch_page_lang) | — | [md](../../wcag/3.0/outcomes/wcag3-req-lang-page-language.md) |
| **WCAG3-REQ-LANG-PARTS** | Language of parts | axe+det | covered | 1 | `DET.A11Y.GENERIC.LANG_OF_PARTS` (handbook_after) | — | [md](../../wcag/3.0/outcomes/wcag3-req-lang-parts-language-of-parts.md) |
| **WCAG3-REQ-LINK-PURPOSE** | Link purpose in context | axe+det+manual_ai | covered | 2 | `DET.A11Y.GENERIC.LINK_PURPOSE` (patch_cta_label) | `AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS` (remediation_note) | [md](../../wcag/3.0/outcomes/wcag3-req-link-purpose-link-purpose-in-context.md) |
| **WCAG3-REQ-MEANINGFUL-SEQUENCE** | Meaningful sequence | det | covered | — | `DET.A11Y.GENERIC.READING_ORDER` (patch_landmarks) | — | [md](../../wcag/3.0/outcomes/wcag3-req-meaningful-sequence-meaningful-sequence.md) |
| **WCAG3-REQ-NAME-ROLE-VALUE** | Name, role, value | axe+det+manual_ai | covered | 28 | `DET.A11Y.KS.HASH_MARKERS` (hash_markers), `DET.A11Y.KS.REACT_A11Y_ROLE` (patch_landmarks), `DET.A11Y.KS.PY_HASH_ATTRS` (repo_production) | `AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS` (remediation_note), `AI.A11Y.KS.REGION_LABELING` (remediation_note) | [md](../../wcag/3.0/outcomes/wcag3-req-name-role-value-name-role-value.md) |
| **WCAG3-REQ-NO-KB-TRAP** | No keyboard trap | det+manual_ai | covered | — | `DET.A11Y.GENERIC.APP_FOCUS_TRAP` (patch_app_focus_trap) | `AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` (plan_only) | [md](../../wcag/3.0/outcomes/wcag3-req-no-kb-trap-no-keyboard-trap.md) |
| **WCAG3-REQ-NON-TEXT-CONTRAST** | Non-text contrast | det | covered | — | `DET.A11Y.GENERIC.NON_TEXT_CONTRAST` (patch_page_mode) | — | [md](../../wcag/3.0/outcomes/wcag3-req-non-text-contrast-non-text-contrast.md) |
| **WCAG3-REQ-ON-Focus** | On focus no unexpected context change | det | covered | — | `DET.A11Y.GENERIC.FOCUS_CONTEXT_CHANGE` (patch_app_focus_trap) | — | [md](../../wcag/3.0/outcomes/wcag3-req-on-focus-on-focus-no-unexpected-context-change.md) |
| **WCAG3-REQ-ON-INPUT** | On input no unexpected context change | det | covered | — | `DET.A11Y.GENERIC.INPUT_CONTEXT_CHANGE` (patch_app_focus_trap) | — | [md](../../wcag/3.0/outcomes/wcag3-req-on-input-on-input-no-unexpected-context-change.md) |
| **WCAG3-REQ-ORIENTATION** | Display orientation not restricted | axe+det | covered | 1 | `DET.A11Y.GENERIC.ORIENTATION` (patch_page_viewport) | — | [md](../../wcag/3.0/outcomes/wcag3-req-orientation-display-orientation-not-restricted.md) |
| **WCAG3-REQ-PAGE-TITLE** | Page titled | axe+det | covered | 1 | `DET.A11Y.GENERIC.TITLE` (patch_page_title) | — | [md](../../wcag/3.0/outcomes/wcag3-req-page-title-page-titled.md) |
| **WCAG3-REQ-PAUSE** | Pause, stop, hide moving content | axe+det | covered | 2 | `DET.A11Y.GENERIC.PAUSE_STOP_HIDE` (handbook_after) | — | [md](../../wcag/3.0/outcomes/wcag3-req-pause-pause-stop-hide-moving-content.md) |
| **WCAG3-REQ-POINTER-GESTURES** | Pointer gestures have single-pointer alternative | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.POINTER_GESTURES` (patch_cta_label) | `AI.A11Y.GENERIC.POINTER_GESTURES_JUDGMENT` (remediation_note) | [md](../../wcag/3.0/outcomes/wcag3-req-pointer-gestures-pointer-gestures-have-single-pointer-alternative.md) |
| **WCAG3-REQ-REFLOW** | Reflow without horizontal scroll | det | covered | — | `DET.A11Y.GENERIC.VIEWPORT` (patch_page_viewport) | — | [md](../../wcag/3.0/outcomes/wcag3-req-reflow-reflow-without-horizontal-scroll.md) |
| **WCAG3-REQ-RESIZE** | Resize text | axe+det | covered | 1 | `DET.A11Y.GENERIC.RESIZE_TEXT` (patch_page_viewport) | — | [md](../../wcag/3.0/outcomes/wcag3-req-resize-resize-text.md) |
| **WCAG3-REQ-SEIZURE** | Three flashes or below threshold | det | covered | — | `DET.A11Y.GENERIC.MOTION_FLASH` (patch_motion_flash) | — | [md](../../wcag/3.0/outcomes/wcag3-req-seizure-three-flashes-or-below-threshold.md) |
| **WCAG3-REQ-SENSORY** | Instructions not sensory-only | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.SENSORY_CUES` (patch_cta_label) | `AI.A11Y.GENERIC.SENSORY_INSTRUCTIONS` (remediation_note) | [md](../../wcag/3.0/outcomes/wcag3-req-sensory-instructions-not-sensory-only.md) |
| **WCAG3-REQ-SKIP** | Bypass blocks / skip links | axe+det | covered | 1 | `DET.A11Y.GENERIC.LANDMARKS` (patch_landmarks) | — | [md](../../wcag/3.0/outcomes/wcag3-req-skip-bypass-blocks-skip-links.md) |
| **WCAG3-REQ-STATUS** | Status messages | det | covered | — | `DET.A11Y.GENERIC.STATUS_MESSAGES` (patch_section_heading) | — | [md](../../wcag/3.0/outcomes/wcag3-req-status-status-messages.md) |
| **WCAG3-REQ-TARGET-SIZE** | Target size minimum | axe+det | covered | 1 | `DET.A11Y.GENERIC.TARGET_SIZE_MIN` (patch_page_viewport) | — | [md](../../wcag/3.0/outcomes/wcag3-req-target-size-target-size-minimum.md) |
| **WCAG3-REQ-TEXT-ALT** | Text alternatives for non-text content | axe+det | covered | 7 | `DET.A11Y.GENERIC.IMAGES_ALT` (patch_diagram_alt), `DET.A11Y.GENERIC.DIAGRAM_ALT` (patch_diagram_alt) | — | [md](../../wcag/3.0/outcomes/wcag3-req-text-alt-text-alternatives-for-non-text-content.md) |
| **WCAG3-REQ-TEXT-SPACING** | Text spacing adjustable | axe+det | covered | 1 | `DET.A11Y.GENERIC.TEXT_SPACING` (patch_page_mode) | — | [md](../../wcag/3.0/outcomes/wcag3-req-text-spacing-text-spacing-adjustable.md) |
| **WCAG3-REQ-TIMING** | Timing adjustable | axe+det+manual_ai | manual_expected | 1 | `DET.A11Y.GENERIC.TIMING` (patch_motion_reduced) | `AI.A11Y.GENERIC.TIMING_ADJUSTABLE` (remediation_note) | [md](../../wcag/3.0/outcomes/wcag3-req-timing-timing-adjustable.md) |

## Gap lists

See [standards-traceability-gaps.md](../standards-traceability-gaps.md) for full uncovered/manual/untied lists.

### Forge-only rules

- `DET.A11Y.KS.HASH_MARKERS`
- `DET.A11Y.KS.PY_HASH_ATTRS`

