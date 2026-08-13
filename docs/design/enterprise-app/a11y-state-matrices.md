# Enterprise app accessibility state matrices (ENT.APP.09)

Per-primitive **required_states** for Phase B P1 shipped hashes. Machine-readable source: [`tools/studio-ux-pdca/lib/enterprise-app-a11y-matrices.json`](../../../tools/studio-ux-pdca/lib/enterprise-app-a11y-matrices.json).

Contract: [`rules/ENT.APP.09.yaml`](rules/ENT.APP.09.yaml).

## Matrix

| Hash | Component | Required states | Keyboard notes |
|------|-----------|-----------------|----------------|
| Fes | ForgeErrorSummary | default, focus, error | Error links are focusable buttons; Enter/Space activates field jump |
| Fas | ForgeAutosaveStatus | default, loading, error, screen-reader-busy | Status region only; no interactive controls |
| Fdr | ForgeDraftRecovery | default, focus | Recover/Discard buttons in tab order; list items are not roving tabindex |
| Fsm | ForgeSavedViewManager | default, focus | View list uses `role="listbox"` / `role="option"`; arrow keys move selection when focused |
| Fop | ForgeOperationProgress | default, loading, screen-reader-busy | Non-interactive; `role="progressbar"` when running |
| Ffi | ForgeFreshnessIndicator | default, focus, loading | Refresh button is tabbable; disabled while refreshing |
| Foi | ForgeObjectInspector | default, focus | Close button first in panel; Tab cycles within panel when trap active |
| Far | ForgeAccessReason | default, focus, disabled-with-reason | Optional action button after reason text |
| Fqw | ForgeQueueWorkbench | default, focus, loading, error, screen-reader-busy | Table checkboxes in row order; bulk toolbar after selection count |
| Fgf | ForgeGovernedForm | default, focus, error, disabled-with-reason | Submit blocked shows reason; error summary links focus fields |
| Fao | ForgeAsyncOperation | default, loading, error, screen-reader-busy | Retry button when error; primary state announced once |
| Frw | ForgeRecordWorkspace | default, focus | Title is `h1`; header actions follow reading order |
| Fpb | ForgePermissionBoundary | default, focus, disabled-with-reason | Notice is `role="note"`; demo line not sole color cue |
| Fpw | ForgePersistentWorkspace | default, focus, loading, reduced-motion | Autosave region precedes main fields; skip link targets workspace |
| Fix | ForgeInspectionWorkspace | default, focus, inspect, handoff-pending | Tab main then inspector; Escape returns focus when closing |
| Faw | ForgeAdaptiveWorkspace | default, focus, guided, standard, expert, reduced-motion | Mode toggle `aria-pressed`; help/shortcuts/templates labelled |
| Fwm | ForgeWorkflowMetrics | default, loading, empty, error, drilldown-available | KPI actions reachable; loading uses aria-busy |
| Fai | ForgeAISuggestionReview | default, focus, suggestion-pending, accepted, rejected, reverted | Accept/Reject/Revert after provenance; label precedes body |
| Fjc | ForgeJobCenter | default, loading, error, screen-reader-busy | Refresh/Retry in tab order; progressbars expose valuetext |
| Fip | ForgeImpactPreview | default, focus | Confirm/Cancel sequential; severity not color-only |

## Verification

- `node --test tools/studio-ux-pdca/lib/enterprise-app-a11y-matrices.test.mjs`
- Pair with `DET.APP.CONTROL_A11Y` and `DET.APP.PRIMITIVE_MARKERS` in Studio UX PDCA runs.
