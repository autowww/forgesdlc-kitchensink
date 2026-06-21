/** @param {string} raw */
export function normalizeCrawlHref(raw) {
  try {
    const url = new URL(raw);
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}

export function isCrawlableUrl(raw, origin) {
  try {
    const url = new URL(raw);
    if (url.origin !== origin) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (/\.(png|jpg|jpeg|gif|webp|svg|pdf|zip|xml|json|ico|css|js|map|txt)$/i.test(url.pathname)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
