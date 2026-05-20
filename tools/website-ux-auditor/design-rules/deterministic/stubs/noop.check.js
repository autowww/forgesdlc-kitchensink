export const rule = {
  id: 'DET.STUB.NOOP',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'site-inspection',
  scoreDimension: null,
  defaultSeverity: 'trivial',
  priorityWeight: 0,
  source: 'docs/design/ux-audit/deterministic-design-rules.md',
};

/** Placeholder for rules not yet implemented as machine checks. */
export function run() {
  return [];
}
