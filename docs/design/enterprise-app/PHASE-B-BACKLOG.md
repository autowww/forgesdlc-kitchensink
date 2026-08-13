# ENT.APP Phase B backlog

**Status:** **P0 shipped** in Kitchen Sink (compositions + primitives). P1 compositions remain planned.

Phase B builds governed **compositions** and **primitives** named in ENT.APP YAML contracts. P0 is implemented under `react/`, `js/ks-*.js`, and showcase `enterprise-app-compositions.html`.

## P0 compositions (shipped)

| Composition | Hash | Module | Showcase |
|-------------|------|--------|----------|
| `ForgeQueueWorkbench` | Fqw | `js/ks-queue-workbench.js` | `enterprise-app-compositions.html` |
| `ForgeGovernedForm` | Fgf | `js/ks-governed-form.js` | same |
| `ForgeAsyncOperation` | Fao | `js/ks-async-operation.js` | same |
| `ForgeRecordWorkspace` | Frw | `js/ks-record-workspace.js` | same |
| `ForgePermissionBoundary` | Fpb | `js/ks-permission-boundary.js` | same |

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

## Planned DET (do not implement until primitives ship)

| Rule ID | Principle | Blocked by |
|---------|-----------|------------|
| `DET.APP.WORK_STATE_PERSISTENCE` | ENT.APP.02 | Autosave, DraftRecovery, SavedViewManager |
| `DET.APP.AI_PROVENANCE` (candidate) | ENT.APP.AI | AI label, provenance, confidence, revert primitives |
| Freshness specialization DET | ENT.APP.03 | ForgeFreshnessIndicator + JobCenter |

## A11y state-matrix rollout

Phase B+ adds per-primitive **required_states** matrices (keyboard, screen reader, reduced motion) as contract tests—not Phase A documentation-only templates.

## Telemetry

`ForgeWorkflowMetrics` + shared control-event schema deferred to Phase B; ENT.APP.10 documents chart choice in the standard only.

## References

- YAML contracts: [`rules/`](rules/)
- Canonical standard: [`../forge-enterprise-app-ux-standard.md`](../forge-enterprise-app-ux-standard.md)
- PDCA pack: [`../../tools/studio-ux-pdca/lib/enterprise-app-ruleset.json`](../../tools/studio-ux-pdca/lib/enterprise-app-ruleset.json)
