/**
 * DET.CTA.HIERARCHY — one primary CTA per logical viewport region (hero, sticky footer, modal).
 */

/** Primary filled CTAs allowed per hero / modal / sticky-footer region. */
export const MAX_PRIMARY_CTAS_PER_REGION = 1;

const HERO_REGION_SELECTOR = [
  '.landing-hero-wide',
  '.landing-hero-grid-wrap',
  '.landing-hero',
  '.product-hero',
  '[class*="product-hero"]',
  'main .hero',
  '[class*="landing-hero"]',
].join(',');

const MODAL_REGION_SELECTOR = [
  '.modal.show',
  '.offcanvas.show',
  '#diagramModal',
  '#topicPreviewModal',
  '[role="dialog"][aria-modal="true"]',
].join(',');

const STICKY_FOOTER_SELECTOR = [
  '.fixed-bottom',
  '.sticky-bottom',
  '[class*="sticky-footer"]',
  '[class*="sticky-cta"]',
  '[class*="fixed-cta"]',
].join(',');

export const rule = {
  id: 'DET.CTA.HIERARCHY',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'conversion',
  scoreDimension: 'trustAndEcosystemTruth',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-cta-hierarchy',
};

const REGION_LABELS = {
  hero: 'hero region',
  modal: 'modal or panel',
  stickyFooter: 'sticky footer band',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>>, maxAllowed?: number } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromCtaHierarchyReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const maxAllowed = Number(report?.maxAllowed) || MAX_PRIMARY_CTAS_PER_REGION;
  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const count = Number(v.primaryCount) || 0;
    if (count <= maxAllowed) continue;
    const region = String(v.region || 'region');
    const hint = String(v.selectorHint || v.className || region).slice(0, 120);
    const key = `${region}:${hint}:${count}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const regionLabel = REGION_LABELS[region] || region;
    const labels = Array.isArray(v.labels) ? v.labels.slice(0, 5).join(' | ') : '';
    findings.push({
      severity: count > maxAllowed + 1 ? 'critical' : 'major',
      area: 'conversion',
      message:
        `A ${regionLabel} exposes more than one primary CTA; keep a single primary action per viewport band.`,
      evidence:
        `region=${region} primary_ctas=${count} max=${maxAllowed} root="${hint}"${
          labels ? ` labels="${labels.slice(0, 160)}"` : ''
        }`,
      remediation:
        'Demote competing primaries to outline/secondary styles, move extras into a disclosure/menu, or split actions across separate regions below the fold.',
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
export async function collectCtaHierarchyReport(page, maxAllowed = MAX_PRIMARY_CTAS_PER_REGION) {
  return page.evaluate(
    ({
      maxAllowed,
      HERO_REGION_SELECTOR,
      MODAL_REGION_SELECTOR,
      STICKY_FOOTER_SELECTOR,
    }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 8 && rect.height > 8 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const textOf = (el) => norm(
        el.innerText || el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '',
      );

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

      const isPrimaryAction = (el) => {
        if (!el || el.nodeType !== 1 || !visible(el) || isHiddenSubtree(el)) return false;
        const tag = el.tagName.toLowerCase();
        const cls = String(el.className || '').toLowerCase();
        if (tag === 'button' && el.disabled) return false;
        if (tag === 'input') {
          const type = String(el.getAttribute('type') || 'text').toLowerCase();
          if (!['button', 'submit', 'reset'].includes(type) || el.disabled) return false;
        }
        if (/\bbtn-forge-outline\b|\bbtn-cyan-outline\b|\bbtn-outline\b|\bbtn-secondary\b|\bbtn-link\b/.test(cls)) {
          return false;
        }
        if (/\bbtn-primary\b/.test(cls)) return true;
        if (/\bbtn-forge\b/.test(cls)) return true;
        return false;
      };

      const excludedRegion = (el) => {
        if (!el) return true;
        if (el.closest(
          'nav, [role="navigation"], .navbar, .pagination, .breadcrumb, .dropdown-menu, '
          + '[role="tablist"], [role="menu"], .cookie, [class*="cookie"], [id*="cookie"]',
        )) return true;
        if (el.closest('header')?.querySelector('nav') && el.closest('header nav')) return true;
        return false;
      };

      const selectorHintFor = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 3).join('.');
        const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
        return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}${hash ? `[@${hash}]` : ''}`;
      };

      const nestedRegionAncestor = (el, regionRoot, regionRoots) => {
        let node = el.parentElement;
        while (node && node !== regionRoot) {
          if (regionRoots.has(node)) return node;
          node = node.parentElement;
        }
        return null;
      };

      const collectPrimaryActions = (regionRoot, regionRoots) => {
        const actions = [];
        for (const el of regionRoot.querySelectorAll('a, button, input, [role="button"]')) {
          if (!isPrimaryAction(el)) continue;
          if (nestedRegionAncestor(el, regionRoot, regionRoots)) continue;
          actions.push(el);
        }
        const uniq = [];
        const keys = new Set();
        for (const el of actions) {
          const key = `${el.tagName}:${textOf(el).slice(0, 48)}:${el.getAttribute('href') || ''}`;
          if (keys.has(key)) continue;
          keys.add(key);
          uniq.push(el);
        }
        return uniq;
      };

      const isHeroRegion = (el) => {
        if (!el || !visible(el) || excludedRegion(el)) return false;
        const cls = String(el.className || '').toLowerCase();
        if (/\blanding-hero-secondary\b/.test(cls)) return false;
        if (el.matches?.('.landing-hero-wide, .landing-hero-grid-wrap, .landing-hero, .product-hero')) return true;
        if (/\blanding-hero\b|\bproduct-hero\b/.test(cls)) return true;
        if (el.matches?.('main .hero')) return true;
        return false;
      };

      const isOpenModalRegion = (el) => {
        if (!el || !visible(el) || excludedRegion(el)) return false;
        if (el.matches?.('.modal.show, .offcanvas.show')) return true;
        if (el.id === 'diagramModal' || el.id === 'topicPreviewModal') {
          return visible(el) && !isHiddenSubtree(el);
        }
        if (el.getAttribute('role') === 'dialog' && el.getAttribute('aria-modal') === 'true') {
          return visible(el);
        }
        return false;
      };

      const isStickyFooterRegion = (el) => {
        if (!el || !visible(el) || excludedRegion(el)) return false;
        const cls = String(el.className || '').toLowerCase();
        if (/\bfixed-bottom\b|\bsticky-bottom\b|\bsticky-footer\b|\bsticky-cta\b|\bfixed-cta\b/.test(cls)) {
          return true;
        }
        const style = window.getComputedStyle(el);
        const pos = style.position;
        if (pos !== 'fixed' && pos !== 'sticky') return false;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        return rect.bottom >= vh - 12 && rect.top > vh * 0.45;
      };

      const dedupeRegions = (candidates, predicate) => {
        const roots = [];
        for (const el of candidates) {
          if (!predicate(el)) continue;
          if (roots.some((r) => r.contains(el) && r !== el)) continue;
          roots.push(el);
        }
        const outer = [];
        for (const el of roots) {
          if (roots.some((other) => other !== el && other.contains(el))) continue;
          outer.push(el);
        }
        return outer;
      };

      /** @type {Array<{ region: string, root: Element }>} */
      const regions = [];
      const heroCandidates = dedupeRegions(
        Array.from(document.querySelectorAll(HERO_REGION_SELECTOR)),
        isHeroRegion,
      );
      for (const root of heroCandidates) regions.push({ region: 'hero', root });

      const modalCandidates = dedupeRegions(
        Array.from(document.querySelectorAll(MODAL_REGION_SELECTOR)),
        isOpenModalRegion,
      );
      for (const root of modalCandidates) regions.push({ region: 'modal', root });

      const stickyCandidates = dedupeRegions(
        Array.from(document.querySelectorAll(STICKY_FOOTER_SELECTOR)),
        isStickyFooterRegion,
      );
      for (const root of stickyCandidates) {
        if (regions.some(({ root: r }) => r.contains(root) || root.contains(r))) continue;
        regions.push({ region: 'stickyFooter', root });
      }

      const regionRoots = new Set(regions.map(({ root }) => root));
      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const scanned = new Set();

      for (const { region, root } of regions) {
        const primaries = collectPrimaryActions(root, regionRoots);
        if (primaries.length <= maxAllowed) continue;
        const hint = selectorHintFor(root);
        const key = `${region}:${hint}`;
        if (scanned.has(key)) continue;
        scanned.add(key);
        violations.push({
          kind: 'too-many-primary-ctas',
          region,
          primaryCount: primaries.length,
          maxAllowed,
          selectorHint: hint,
          className: norm(root.className).slice(0, 120),
          labels: primaries.map((el) => textOf(el).slice(0, 48)).filter(Boolean),
        });
      }

      return {
        maxAllowed,
        regionCount: regions.length,
        violations: violations.slice(0, 12),
      };
    },
    { maxAllowed, HERO_REGION_SELECTOR, MODAL_REGION_SELECTOR, STICKY_FOOTER_SELECTOR },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.ctaHierarchyReport
    ?? (page ? await collectCtaHierarchyReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromCtaHierarchyReport(report, url || metrics?.url || '');
}
