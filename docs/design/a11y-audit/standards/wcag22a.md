---
profileId: wcag22a
label: "WCAG  Level"
wcagVersion: ""
level: ""
packJson: tools/website-a11y-auditor/design-rules/standards-packs/wcag22a.pack.json
generatedAt: 2026-05-28T08:29:08.566Z
---

# wcag22a

> Automated axe and deterministic checks do not constitute legal conformance, ADA certification, VPAT completion, or WCAG sign-off. Pair with manual testing and, when needed, forge-accessibility Studio evidence.

Standards pack: [`tools/website-a11y-auditor/design-rules/standards-packs/wcag22a.pack.json`](../../../../tools/website-a11y-auditor/design-rules/standards-packs/wcag22a.pack.json)

## Summary

| Metric | Count |
|--------|------:|
| Total criteria | 31 |
| Covered (axe and/or DET/AI) | 22 |
| Manual expected | 9 |
| Uncovered | 0 |
| Untied Forge rules | 0 |
| Axe rules in profile | 62 |
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
| **1.1.1** | Non-text Content | axe+det | covered | 7 | `DET.A11Y.GENERIC.IMAGES_ALT` (patch_diagram_alt), `DET.A11Y.GENERIC.DIAGRAM_ALT` (patch_diagram_alt) | — | [md](../../wcag/2.2/sc/1.1.1-non-text-content.md) |
| **1.2.1** | Audio-only and Video-only (Prerecorded) | axe+det+manual_ai | manual_expected | 1 | `DET.A11Y.GENERIC.MEDIA_TRACKS` (patch_diagram_alt) | `AI.A11Y.GENERIC.MEDIA_ALTERNATIVES` (remediation_note) | [md](../../wcag/2.2/sc/1.2.1-audio-only-and-video-only-prerecorded.md) |
| **1.2.2** | Captions (Prerecorded) | axe+det+manual_ai | manual_expected | 1 | `DET.A11Y.GENERIC.MEDIA_TRACKS` (patch_diagram_alt) | `AI.A11Y.GENERIC.MEDIA_ALTERNATIVES` (remediation_note) | [md](../../wcag/2.2/sc/1.2.2-captions-prerecorded.md) |
| **1.2.3** | Audio Description or Media Alternative (Prerecor | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.MEDIA_TRACKS` (patch_diagram_alt) | `AI.A11Y.GENERIC.MEDIA_ALTERNATIVES` (remediation_note) | [md](../../wcag/2.2/sc/1.2.3-audio-description-or-media-alternative-prerecorded.md) |
| **1.2.4** | Captions (Live) | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.MEDIA_TRACKS` (patch_diagram_alt) | `AI.A11Y.GENERIC.MEDIA_ALTERNATIVES` (remediation_note) | [md](../../wcag/2.2/sc/1.2.4-captions-live.md) |
| **1.3.1** | Info and Relationships | axe+det+manual_ai | covered | 12 | `DET.A11Y.GENERIC.LANDMARKS` (patch_landmarks), `DET.A11Y.GENERIC.DATA_TABLE_HEADERS` (patch_data_table) | `AI.A11Y.KS.REGION_LABELING` (remediation_note) | [md](../../wcag/2.2/sc/1.3.1-info-and-relationships.md) |
| **1.3.2** | Meaningful Sequence | det | covered | — | `DET.A11Y.GENERIC.READING_ORDER` (patch_landmarks) | — | [md](../../wcag/2.2/sc/1.3.2-meaningful-sequence.md) |
| **1.3.3** | Sensory Characteristics | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.SENSORY_CUES` (patch_cta_label) | `AI.A11Y.GENERIC.SENSORY_INSTRUCTIONS` (remediation_note) | [md](../../wcag/2.2/sc/1.3.3-sensory-characteristics.md) |
| **1.4.1** | Use of Color | axe+det | covered | 1 | `DET.A11Y.GENERIC.USE_OF_COLOR` (patch_cta_label) | — | [md](../../wcag/2.2/sc/1.4.1-use-of-color.md) |
| **1.4.2** | Audio Control | axe+det+manual_ai | manual_expected | 1 | `DET.A11Y.GENERIC.AUTOPLAY_AUDIO` (patch_motion_flash) | `AI.A11Y.GENERIC.AUDIO_CONTROL` (ai_apply_audio_control) | [md](../../wcag/2.2/sc/1.4.2-audio-control.md) |
| **2.1.1** | Keyboard | axe+det+manual_ai | covered | 3 | `DET.A11Y.GENERIC.KEYBOARD_ACCESS` (patch_landmarks) | `AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` (remediation_note) | [md](../../wcag/2.2/sc/2.1.1-keyboard.md) |
| **2.1.2** | No Keyboard Trap | det+manual_ai | covered | — | `DET.A11Y.GENERIC.APP_FOCUS_TRAP` (patch_app_focus_trap) | `AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` (remediation_note) | [md](../../wcag/2.2/sc/2.1.2-no-keyboard-trap.md) |
| **2.1.4** | Character Key Shortcuts | det | covered | — | `DET.A11Y.GENERIC.CHARACTER_SHORTCUTS` (patch_page_mode) | — | [md](../../wcag/2.2/sc/2.1.4-character-key-shortcuts.md) |
| **2.2.1** | Timing Adjustable | axe+det+manual_ai | manual_expected | 1 | `DET.A11Y.GENERIC.TIMING` (patch_motion_reduced) | `AI.A11Y.GENERIC.TIMING_ADJUSTABLE` (remediation_note) | [md](../../wcag/2.2/sc/2.2.1-timing-adjustable.md) |
| **2.2.2** | Pause, Stop, Hide | axe+det | covered | 2 | `DET.A11Y.GENERIC.PAUSE_STOP_HIDE` (patch_motion_flash) | — | [md](../../wcag/2.2/sc/2.2.2-pause-stop-hide.md) |
| **2.3.1** | Three Flashes or Below Threshold | det | covered | — | `DET.A11Y.GENERIC.MOTION_FLASH` (patch_motion_flash) | — | [md](../../wcag/2.2/sc/2.3.1-three-flashes-or-below-threshold.md) |
| **2.4.1** | Bypass Blocks | axe+det | covered | 1 | `DET.A11Y.GENERIC.LANDMARKS` (patch_landmarks) | — | [md](../../wcag/2.2/sc/2.4.1-bypass-blocks.md) |
| **2.4.2** | Page Titled | axe+det | covered | 1 | `DET.A11Y.GENERIC.TITLE` (patch_page_title) | — | [md](../../wcag/2.2/sc/2.4.2-page-titled.md) |
| **2.4.3** | Focus Order | det+manual_ai | covered | — | `DET.A11Y.GENERIC.FOCUS_ORDER` (patch_landmarks), `DET.A11Y.GENERIC.APP_FOCUS_TRAP` (patch_app_focus_trap) | `AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` (remediation_note) | [md](../../wcag/2.2/sc/2.4.3-focus-order.md) |
| **2.4.4** | Link Purpose (In Context) | axe+det+manual_ai | covered | 2 | `DET.A11Y.GENERIC.LINK_PURPOSE` (patch_cta_label) | `AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS` (remediation_note) | [md](../../wcag/2.2/sc/2.4.4-link-purpose-in-context.md) |
| **2.5.1** | Pointer Gestures | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.POINTER_GESTURES` (patch_cta_label) | `AI.A11Y.GENERIC.POINTER_GESTURES_JUDGMENT` (remediation_note) | [md](../../wcag/2.2/sc/2.5.1-pointer-gestures.md) |
| **2.5.2** | Pointer Cancellation | det | covered | — | `DET.A11Y.GENERIC.POINTER_CANCELLATION` (patch_cta_label) | — | [md](../../wcag/2.2/sc/2.5.2-pointer-cancellation.md) |
| **2.5.3** | Label in Name | axe+det | covered | 1 | `DET.A11Y.GENERIC.LABEL_IN_NAME` (patch_cta_label) | — | [md](../../wcag/2.2/sc/2.5.3-label-in-name.md) |
| **2.5.4** | Motion Actuation | det | covered | — | `DET.A11Y.GENERIC.MOTION_ACTUATION` (patch_motion_reduced) | — | [md](../../wcag/2.2/sc/2.5.4-motion-actuation.md) |
| **3.1.1** | Language of Page | axe+det | covered | 3 | `DET.A11Y.GENERIC.LANG` (patch_page_lang) | — | [md](../../wcag/2.2/sc/3.1.1-language-of-page.md) |
| **3.2.1** | On Focus | det | covered | — | `DET.A11Y.GENERIC.FOCUS_CONTEXT_CHANGE` (patch_app_focus_trap) | — | [md](../../wcag/2.2/sc/3.2.1-on-focus.md) |
| **3.2.2** | On Input | det | covered | — | `DET.A11Y.GENERIC.INPUT_CONTEXT_CHANGE` (patch_app_focus_trap) | — | [md](../../wcag/2.2/sc/3.2.2-on-input.md) |
| **3.3.1** | Error Identification | manual_ai | covered | — | — | `AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION` (ai_apply_form_error) | [md](../../wcag/2.2/sc/3.3.1-error-identification.md) |
| **3.3.2** | Labels or Instructions | axe+det | covered | 1 | `DET.A11Y.GENERIC.LABELS_INSTRUCTIONS` (patch_cta_label) | — | [md](../../wcag/2.2/sc/3.3.2-labels-or-instructions.md) |
| **4.1.1** | Parsing | manual_catalog | manual_expected | — | — | — | [md](../../wcag/2.2/sc/4.1.1-parsing.md) |
| **4.1.2** | Name, Role, Value | axe+det+manual_ai | covered | 28 | `DET.A11Y.KS.HASH_MARKERS` (hash_markers), `DET.A11Y.KS.REACT_A11Y_ROLE` (patch_landmarks), `DET.A11Y.KS.PY_HASH_ATTRS` (repo_production) | `AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS` (remediation_note), `AI.A11Y.KS.REGION_LABELING` (remediation_note) | [md](../../wcag/2.2/sc/4.1.2-name-role-value.md) |

## Manual test playbooks

Criteria marked **manual_expected** require human verification even when axe/DET/AI mappings exist. Use the WCAG reference page in the table above for normative detail.

### 1.2.1 — Audio-only and Video-only (Prerecorded)

Reference: [WCAG reference](../../wcag/2.2/sc/1.2.1-audio-only-and-video-only-prerecorded.md)

1. Identify pages and components in scope for this criterion.
2. Complete the primary task flow with keyboard only.
3. Spot-check with at least one screen reader (names, roles, states).
4. For media/time-based content, verify controls and alternatives manually.
5. Log pass/fail and evidence in the audit report (not automated sign-off).

### 1.2.2 — Captions (Prerecorded)

Reference: [WCAG reference](../../wcag/2.2/sc/1.2.2-captions-prerecorded.md)

1. Identify pages and components in scope for this criterion.
2. Complete the primary task flow with keyboard only.
3. Spot-check with at least one screen reader (names, roles, states).
4. For media/time-based content, verify controls and alternatives manually.
5. Log pass/fail and evidence in the audit report (not automated sign-off).

### 1.2.3 — Audio Description or Media Alternative (Prerecorded)

Reference: [WCAG reference](../../wcag/2.2/sc/1.2.3-audio-description-or-media-alternative-prerecorded.md)

1. Identify pages and components in scope for this criterion.
2. Complete the primary task flow with keyboard only.
3. Spot-check with at least one screen reader (names, roles, states).
4. For media/time-based content, verify controls and alternatives manually.
5. Log pass/fail and evidence in the audit report (not automated sign-off).

### 1.2.4 — Captions (Live)

Reference: [WCAG reference](../../wcag/2.2/sc/1.2.4-captions-live.md)

1. Identify pages and components in scope for this criterion.
2. Complete the primary task flow with keyboard only.
3. Spot-check with at least one screen reader (names, roles, states).
4. For media/time-based content, verify controls and alternatives manually.
5. Log pass/fail and evidence in the audit report (not automated sign-off).

### 1.3.3 — Sensory Characteristics

Reference: [WCAG reference](../../wcag/2.2/sc/1.3.3-sensory-characteristics.md)

1. Identify pages and components in scope for this criterion.
2. Complete the primary task flow with keyboard only.
3. Spot-check with at least one screen reader (names, roles, states).
4. For media/time-based content, verify controls and alternatives manually.
5. Log pass/fail and evidence in the audit report (not automated sign-off).

### 1.4.2 — Audio Control

Reference: [WCAG reference](../../wcag/2.2/sc/1.4.2-audio-control.md)

1. Identify pages and components in scope for this criterion.
2. Complete the primary task flow with keyboard only.
3. Spot-check with at least one screen reader (names, roles, states).
4. For media/time-based content, verify controls and alternatives manually.
5. Log pass/fail and evidence in the audit report (not automated sign-off).

### 2.2.1 — Timing Adjustable

Reference: [WCAG reference](../../wcag/2.2/sc/2.2.1-timing-adjustable.md)

1. Identify pages and components in scope for this criterion.
2. Complete the primary task flow with keyboard only.
3. Spot-check with at least one screen reader (names, roles, states).
4. For media/time-based content, verify controls and alternatives manually.
5. Log pass/fail and evidence in the audit report (not automated sign-off).

### 2.5.1 — Pointer Gestures

Reference: [WCAG reference](../../wcag/2.2/sc/2.5.1-pointer-gestures.md)

1. Identify pages and components in scope for this criterion.
2. Complete the primary task flow with keyboard only.
3. Spot-check with at least one screen reader (names, roles, states).
4. For media/time-based content, verify controls and alternatives manually.
5. Log pass/fail and evidence in the audit report (not automated sign-off).

### 4.1.1 — Parsing

Reference: [WCAG reference](../../wcag/2.2/sc/4.1.1-parsing.md)

1. Identify pages and components in scope for this criterion.
2. Complete the primary task flow with keyboard only.
3. Spot-check with at least one screen reader (names, roles, states).
4. For media/time-based content, verify controls and alternatives manually.
5. Log pass/fail and evidence in the audit report (not automated sign-off).

## Gap lists

See [standards-traceability-gaps.md](../standards-traceability-gaps.md) for full uncovered/manual/untied lists.

### Forge-only rules

- `DET.A11Y.KS.HASH_MARKERS`
- `DET.A11Y.KS.PY_HASH_ATTRS`

