/**
 * Stable visual hash props for KS React primitives (see docs/design/catalog/visual-registry.yaml).
 */
const HASH_RE = /^[A-Za-z]{3}$/;

export type KsVisualDomProps = {
  hash: string;
  'data-ks-hash': string;
  'data-ks-type': string;
  'data-ks-name': string;
} & Record<string, string>;

export function ksVisualAttrs(hash: string, visualType: string, name: string): KsVisualDomProps {
  if (!HASH_RE.test(hash)) {
    throw new Error(`ksVisualAttrs: hash must match /^[A-Za-z]{3}$/: ${JSON.stringify(hash)}`);
  }
  if (new Set(hash).size !== 3) {
    throw new Error(`ksVisualAttrs: hash must use three distinct letters: ${JSON.stringify(hash)}`);
  }
  return {
    hash,
    'data-ks-hash': hash,
    'data-ks-type': visualType,
    'data-ks-name': name,
  };
}

/** Registry-aligned slugs for react-primitive rows. */
export const KS_REACT_PRIMITIVE = {
  TileDropdownControl: { hash: 'Tdc', name: 'tile-dropdown-control' },
  ForgeKeyValueGrid: { hash: 'Fkg', name: 'forge-key-value-grid' },
  ForgeStatusBanner: { hash: 'Fsb', name: 'forge-status-banner' },
  ForgeReviewPanel: { hash: 'Fvw', name: 'forge-review-panel' },
  ForgeDiagnosticPanel: { hash: 'Fdg', name: 'forge-diagnostic-panel' },
  ForgeWorkflowStageBar: { hash: 'Fwb', name: 'forge-workflow-stage-bar' },
  ForgeEventTimeline: { hash: 'Fen', name: 'forge-event-timeline' },
  ForgeRunHeader: { hash: 'Frh', name: 'forge-run-header' },
  ForgeDecisionActionBar: { hash: 'Fda', name: 'forge-decision-action-bar' },
  WorkspaceLensControl: { hash: 'Wlc', name: 'workspace-lens-control' },
  ForgeErrorSummary: { hash: 'Fes', name: 'forge-error-summary' },
  ForgeAutosaveStatus: { hash: 'Fas', name: 'forge-autosave-status' },
  ForgeDraftRecovery: { hash: 'Fdr', name: 'forge-draft-recovery' },
  ForgeSavedViewManager: { hash: 'Fsm', name: 'forge-saved-view-manager' },
  ForgeOperationProgress: { hash: 'Fop', name: 'forge-operation-progress' },
  ForgeFreshnessIndicator: { hash: 'Ffi', name: 'forge-freshness-indicator' },
  ForgeObjectInspector: { hash: 'Foi', name: 'forge-object-inspector' },
  ForgeAccessReason: { hash: 'Far', name: 'forge-access-reason' },
} as const;

export function ksReactPrimitiveAttrs(componentKey: keyof typeof KS_REACT_PRIMITIVE): KsVisualDomProps {
  const row = KS_REACT_PRIMITIVE[componentKey];
  return {
    ...ksVisualAttrs(row.hash, 'react-primitive', row.name),
    'data-ks-react-root': 'true',
  };
}
