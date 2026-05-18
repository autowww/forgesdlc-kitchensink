/**
 * Pure layout helpers for loop-watch-dashboard.mjs (unit-testable).
 */

/** @param {string} s */
/** @param {number} w */
export function clipPad(s, w) {
  const t = String(s ?? '').replace(/\r?\n/g, ' ');
  if (w <= 0) return '';
  if (t.length >= w) return w <= 1 ? t.slice(0, w) : `${t.slice(0, w - 1)}…`;
  return t.padEnd(w, ' ');
}

/**
 * Top/bottom rule; optional centered title consumes interior dashes.
 * @param {number} cols outer width (characters)
 * @param {string} [title]
 * @param {'top'|'mid'|'bot'} edge
 */
export function boxEdgeLine(cols, title, edge) {
  const inner = Math.max(0, cols - 2);
  if (inner <= 0) return '';
  let mid = '─'.repeat(inner);
  const t = String(title || '').trim();
  if (t.length && t.length + 2 <= inner && edge === 'top') {
    const pad = inner - 2 - t.length;
    const left = Math.floor(pad / 2);
    const right = pad - left;
    mid = `${'─'.repeat(left)} ${t} ${'─'.repeat(right)}`;
    if (mid.length > inner) mid = mid.slice(0, inner);
    else mid = mid.padEnd(inner, '─');
  }
  const [TL, TR] =
    edge === 'bot'
      ? ['└', '┘']
      : edge === 'mid'
        ? ['├', '┤']
        : ['┌', '┐'];
  return `${TL}${mid.slice(0, inner)}${TR}`;
}

/** @param {number} cols */
/** @param {string} text */
export function boxRow(cols, text) {
  const inner = Math.max(0, cols - 2);
  return `│${clipPad(text, inner)}│`;
}

/**
 * @param {number} cols
 * @param {Record<string, unknown>} state
 * @param {string[]} logTail
 * @param {{
 *   websiteRepo?: string,
 *   siteUrl?: string,
 *   outDir?: string,
 *   scoreOverall?: string,
 *   deltaVerbal?: string,
 * }} meta
 */
export function buildWatchFrameLines(cols, state, logTail, meta) {
  const lines = [];
  const c = Math.max(40, cols);
  lines.push(boxEdgeLine(c, 'Forge UX loop watch', 'top'));
  lines.push(boxRow(c, ` Repo : ${meta.websiteRepo ?? '—'}`));
  lines.push(boxRow(c, ` Site : ${meta.siteUrl ?? '—'}`));
  lines.push(boxRow(c, ` OUT  : ${meta.outDir ?? '—'}`));
  lines.push(boxEdgeLine(c, '', 'mid'));

  const phase = typeof state.phase === 'string' ? state.phase : '—';
  const updatedAt = typeof state.updatedAt === 'string' ? state.updatedAt : '—';
  lines.push(boxRow(c, ` Phase       : ${phase}`));
  lines.push(boxRow(c, ` State clock : ${updatedAt}`));
  lines.push(boxEdgeLine(c, '', 'mid'));

  const crawl = state.crawl && typeof state.crawl === 'object' && !Array.isArray(state.crawl)
    ? /** @type {Record<string, unknown>} */ (state.crawl)
    : {};
  const crawlLine = [
    crawl.label ?? '',
    crawl.runDisplay != null ? `[run ${String(crawl.runDisplay)}]` : '',
    crawl.elapsedClock ?? '',
    crawl.pages != null ? `pg ${crawl.pages}` : '',
    crawl.queueLen != null ? `q${String(crawl.queueLen)}` : '',
    crawl.etaTriple != null ? `ETA ${String(crawl.etaTriple)}` : '',
    crawl.phaseDetail != null ? String(crawl.phaseDetail) : '',
  ].filter(Boolean).join(' │ ');
  lines.push(boxRow(c, ` Crawl : ${crawlLine || '—'}`));
  lines.push(boxEdgeLine(c, '', 'mid'));

  const scores = ` Overall : ${meta.scoreOverall ?? '—'}   Delta : ${meta.deltaVerbal ?? '—'}`;
  lines.push(boxRow(c, scores));
  lines.push(boxEdgeLine(c, '', 'mid'));

  lines.push(boxRow(c, ' Activity log (last 10 non-empty lines)'));
  const tail = Array.isArray(logTail) ? logTail.slice(-10) : [];
  while (tail.length < 10) tail.push('');
  for (const row of tail) {
    lines.push(boxRow(c, ` ${row}`));
  }
  lines.push(boxEdgeLine(c, '', 'bot'));
  return lines;
}
