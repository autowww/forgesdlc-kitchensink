/**
 * Crawl-level route audit: HTTP status, canonical duplicates, content uniqueness.
 */

import { normalizeCrawlHref, isCrawlableUrl } from './crawl-url.js';

const MAX_LINK_PROBES = 80;
const MAX_REDIRECT_HOPS = 12;

/**
 * @param {string} href
 * @param {string} origin
 */
function isInternalHtmlCandidate(href, origin) {
  if (!href || !isCrawlableUrl(href, origin)) return false;
  try {
    const u = new URL(href);
    if (/\.(png|jpg|jpeg|gif|webp|svg|pdf|zip|xml|json|ico|css|js|map|txt)$/i.test(u.pathname)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {{ pages: Array<{ url?: string, metrics?: object }>, origin: string, request: import('playwright').APIRequestContext }} opts
 */
export async function buildCrawlRouteAuditReport({ pages, origin, request }) {
  const hrefSet = new Set();
  for (const p of pages || []) {
    const u = normalizeCrawlHref(p.url || p.metrics?.url || '');
    if (u) hrefSet.add(u);
    const links = p.metrics?.genericWebsitePageReport?.internalLinks || p.metrics?.links || [];
    for (const link of links) {
      const raw = typeof link === 'string' ? link : link?.href;
      const h = normalizeCrawlHref(raw || '');
      if (h && isInternalHtmlCandidate(h, origin)) hrefSet.add(h);
    }
  }

  const probeTargets = [...hrefSet].slice(0, MAX_LINK_PROBES);
  /** @type {Array<Record<string, unknown>>} */
  const httpViolations = [];

  for (const href of probeTargets) {
    const chain = [];
    let current = href;
    let status = 0;
    let contentType = '';
    let finalUrl = href;
    let loop = false;

    for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop += 1) {
      if (chain.includes(current)) {
        loop = true;
        break;
      }
      chain.push(current);
      try {
        const res = await request.get(current, {
          maxRedirects: 0,
          timeout: 15000,
          failOnStatusCode: false,
        });
        status = res.status();
        contentType = String(res.headers()['content-type'] || '').toLowerCase();
        if (status >= 300 && status < 400) {
          const loc = res.headers().location;
          if (!loc) break;
          current = new URL(loc, current).href;
          continue;
        }
        finalUrl = current;
        break;
      } catch (err) {
        httpViolations.push({
          issue: 'request-failed',
          href,
          detail: String(err?.message || err).slice(0, 120),
        });
        break;
      }
    }

    if (loop) {
      httpViolations.push({ issue: 'redirect-loop', href, chain: chain.slice(0, 6) });
      continue;
    }
    if (status >= 400) {
      httpViolations.push({ issue: 'broken-link', href, status });
      continue;
    }
    if (status >= 200 && status < 300 && contentType && !contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      httpViolations.push({ issue: 'non-html-page', href, status, contentType: contentType.slice(0, 80) });
    }
  }

  const pageByUrl = new Map();
  for (const p of pages || []) {
    const fp = p.metrics?.genericWebsitePageReport?.routeFingerprint;
    if (!fp?.url) continue;
    pageByUrl.set(normalizeCrawlHref(fp.url) || fp.url, fp);
  }

  for (const p of pages || []) {
    const fp = p.metrics?.genericWebsitePageReport?.routeFingerprint;
    if (!fp) continue;
    const url = normalizeCrawlHref(fp.url || p.url || '') || fp.url;
    if (fp.wordCount < 24 && (!fp.h1 || fp.h1.length < 3)) {
      httpViolations.push({
        issue: 'spa-blank-shell',
        href: url,
        wordCount: fp.wordCount,
      });
    }
  }

  const canonicalToUrls = new Map();
  for (const [url, fp] of pageByUrl.entries()) {
    const canon = fp.canonical ? normalizeCrawlHref(fp.canonical) : '';
    if (!canon) continue;
    const list = canonicalToUrls.get(canon) || [];
    list.push(url);
    canonicalToUrls.set(canon, list);
  }
  for (const [canon, urls] of canonicalToUrls.entries()) {
    const unique = [...new Set(urls)];
    if (unique.length > 1) {
      httpViolations.push({
        issue: 'duplicate-canonical-target',
        canonical: canon,
        urls: unique.slice(0, 6),
      });
    }
  }

  /** @type {Array<Record<string, unknown>>} */
  const uniquenessViolations = [];
  const signatureMap = new Map();
  for (const [url, fp] of pageByUrl.entries()) {
    const sig = [
      (fp.title || '').toLowerCase(),
      (fp.h1 || '').toLowerCase(),
      (fp.metaDescription || '').toLowerCase(),
    ].join('\x1f');
    if (!sig.replace(/\x1f/g, '').trim()) continue;
    const list = signatureMap.get(sig) || [];
    list.push(url);
    signatureMap.set(sig, list);
  }
  for (const [sig, urls] of signatureMap.entries()) {
    const unique = [...new Set(urls)];
    if (unique.length < 2) continue;
    const [title, h1, meta] = sig.split('\x1f');
    const placeholder =
      ['home', 'index', 'page', 'document', 'welcome'].includes(title)
      || ['home', 'welcome', 'page'].includes(h1);
    uniquenessViolations.push({
      issue: placeholder ? 'cloned-placeholder-pages' : 'duplicate-content-signature',
      urls: unique.slice(0, 8),
      title,
      h1,
      meta: meta.slice(0, 60),
    });
  }

  return {
    httpViolations: httpViolations.slice(0, 20),
    uniquenessViolations: uniquenessViolations.slice(0, 12),
    probesAttempted: probeTargets.length,
  };
}
