# ENT.APP Phase B backlog

**Status:** **P0 + P1 shipped** in Kitchen Sink (compositions + primitives). Phase B scope is complete; remaining work is consumer adoption and contract-test wiring.

Implementations live under `react/`, `js/ks-*.js`, and showcase `enterprise-app-compositions.html`.

## P0 compositions (shipped)

| Composition | Hash | Module | Showcase |
|-------------|------|--------|----------|
| `ForgeQueueWorkbench` | Fqw | `js/ks-queue-workbench.js` | `enterprise-app-compositions.html` |
| `ForgeGovernedForm` | Fgf | `js/ks-governed-form.js` | same |
| `ForgeAsyncOperation` | Fao | `js/ks-async-operation.js` | same |
| `ForgeRecordWorkspace` | Frw | `js/ks-record-workspace.js` | same |
| `ForgePermissionBoundary` | Fpb | `js/ks-permission-boundary.js` | same |

## P1 compositions (shipped)

| Composition | Hash | Module | Showcase |
|-------------|------|--------|----------|
| `ForgePersistentWorkspace` | Fpw | `js/ks-persistent-workspace.js` | `enterprise-app-compositions.html` |
| `ForgeInspectionWorkspace` | Fix | `js/ks-inspection-workspace.js` | same |
| `ForgeAdaptiveWorkspace` | Faw | `js/ks-adaptive-workspace.js` | same |
| `ForgeWorkflowMetrics` | Fwm | `js/ks-workflow-metrics.js` | same |
| `ForgeAISuggestionReview` | Fai | `js/ks-ai-suggestion-review.js` | same |
| `ForgeJobCenter` | Fjc | `js/ks-job-center.js` | same |
| `ForgeImpactPreview` | Fip | `js/ks-impact-preview.js` | same |

## P0 primitives (shipped)

| Primitive | Hash | Module |
|-----------|------|--------|
| `ForgeErrorSummary` | Fes | `react/ForgeErrorSummary.tsx` |
| `ForgeAutosaveStatus` | Fas | `react/ForgeAutosaveStatus.tsx` |
| `ForgeDraftRecovery` | Fdr | `react/ForgeDraftRecovery.tsx` |
| `ForgeSavedViewManager` | Fsm | `react/ForgeSavedViewManager.tsx` |
| `ForgeOperationProgress` | Fop | `react/ForgeOperationProgress.tsx` |
| `ForgeFreshnessIndicator` | Ffi | `react/ForgeFreshnessIndicator.tsx` |
| `ForgeObjectInspector` | Foi | `react/ForgeObjectInspector.tsx` |
| `ForgeAccessReason` | Far | `react/ForgeAccessReason.tsx` |
| `ForgeUndoToast` | Fut | `js/ks-undo-toast.js` |
| `ForgeEditableGridAdapter` | Feg | `js/ks-editable-grid-adapter.js` |

## P1 primitives (shipped)

| Primitive | Hash | Module |
|-----------|------|--------|
| `ForgeRecentItems` | Fri | `js/ks-recent-items.js` |
| `ForgeResultReceipt` | Frt | `js/ks-result-receipt.js` |
| `ForgeConfirmationGuard` | Fcg | `js/ks-confirmation-guard.js` |
| `ForgeVersionHistory` | Fvh | `js/ks-version-history.js` |
| `ForgeReadOnlyFieldGroup` | Frg | `js/ks-readonly-field-group.js` |
| `ForgeRolePreset` | Frl | `js/ks-role-preset.js` |
| `ForgeContextHelp` | Fch | `js/ks-context-help.js` |
| `ForgeShortcutRegistry` | Fsr | `js/ks-shortcut-registry.js` |
| `ForgeTemplatePicker` | Ftp | `js/ks-template-picker.js` |
| `ForgeSmartDefault` | Fsd | `js/ks-smart-default.js` |
| `ForgeAssignmentControl` | Fac | `js/ks-assignment-control.js` |
| `ForgeCommentThread` | Fct | `js/ks-comment-thread.js` |
| `ForgeHandoffSummary` | Fhs | `js/ks-handoff-summary.js` |
| `ForgeAILabel` | Fal | `js/ks-ai-label.js` |
| `ForgeProvenancePanel` | Fpv | `js/ks-provenance-panel.js` |
| `ForgeConfidenceIndicator` | Fci | `js/ks-confidence-indicator.js` |
| `ForgeRevertAction` | Fra | `js/ks-revert-action.js` |

## DET rules (implemented)

| Rule ID | Principle | Status |
|---------|-----------|--------|
| `DET.APP.WORK_STATE_PERSISTENCE` | ENT.APP.02 | Implemented (autosave, draft recovery, saved views, recent items) |
| `DET.APP.AI_PROVENANCE` | ENT.APP.AI | Implemented (AI label, provenance panel, confidence, revert) |
| Freshness specialization DET | ENT.APP.03 | Implemented (`ForgeFreshnessIndicator` + `ForgeJobCenter`) |

## A11y state-matrix rollout (shipped)

Per-primitive **required_states** matrices (keyboard, screen reader, reduced motion) ship as:

- Narrative reference: [`a11y-state-matrices.md`](a11y-state-matrices.md)
- Machine-readable pack: [`tools/studio-ux-pdca/lib/enterprise-app-a11y-matrices.json`](../../tools/studio-ux-pdca/lib/enterprise-app-a11y-matrices.json)

Contract-test harness wiring remains a consumer integration task.

## Telemetry (initial schema shipped)

`ForgeWorkflowMetrics` (`Fwm`) emits `ks-workflow-metric` `CustomEvent` on drilldown and declares `data-telemetry-schema="forge-workflow-v1"` on the composition root. Role-based metric presets remain a consumer configuration concern.

## References

- YAML contracts: [`rules/`](rules/)
- Canonical standard: [`../forge-enterprise-app-ux-standard.md`](../forge-enterprise-app-ux-standard.md)
- PDCA pack: [`../../tools/studio-ux-pdca/lib/enterprise-app-ruleset.json`](../../tools/studio-ux-pdca/lib/enterprise-app-ruleset.json)
