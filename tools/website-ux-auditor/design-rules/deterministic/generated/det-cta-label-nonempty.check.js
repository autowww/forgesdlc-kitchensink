/**
 * DET.CTA.LABEL_NONEMPTY — visible buttons and links expose a non-empty accessible name.
 */

/** Minimum trimmed characters for an accessible control name. */
export const MIN_CTA_LABEL_CHARS = 1;

const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button',
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="reset"]',
  'input[type="image"]',
  '[role="button"]',
  '[role="link"]',
].join(',');

export const rule = {
  id: 'DET.CTA.LABEL_NONEMPTY',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-cta-label_nonempty',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>>, minLabelChars?: number } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromCtaLabelNonemptyReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 10)) {
    const hint = String(v.selectorHint || v.tag || 'control').slice(0, 120);
    const key = `${hint}:${v.kind || 'empty-label'}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const tag = String(v.tag || 'control');
    findings.push({
      severity: 'major',
      area: 'accessibility',
      message:
        `A ${tag} is missing a non-empty accessible name; add visible text, aria-label, or alt text for icon-only controls.`,
      evidence: `empty_accessible_name ${tag}="${hint}"`,
      remediation:
        'Provide visible link/button text, aria-label, aria-labelledby to visible text, title (when appropriate), or meaningful img alt for icon-only CTAs.',
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
export async function collectCtaLabelNonemptyReport(page, minLabelChars = MIN_CTA_LABEL_CHARS) {
  return page.evaluate(
    ({ minLabelChars, INTERACTIVE_SELECTOR }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
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

      const textFromNode = (node) => {
        if (!node || node.nodeType !== 1) return '';
        if (node.getAttribute('aria-hidden') === 'true') return '';
        const tag = node.tagName.toLowerCase();
        if (tag === 'img') {
          return norm(node.getAttribute('alt') || '');
        }
        if (tag === 'input') {
          const type = String(node.getAttribute('type') || 'text').toLowerCase();
          if (type === 'image') return norm(node.getAttribute('alt') || '');
          if (['button', 'submit', 'reset'].includes(type)) {
            return norm(node.value || node.getAttribute('value') || '');
          }
        }
        let out = '';
        for (const child of node.childNodes) {
          if (child.nodeType === 3) out += child.textContent || '';
          else if (child.nodeType === 1) out += ` ${textFromNode(child)}`;
        }
        return norm(out);
      };

      const accessibleName = (el) => {
        const ariaLabel = norm(el.getAttribute('aria-label') || '');
        if (ariaLabel.length >= minLabelChars) return ariaLabel;

        const labelledby = el.getAttribute('aria-labelledby');
        if (labelledby) {
          const parts = [];
          for (const id of labelledby.split(/\s+/)) {
            const ref = id && document.getElementById(id);
            if (ref) parts.push(textFromNode(ref));
          }
          const joined = norm(parts.join(' '));
          if (joined.length >= minLabelChars) return joined;
        }

        const tag = el.tagName.toLowerCase();
        if (tag === 'input') {
          const type = String(el.getAttribute('type') || 'text').toLowerCase();
          if (type === 'image') {
            const alt = norm(el.getAttribute('alt') || '');
            if (alt.length >= minLabelChars) return alt;
          }
          if (['button', 'submit', 'reset'].includes(type)) {
            const val = norm(el.value || el.getAttribute('value') || '');
            if (val.length >= minLabelChars) return val;
          }
        }

        const title = norm(el.getAttribute('title') || '');
        if (title.length >= minLabelChars) return title;

        for (const img of el.querySelectorAll('img[alt]')) {
          if (isHiddenSubtree(img)) continue;
          const alt = norm(img.getAttribute('alt') || '');
          if (alt.length >= minLabelChars) return alt;
        }

        for (const hidden of el.querySelectorAll(
          '.sr-only, .visually-hidden, .visually-hidden-focusable, [class*="sr-only"]',
        )) {
          if (isHiddenSubtree(hidden)) continue;
          const t = textFromNode(hidden);
          if (t.length >= minLabelChars) return t;
        }

        return textFromNode(el);
      };

      const isInteractiveControl = (el) => {
        if (!el || el.nodeType !== 1 || !visible(el) || isHiddenSubtree(el)) return false;
        if (el.hasAttribute('inert')) return false;
        const tag = el.tagName.toLowerCase();
        const role = String(el.getAttribute('role') || '').toLowerCase();

        if (tag === 'button') {
          return el.getAttribute('type') !== 'hidden' && !el.disabled;
        }
        if (tag === 'a') {
          const href = norm(el.getAttribute('href') || '');
          if (!href || href === '#') {
            return role === 'button' || role === 'link';
          }
          return true;
        }
        if (tag === 'input') {
          const type = String(el.getAttribute('type') || 'text').toLowerCase();
          if (!['button', 'submit', 'reset', 'image'].includes(type)) return false;
          return !el.disabled;
        }
        if (role === 'button' || role === 'link') return true;
        return false;
      };

      const nestedInteractiveAncestor = (el) => {
        let node = el.parentElement;
        while (node) {
          if (node !== el && isInteractiveControl(node)) return node;
          node = node.parentElement;
        }
        return null;
      };

      const selectorHintFor = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 3).join('.');
        const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
        return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}${hash ? `[@${hash}]` : ''}`;
      };

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const scanned = new Set();

      for (const el of document.querySelectorAll(INTERACTIVE_SELECTOR)) {
        if (!isInteractiveControl(el)) continue;
        if (nestedInteractiveAncestor(el)) continue;
        const hint = selectorHintFor(el);
        if (scanned.has(hint)) continue;
        scanned.add(hint);
        const name = accessibleName(el);
        if (name.length >= minLabelChars) continue;

        violations.push({
          kind: 'empty-accessible-name',
          tag: el.tagName.toLowerCase(),
          selectorHint: hint,
          role: el.getAttribute('role') || '',
          href: el.getAttribute('href') || '',
        });
      }

      return {
        minLabelChars,
        controlCount: scanned.size,
        violations: violations.slice(0, 16),
      };
    },
    { minLabelChars, INTERACTIVE_SELECTOR },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.ctaLabelNonemptyReport
    ?? (page ? await collectCtaLabelNonemptyReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromCtaLabelNonemptyReport(report, url || metrics?.url || '');
}
