/**
 * DET.DATA.TABLE_HEADERS — data tables expose <th scope> or explicit headers associations.
 */

export const VALID_TABLE_HEADER_SCOPES = ['col', 'row', 'colgroup', 'rowgroup'];

export const rule = {
  id: 'DET.DATA.TABLE_HEADERS',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-data-table-headers',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromTableHeadersReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const hint = String(v.selectorHint || v.issue || 'table').slice(0, 120);
    if (seen.has(hint)) continue;
    seen.add(hint);

    const issue = String(v.issue || v.kind || 'table-headers');
    const message = issue === 'no-header-cells'
      ? 'A data table has no <th> header cells and body cells lack headers attributes linking to header ids.'
      : 'A data table uses <th> without scope (col, row, colgroup, rowgroup) and body cells lack headers associations.';

    findings.push({
      severity: 'major',
      area: 'accessibility',
      message,
      evidence: `missing_table_headers issue=${issue} table="${hint}"`,
      remediation: issue === 'no-header-cells'
        ? 'Add a <thead> row of <th scope="col"> (or scope="row" for row headers), or set headers on each <td> pointing at header cell ids.'
        : 'Add scope on each <th> (typically scope="col" for column headers), or wire headers on <td> cells to the relevant header ids.',
    });
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectTableHeadersReport(page) {
  return page.evaluate((validScopes) => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const scopeSet = new Set(validScopes);

    const visible = (el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 2 && rect.height > 2 && style.visibility !== 'hidden'
        && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
    };

    const isHiddenSubtree = (el) => {
      let node = el;
      while (node && node.nodeType === 1) {
        if (node.getAttribute('aria-hidden') === 'true') return true;
        const style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden') return true;
        node = node.parentElement;
      }
      return false;
    };

    const isLayoutTable = (table) => {
      if (table.getAttribute('role') === 'presentation') return true;
      if (table.closest('[role="presentation"]')) return true;
      return false;
    };

    const selectorHintFor = (el) => {
      const id = el.id ? `#${el.id}` : '';
      const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 3).join('.');
      const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
      return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}${hash ? `[@${hash}]` : ''}`;
    };

    const headerCellsIn = (table) => {
      /** @type {Element[]} */
      const cells = [];
      for (const th of table.querySelectorAll('th')) {
        if (visible(th) && !isHiddenSubtree(th)) cells.push(th);
      }
      for (const el of table.querySelectorAll('[role="columnheader"], [role="rowheader"]')) {
        if (visible(el) && !isHiddenSubtree(el)) cells.push(el);
      }
      return cells;
    };

    const dataCellsIn = (table) => {
      /** @type {HTMLTableCellElement[]} */
      const cells = [];
      for (const td of table.querySelectorAll('td')) {
        if (visible(td) && !isHiddenSubtree(td)) cells.push(td);
      }
      return cells;
    };

    const hasValidHeadersAttr = (table, cell) => {
      const raw = norm(cell.getAttribute('headers'));
      if (!raw) return false;
      for (const id of raw.split(/\s+/)) {
        if (!id) continue;
        const ref = document.getElementById(id);
        if (!ref || !table.contains(ref)) continue;
        const tag = ref.tagName.toLowerCase();
        const role = ref.getAttribute('role');
        if (tag === 'th' || role === 'columnheader' || role === 'rowheader') return true;
      }
      return false;
    };

    const allDataCellsHaveHeadersAttr = (table, dataCells) => (
      dataCells.length > 0 && dataCells.every((cell) => hasValidHeadersAttr(table, cell))
    );

    const allThHaveScope = (headerCells) => (
      headerCells.length > 0
      && headerCells.every((th) => scopeSet.has(norm(th.getAttribute('scope')).toLowerCase()))
    );

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];
    const scanned = new Set();

    for (const table of document.querySelectorAll('table')) {
      if (!visible(table) || isHiddenSubtree(table) || isLayoutTable(table)) continue;

      const dataCells = dataCellsIn(table);
      if (!dataCells.length) continue;

      const key = selectorHintFor(table);
      if (scanned.has(key)) continue;
      scanned.add(key);

      const headerCells = headerCellsIn(table);

      if (!headerCells.length) {
        if (!allDataCellsHaveHeadersAttr(table, dataCells)) {
          violations.push({
            kind: 'missing-table-headers',
            issue: 'no-header-cells',
            selectorHint: key,
            dataCellCount: dataCells.length,
          });
        }
        continue;
      }

      if (!allThHaveScope(headerCells) && !allDataCellsHaveHeadersAttr(table, dataCells)) {
        violations.push({
          kind: 'missing-table-headers',
          issue: 'th-missing-scope',
          selectorHint: key,
          headerCount: headerCells.length,
          dataCellCount: dataCells.length,
        });
      }
    }

    return {
      tableCount: scanned.size,
      violations: violations.slice(0, 12),
    };
  }, VALID_TABLE_HEADER_SCOPES);
}

export async function run({ metrics, page, url }) {
  const report = metrics?.tableHeadersReport
    ?? (page ? await collectTableHeadersReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromTableHeadersReport(report, url || metrics?.url || '');
}
