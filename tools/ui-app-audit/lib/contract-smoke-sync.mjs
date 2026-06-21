/**
 * Shared MD contract table → smoke-plan scenario mapping.
 */

export const PRIMARY_ROUTE_SCENARIO_IDS = [
  'route-dashboard',
  'route-attention',
  'route-check',
  'route-registry',
  'route-run-hub',
  'route-insights',
  'route-test-plans',
  'route-triage',
  'route-remediation',
  'route-monitoring',
  'route-reports',
  'route-settings',
  'route-about',
];

const ROUTE_HEADING_BY_ID = {
  'route-dashboard': '#dashboard-heading',
  'route-attention': '#attention-heading',
  'route-check': '#run-heading',
  'route-registry': '#registry-heading',
  'route-run-hub': '#run-hub-heading',
  'route-insights': '#insights-heading',
  'route-test-plans': '#test-plans-heading',
  'route-triage': '#triage-heading',
  'route-remediation': '#remediation-heading',
  'route-monitoring': '#monitoring-heading',
  'route-reports': '#reports-heading',
  'route-settings': '#settings-heading',
  'route-about': '#about-heading',
};

const ROUTE_HASH_BY_ID = {
  'route-dashboard': 'dashboard-section',
  'route-attention': 'attention-section',
  'route-check': 'check-section',
  'route-registry': 'registry-section',
  'route-run-hub': 'run-section',
  'route-insights': 'insights-section',
  'route-test-plans': 'test-plans-section',
  'route-triage': 'triage-section',
  'route-remediation': 'remediation-section',
  'route-monitoring': 'monitoring-section',
  'route-reports': 'reports-section',
  'route-settings': 'settings-section',
  'route-about': 'about-section',
};

/**
 * @param {{ scenarioId?: string | null, testId?: string, docAnchor?: string }} row
 * @returns {string | null}
 */
export function scenarioIdFromContractRow(row) {
  if (row.scenarioId) return row.scenarioId;
  const tid = row.testId || '';
  if (tid.includes('test_primary_routes')) return null;
  if (tid.includes('test_studio_home_loads')) return 'home-shell';
  if (tid.includes('test_studio_registry_partial')) return 'registry-overview';
  if (tid.includes('test_demo_run_hub')) return 'demo-run-hub';
  if (tid.includes('test_assistant_route_shows')) return 'assistant-route-mount';
  if (tid.includes('test_demo_insights_does_not_fetch')) return 'demo-insights-no-fetch';
  if (tid.includes('test_demo_insights_workspace_populated') || tid.includes('test_demo_insights_workspace')) {
    return 'demo-insights-populated';
  }
  if (tid.includes('test_demo_triage_does_not_fetch')) return 'demo-triage-no-fetch';
  if (tid.includes('test_demo_triage_workspace_populated') || tid.includes('test_demo_triage_workspace')) {
    return 'demo-triage-populated';
  }
  if (tid.includes('integration_real_run')) return null;
  if (tid.includes('e2e_audit_assistant')) return null;
  return null;
}

/**
 * @param {string} selectorCell
 * @returns {{ ready: string, ready_selectors: string[], assert_text_contains: string }}
 */
export function parseSelectorsFromContractCell(selectorCell) {
  const ready_selectors = [];
  let assert_text_contains = '';
  const backtick = selectorCell.match(/`([^`]+)`/g) || [];
  for (const m of backtick) {
    const inner = m.slice(1, -1).trim();
    if (inner.startsWith('#') || inner.startsWith('.') || inner.startsWith('[')) {
      ready_selectors.push(inner);
    }
  }
  const hashRe = /#[\w-]+/g;
  let hm;
  while ((hm = hashRe.exec(selectorCell)) !== null) {
    if (!ready_selectors.includes(hm[0])) ready_selectors.push(hm[0]);
  }
  const textMatch = selectorCell.match(/text\s+\*\*([^*]+)\*\*/i);
  if (textMatch) assert_text_contains = textMatch[1].trim();
  const ready = ready_selectors[0] || '';
  return { ready, ready_selectors, assert_text_contains };
}

/**
 * @param {string} selectorCell
 * @param {string} testId
 */
export function parseNavigateFromContract(selectorCell, testId) {
  const nav = {};
  const qm = selectorCell.match(/\?[^#\s`]+/) || testId.match(/\?[^#\s`]+/);
  if (qm) nav.query = qm[0].replace(/^\?/, '');
  const hashFromCell = selectorCell.match(/#([\w-]+)/);
  if (hashFromCell) {
    nav.hash = hashFromCell[0].startsWith('#') ? hashFromCell[0].slice(1) : hashFromCell[0];
  }
  const runId = selectorCell.match(/runId=demo/i) || testId.match(/runId=demo/i);
  if (runId) nav.query = nav.query ? `${nav.query}&runId=demo` : 'runId=demo';
  return nav;
}

/**
 * @param {string} md
 * @returns {Map<string, { path: string, role: string }[]>}
 */
export function parseRelatedFilesSection(md) {
  /** @type {Map<string, { path: string, role: string }[]>} */
  const byKeyword = new Map();
  const lines = md.split('\n');
  let inRelated = false;
  for (const line of lines) {
    if (line.startsWith('## Related files')) {
      inRelated = true;
      continue;
    }
    if (inRelated && line.startsWith('## ') && !line.includes('Related')) break;
    if (!inRelated) continue;
    const row = line.match(/^\|\s*\*\*([^*]+)\*\*\s*\|\s*`([^`]+)`/);
    if (!row) continue;
    const area = row[1].toLowerCase();
    const cell = row[2];
    const paths = cell.split(/,\s*/).map((p) => p.replace(/`/g, '').trim()).filter(Boolean);
    const entries = paths.map((p) => ({
      path: p,
      role: /\.(js|mjs|ts|tsx|py)$/.test(p) ? 'behavior' : 'markup',
    }));
    byKeyword.set(area, entries);
  }
  return byKeyword;
}

/**
 * @param {string} scenarioId
 * @param {Map<string, { path: string, role: string }[]>} related
 * @param {string} appRepoName
 */
export function renderRootsForScenario(scenarioId, related, appRepoName) {
  const sid = scenarioId.toLowerCase();
  /** @type {{ repo?: string, path: string, role?: string }[]} */
  const roots = [];
  const push = (paths) => {
    for (const p of paths || []) {
      roots.push({ repo: appRepoName, path: p.path, role: p.role });
    }
  };
  if (sid.includes('registry')) {
    for (const [k, v] of related) {
      if (k.includes('registry')) push(v);
    }
  } else if (sid.includes('dashboard') || sid.startsWith('route-')) {
    for (const [k, v] of related) {
      if (k.includes('routing') || k.includes('dashboard') || k.includes('layout')) push(v.slice(0, 6));
    }
  } else if (sid.includes('demo') || sid.includes('run')) {
    for (const [k, v] of related) {
      if (k.includes('run') || k.includes('artifact')) push(v.slice(0, 6));
    }
  }
  if (!roots.length) {
    const layout = related.get('layout & chrome');
    if (layout) push(layout.slice(0, 4));
  }
  return roots;
}

/**
 * @param {string} scenarioId
 * @param {{ docAnchor: string, tier: string, status: string, testId: string }} row
 * @param {string} selectorCell
 * @param {{ appRepoName: string, related: Map<string, { path: string, role: string }[]> }} ctx
 */
export function buildScenarioFromContract(scenarioId, row, selectorCell, ctx) {
  const sel = parseSelectorsFromContractCell(selectorCell);
  const nav = parseNavigateFromContract(selectorCell, row.testId);
  if (ROUTE_HASH_BY_ID[scenarioId]) {
    nav.hash = ROUTE_HASH_BY_ID[scenarioId];
    if (ROUTE_HEADING_BY_ID[scenarioId] && !sel.ready_selectors.includes(ROUTE_HEADING_BY_ID[scenarioId])) {
      sel.ready_selectors.unshift(ROUTE_HEADING_BY_ID[scenarioId]);
    }
    if (!sel.ready) sel.ready = ROUTE_HEADING_BY_ID[scenarioId];
  }
  if (scenarioId === 'home-shell') {
    nav.hash = nav.hash || 'dashboard-section';
    if (!sel.ready) sel.ready = '#main-content';
  }
  const render_roots = renderRootsForScenario(scenarioId, ctx.related, ctx.appRepoName);
  const ownership = render_roots.map((r) => ({ ...r }));
  const status =
    row.status === 'implemented' && sel.ready_selectors.length ? 'implemented' : 'candidate';
  const steps = [
    {
      stepId: 'land',
      description: `Contract: ${row.docAnchor}`,
      navigate: Object.keys(nav).length ? nav : undefined,
      ready: sel.ready || undefined,
      ready_selectors: sel.ready_selectors.length ? sel.ready_selectors : undefined,
      assert_text_contains: sel.assert_text_contains || undefined,
      render_roots,
    },
  ];
  return {
    scenarioId,
    doc_anchor: row.docAnchor,
    tier: row.tier || 'smoke',
    status,
    navigate: steps[0].navigate,
    ready: steps[0].ready,
    ready_selectors: steps[0].ready_selectors,
    assert_text_contains: steps[0].assert_text_contains,
    ownership,
    render_roots,
    steps,
  };
}

/**
 * Expand contract rows to scenario ids.
 * @param {Array<{ docAnchor: string, tier: string, status: string, testId: string }>} rows
 */
export function expandContractRowsToScenarioIds(rows) {
  /** @type {Array<{ scenarioId: string, row: typeof rows[0], selectorCell: string }>} */
  const out = [];
  for (const row of rows) {
    const tid = row.testId || '';
    if (tid.includes('test_primary_routes')) {
      for (const sid of PRIMARY_ROUTE_SCENARIO_IDS) {
        out.push({ scenarioId: sid, row, selectorCell: '' });
      }
      continue;
    }
    const fragments = tid.split(',').map((s) => s.trim()).filter(Boolean);
    for (const frag of fragments.length ? fragments : [tid]) {
      const sid = scenarioIdFromContractRow({ ...row, testId: frag });
      if (sid) out.push({ scenarioId: sid, row, selectorCell: frag });
    }
  }
  return out;
}
