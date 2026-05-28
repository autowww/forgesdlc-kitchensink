/**
 * Parse Automation test contract table from studio-functionality.md.
 * @param {string} md
 */
export function parseAutomationContractTable(md) {
  const lines = md.split('\n');
  let inTable = false;
  /** @type {Array<{ docAnchor: string, scenarioId: string | null, tier: string, status: string, testId: string }>} */
  const rows = [];

  for (const line of lines) {
    if (line.includes('## Automation test contract')) {
      inTable = false;
      continue;
    }
    if (!inTable && line.startsWith('| Design anchor')) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    if (!line.startsWith('|')) break;
    if (line.includes('---')) continue;

    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter((_, i, arr) => i > 0 && i < arr.length - 1);
    if (cells.length < 5) continue;

    const anchorCell = cells[0];
    const tier = (cells[2] || '').toLowerCase();
    const status = (cells[3] || '').toLowerCase();
    const testId = cells[4] || '';

    const link = anchorCell.match(/\[([^\]]+)\]\(#([^)]+)\)/);
    const docAnchor = link ? link[2] : anchorCell.replace(/[[\]]/g, '').trim().toLowerCase().replace(/\s+/g, '-');

    rows.push({ docAnchor, scenarioId: null, tier, status, testId });
  }

  return rows;
}
