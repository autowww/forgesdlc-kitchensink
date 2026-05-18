/**
 * Stderr-only audit diagnostics (default crawl logs stay on stderr today via console.log).
 * Level 0: quiet beyond existing analyzer messages.
 * Level 1 (--verbose): [incremental] / [crawl] / [archive] style breadcrumbs.
 * Level 2: optional extra detail.
 */
export function createLogger(level = 0) {
  const lv = Math.max(0, Number(level) || 0);
  return {
    level: lv,
    verbose(tag, message = '', detail = '') {
      if (lv >= 1) {
        const mid = message ? ` ${message}` : '';
        const tail = detail !== '' && detail !== undefined ? ` · ${detail}` : '';
        console.error(`${tag}${mid}${tail}`);
      }
    },
    verbose2(tag, message = '', detail = '') {
      if (lv >= 2) {
        const mid = message ? ` ${message}` : '';
        const tail = detail !== '' && detail !== undefined ? ` · ${detail}` : '';
        console.error(`${tag}${mid}${tail}`);
      }
    },
    info(tag, message) {
      console.error(`${tag} ${message}`);
    },
  };
}
