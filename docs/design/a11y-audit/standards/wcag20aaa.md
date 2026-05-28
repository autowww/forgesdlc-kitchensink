---
profileId: wcag20aaa
label: "WCAG  Level"
wcagVersion: ""
level: ""
packJson: tools/website-a11y-auditor/design-rules/standards-packs/wcag20aaa.pack.json
generatedAt: 2026-05-28T06:40:12.364Z
---

# wcag20aaa

> Automated axe and deterministic checks do not constitute legal conformance, ADA certification, VPAT completion, or WCAG sign-off. Pair with manual testing and, when needed, forge-accessibility Studio evidence.

Standards pack: [`tools/website-a11y-auditor/design-rules/standards-packs/wcag20aaa.pack.json`](../../../../tools/website-a11y-auditor/design-rules/standards-packs/wcag20aaa.pack.json)

## Summary

| Metric | Count |
|--------|------:|
| Total criteria | 61 |
| Covered (axe and/or DET/AI) | 31 |
| Manual expected | 30 |
| Uncovered | 0 |
| Untied Forge rules | 0 |
| Axe rules in profile | 67 |
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
| **1.2.5** | Audio Description (Prerecorded) | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.MEDIA_TRACKS` (patch_diagram_alt) | `AI.A11Y.GENERIC.MEDIA_ALTERNATIVES` (remediation_note) | [md](../../wcag/2.2/sc/1.2.5-audio-description-prerecorded.md) |
| **1.2.6** | Sign Language (Prerecorded) | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.MEDIA_TRACKS` (patch_diagram_alt) | `AI.A11Y.GENERIC.MEDIA_ALTERNATIVES` (remediation_note) | — |
| **1.2.7** | Extended Audio Description (Prerecorded) | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.MEDIA_TRACKS` (patch_diagram_alt) | `AI.A11Y.GENERIC.MEDIA_ALTERNATIVES` (remediation_note) | — |
| **1.2.8** | Media Alternative (Prerecorded) | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.MEDIA_TRACKS` (patch_diagram_alt) | `AI.A11Y.GENERIC.MEDIA_ALTERNATIVES` (remediation_note) | — |
| **1.2.9** | Audio-only (Live) | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.MEDIA_TRACKS` (patch_diagram_alt) | `AI.A11Y.GENERIC.MEDIA_ALTERNATIVES` (remediation_note) | — |
| **1.3.1** | Info and Relationships | axe+det+manual_ai | covered | 12 | `DET.A11Y.GENERIC.LANDMARKS` (patch_landmarks), `DET.A11Y.GENERIC.DATA_TABLE_HEADERS` (patch_data_table) | `AI.A11Y.KS.REGION_LABELING` (remediation_note) | [md](../../wcag/2.2/sc/1.3.1-info-and-relationships.md) |
| **1.3.2** | Meaningful Sequence | det | covered | — | `DET.A11Y.GENERIC.READING_ORDER` (patch_landmarks) | — | [md](../../wcag/2.2/sc/1.3.2-meaningful-sequence.md) |
| **1.3.3** | Sensory Characteristics | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.SENSORY_CUES` (patch_cta_label) | `AI.A11Y.GENERIC.SENSORY_INSTRUCTIONS` (remediation_note) | [md](../../wcag/2.2/sc/1.3.3-sensory-characteristics.md) |
| **1.4.1** | Use of Color | axe+det | covered | 1 | `DET.A11Y.GENERIC.USE_OF_COLOR` (patch_cta_label) | — | [md](../../wcag/2.2/sc/1.4.1-use-of-color.md) |
| **1.4.2** | Audio Control | axe+det+manual_ai | manual_expected | 1 | `DET.A11Y.GENERIC.AUTOPLAY_AUDIO` (patch_motion_flash) | `AI.A11Y.GENERIC.AUDIO_CONTROL` (plan_only) | [md](../../wcag/2.2/sc/1.4.2-audio-control.md) |
| **1.4.3** | Contrast (Minimum) | axe+det | covered | 1 | `DET.A11Y.GENERIC.CONTRAST` (patch_page_mode) | — | [md](../../wcag/2.2/sc/1.4.3-contrast-minimum.md) |
| **1.4.4** | Resize Text | axe+det | covered | 1 | `DET.A11Y.GENERIC.RESIZE_TEXT` (patch_page_viewport) | — | [md](../../wcag/2.2/sc/1.4.4-resize-text.md) |
| **1.4.5** | Images of Text | det | covered | — | `DET.A11Y.GENERIC.IMAGES_OF_TEXT` (patch_diagram_alt) | — | [md](../../wcag/2.2/sc/1.4.5-images-of-text.md) |
| **1.4.6** | Contrast (Enhanced) | axe+det | covered | 1 | `DET.A11Y.GENERIC.CONTRAST_ENHANCED` (patch_page_mode) | — | — |
| **1.4.7** | Low or No Background Audio | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.LOW_BACKGROUND_AUDIO` (patch_motion_flash) | `AI.A11Y.GENERIC.AUDIO_CONTROL` (plan_only) | — |
| **1.4.8** | Visual Presentation | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.VISUAL_PRESENTATION_AAA` (patch_page_mode) | `AI.A11Y.GENERIC.VISUAL_PRESENTATION` (remediation_note) | — |
| **1.4.9** | Images of Text (No Exception) | det | covered | — | `DET.A11Y.GENERIC.IMAGES_OF_TEXT` (patch_diagram_alt) | — | — |
| **2.1.1** | Keyboard | axe+det+manual_ai | covered | 3 | `DET.A11Y.GENERIC.KEYBOARD_ACCESS` (patch_landmarks) | `AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` (plan_only) | [md](../../wcag/2.2/sc/2.1.1-keyboard.md) |
| **2.1.2** | No Keyboard Trap | det+manual_ai | covered | — | `DET.A11Y.GENERIC.APP_FOCUS_TRAP` (patch_app_focus_trap) | `AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` (plan_only) | [md](../../wcag/2.2/sc/2.1.2-no-keyboard-trap.md) |
| **2.1.3** | Keyboard (No Exception) | axe+det+manual_ai | manual_expected | 1 | `DET.A11Y.GENERIC.KEYBOARD_ACCESS` (patch_landmarks) | `AI.A11Y.GENERIC.KEYBOARD_NO_EXCEPTION` (plan_only) | — |
| **2.2.1** | Timing Adjustable | axe+det+manual_ai | manual_expected | 1 | `DET.A11Y.GENERIC.TIMING` (patch_motion_reduced) | `AI.A11Y.GENERIC.TIMING_ADJUSTABLE` (remediation_note) | [md](../../wcag/2.2/sc/2.2.1-timing-adjustable.md) |
| **2.2.2** | Pause, Stop, Hide | axe+det | covered | 2 | `DET.A11Y.GENERIC.PAUSE_STOP_HIDE` (handbook_after) | — | [md](../../wcag/2.2/sc/2.2.2-pause-stop-hide.md) |
| **2.2.3** | No Timing | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.TIMING` (patch_motion_reduced) | `AI.A11Y.GENERIC.TIMING_ADJUSTABLE` (remediation_note) | — |
| **2.2.4** | Interruptions | axe+det+manual_ai | manual_expected | 1 | `DET.A11Y.GENERIC.INTERRUPTIONS` (handbook_after) | `AI.A11Y.GENERIC.INTERRUPTIONS` (plan_only) | — |
| **2.2.5** | Re-authenticating | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.RE_AUTHENTICATION` (handbook_after) | `AI.A11Y.GENERIC.RE_AUTHENTICATION` (plan_only) | — |
| **2.3.1** | Three Flashes or Below Threshold | det | covered | — | `DET.A11Y.GENERIC.MOTION_FLASH` (patch_motion_flash) | — | [md](../../wcag/2.2/sc/2.3.1-three-flashes-or-below-threshold.md) |
| **2.3.2** | Three Flashes | det | covered | — | `DET.A11Y.GENERIC.FLASH_THRESHOLD` (patch_motion_flash) | — | — |
| **2.4.1** | Bypass Blocks | axe+det | covered | 1 | `DET.A11Y.GENERIC.LANDMARKS` (patch_landmarks) | — | [md](../../wcag/2.2/sc/2.4.1-bypass-blocks.md) |
| **2.4.2** | Page Titled | axe+det | covered | 1 | `DET.A11Y.GENERIC.TITLE` (patch_page_title) | — | [md](../../wcag/2.2/sc/2.4.2-page-titled.md) |
| **2.4.3** | Focus Order | det+manual_ai | covered | — | `DET.A11Y.GENERIC.FOCUS_ORDER` (patch_landmarks), `DET.A11Y.GENERIC.APP_FOCUS_TRAP` (patch_app_focus_trap) | `AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` (plan_only) | [md](../../wcag/2.2/sc/2.4.3-focus-order.md) |
| **2.4.4** | Link Purpose (In Context) | axe+det+manual_ai | covered | 2 | `DET.A11Y.GENERIC.LINK_PURPOSE` (patch_cta_label) | `AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS` (remediation_note) | [md](../../wcag/2.2/sc/2.4.4-link-purpose-in-context.md) |
| **2.4.5** | Multiple Ways | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.MULTIPLE_WAYS` (patch_nav_toc) | `AI.A11Y.GENERIC.MULTIPLE_WAYS` (plan_only) | [md](../../wcag/2.2/sc/2.4.5-multiple-ways.md) |
| **2.4.6** | Headings and Labels | det | covered | — | `DET.A11Y.KS.HANDBOOK_SINGLE_H1` (patch_section_heading) | — | [md](../../wcag/2.2/sc/2.4.6-headings-and-labels.md) |
| **2.4.7** | Focus Visible | manual_ai | covered | — | — | `AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` (plan_only) | [md](../../wcag/2.2/sc/2.4.7-focus-visible.md) |
| **2.4.8** | Location | det | manual_expected | — | `DET.A11Y.GENERIC.PAGE_LOCATION` (patch_nav_toc), `DET.A11Y.KS.BREADCRUMB` (nav_breadcrumb) | — | — |
| **2.4.9** | Link Purpose (Link Only) | axe+det | covered | 1 | `DET.A11Y.GENERIC.LINK_PURPOSE` (patch_cta_label) | — | — |
| **2.4.10** | Section Headings | det | covered | — | `DET.A11Y.GENERIC.SECTION_HEADINGS` (patch_section_heading) | — | — |
| **3.1.1** | Language of Page | axe+det | covered | 3 | `DET.A11Y.GENERIC.LANG` (patch_page_lang) | — | [md](../../wcag/2.2/sc/3.1.1-language-of-page.md) |
| **3.1.2** | Language of Parts | axe+det | covered | 1 | `DET.A11Y.GENERIC.LANG_OF_PARTS` (handbook_after) | — | [md](../../wcag/2.2/sc/3.1.2-language-of-parts.md) |
| **3.1.3** | Unusual Words | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.GLOSSARY_ABBR` (handbook_after) | `AI.A11Y.GENERIC.UNUSUAL_WORDS` (plan_only) | — |
| **3.1.4** | Abbreviations | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.GLOSSARY_ABBR` (handbook_after) | `AI.A11Y.GENERIC.UNUSUAL_WORDS` (plan_only) | — |
| **3.1.5** | Reading Level | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.READING_LEVEL_HEURISTIC` (handbook_after) | `AI.A11Y.GENERIC.READING_LEVEL` (remediation_note) | — |
| **3.1.6** | Pronunciation | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.GLOSSARY_ABBR` (handbook_after) | `AI.A11Y.GENERIC.PRONUNCIATION` (plan_only) | — |
| **3.2.1** | On Focus | det | covered | — | `DET.A11Y.GENERIC.FOCUS_CONTEXT_CHANGE` (patch_app_focus_trap) | — | [md](../../wcag/2.2/sc/3.2.1-on-focus.md) |
| **3.2.2** | On Input | det | covered | — | `DET.A11Y.GENERIC.INPUT_CONTEXT_CHANGE` (patch_app_focus_trap) | — | [md](../../wcag/2.2/sc/3.2.2-on-input.md) |
| **3.2.3** | Consistent Navigation | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.CONSISTENT_NAV` (patch_nav_toc) | `AI.A11Y.GENERIC.CONSISTENT_NAV_JUDGMENT` (remediation_note) | [md](../../wcag/2.2/sc/3.2.3-consistent-navigation.md) |
| **3.2.4** | Consistent Identification | det | covered | — | `DET.A11Y.GENERIC.CONSISTENT_LABELS` (patch_cta_label) | — | [md](../../wcag/2.2/sc/3.2.4-consistent-identification.md) |
| **3.2.5** | Change on Request | axe+det+manual_ai | manual_expected | 1 | `DET.A11Y.GENERIC.CHANGE_ON_REQUEST` (handbook_after) | `AI.A11Y.GENERIC.CHANGE_ON_REQUEST` (plan_only) | — |
| **3.3.1** | Error Identification | manual_ai | covered | — | — | `AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION` (remediation_note) | [md](../../wcag/2.2/sc/3.3.1-error-identification.md) |
| **3.3.2** | Labels or Instructions | axe+det | covered | 1 | `DET.A11Y.GENERIC.LABELS_INSTRUCTIONS` (patch_cta_label) | — | [md](../../wcag/2.2/sc/3.3.2-labels-or-instructions.md) |
| **3.3.3** | Error Suggestion | manual_ai | covered | — | — | `AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION` (remediation_note) | [md](../../wcag/2.2/sc/3.3.3-error-suggestion.md) |
| **3.3.4** | Error Prevention (Legal, Financial, Data) | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.ERROR_PREVENTION` (handbook_after) | `AI.A11Y.GENERIC.ERROR_PREVENTION` (remediation_note) | [md](../../wcag/2.2/sc/3.3.4-error-prevention-legal-financial-data.md) |
| **3.3.5** | Help | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.CONTEXT_HELP` (handbook_after) | `AI.A11Y.GENERIC.CONTEXT_HELP` (remediation_note) | — |
| **3.3.6** | Error Prevention (All) | det+manual_ai | manual_expected | — | `DET.A11Y.GENERIC.ERROR_PREVENTION` (handbook_after) | `AI.A11Y.GENERIC.ERROR_PREVENTION` (remediation_note) | — |
| **4.1.1** | Parsing | manual_catalog | manual_expected | — | — | — | [md](../../wcag/2.2/sc/4.1.1-parsing.md) |
| **4.1.2** | Name, Role, Value | axe+det+manual_ai | covered | 28 | `DET.A11Y.KS.HASH_MARKERS` (hash_markers), `DET.A11Y.KS.REACT_A11Y_ROLE` (patch_landmarks), `DET.A11Y.KS.PY_HASH_ATTRS` (repo_production) | `AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS` (remediation_note), `AI.A11Y.KS.REGION_LABELING` (remediation_note) | [md](../../wcag/2.2/sc/4.1.2-name-role-value.md) |

## Gap lists

See [standards-traceability-gaps.md](../standards-traceability-gaps.md) for full uncovered/manual/untied lists.

### Forge-only rules

- `DET.A11Y.KS.HASH_MARKERS`
- `DET.A11Y.KS.PY_HASH_ATTRS`

