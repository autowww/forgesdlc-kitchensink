/**
 * DET.DIAGRAM.ALT — decorative vs informative diagram classification matches
 * role="img" / role="figure" / role="presentation" and aria-hidden usage.
 */

/** Minimum characters for a non-trivial diagram accessible name. */
export const MIN_DIAGRAM_ALT_CHARS = 3;

const DIAGRAM_ROOT_SELECTOR = [
  '.forge-diagram',
  '.ks-diagram-tile',
  '[data-diagram-key]',
  'figure.forge-diagram',
  'figure.forge-diagram-ascii',
].join(',');

const CHART_EXCLUDE_SELECTOR = [
  '[data-ks-chart]',
  '.ks-chart-mount',
  '[data-chart]',
  '.chart',
  '[class*="chart-container"]',
  '[class*="chart-mount"]',
].join(',');

const AMBIENT_EXCLUDE_SELECTOR = [
  '.forge-ambient-bg',
  '.ks-ambient-bg',
  '.forge-aurora',
  '.ks-living-scene',
  '.ks-living-scene__global',
  '.landing-forge-visual',
  '[role="toolbar"]',
  'nav',
  '[role="navigation"]',
].join(',');

export const rule = {
  id: 'DET.DIAGRAM.ALT',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-diagram-alt',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromDiagramAltReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 10)) {
    const kind = String(v.kind || 'diagram-alt-mismatch');
    const hint = String(v.selectorHint || v.className || 'diagram').slice(0, 120);
    const key = `${kind}:${hint}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const messageByKind = {
      'diagram-alt-decorative-named':
        'A decorative diagram exposes an accessible name; use role="presentation" with empty alt and aria-hidden, not role="img"/aria-label.',
      'diagram-alt-informative-hidden':
        'An informative diagram is hidden from assistive tech (aria-hidden or role="presentation") while carrying a caption or alt text.',
      'diagram-alt-missing-summary':
        'An informative diagram lacks alt text, aria-label, or a nearby figcaption for non-visual readers.',
      'diagram-alt-conflicting-role':
        'Diagram aria-hidden and role="img" conflict; decorative assets should not use role="img".',
    };

    const remediationByKind = {
      'diagram-alt-decorative-named':
        'Remove aria-label/alt from decorative diagrams or drop aria-hidden/role="presentation" if the diagram is informative.',
      'diagram-alt-informative-hidden':
        'Remove aria-hidden/role="presentation" from informative diagrams and provide role="figure" or role="img" with alt/aria-label.',
      'diagram-alt-missing-summary':
        'Add meaningful alt, aria-label, aria-labelledby, or figcaption text; mark purely decorative tiles with aria-hidden and empty alt.',
      'diagram-alt-conflicting-role':
        'Use role="presentation" (or no role) with aria-hidden for decorative SVG/img assets instead of role="img".',
    };

    findings.push({
      severity: 'major',
      area: 'accessibility',
      message: messageByKind[kind] || 'Diagram decorative/informative classification does not match aria-hidden or role usage.',
      evidence: `${kind} diagram="${hint}"`,
      remediation: remediationByKind[kind]
        || 'Align decorative diagrams with aria-hidden/empty alt and informative diagrams with role="figure"/role="img" plus text alternatives.',
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
export async function collectDiagramAltReport(page, minAltChars = MIN_DIAGRAM_ALT_CHARS) {
  return page.evaluate(
    ({
      minAltChars,
      DIAGRAM_ROOT_SELECTOR,
      CHART_EXCLUDE_SELECTOR,
      AMBIENT_EXCLUDE_SELECTOR,
    }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 8 && rect.height > 8 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const isHiddenSubtree = (el) => {
        let node = el;
        while (node && node.nodeType === 1) {
          if (node.hasAttribute('hidden')) return true;
          if (node.getAttribute('aria-hidden') === 'true') return true;
          const style = window.getComputedStyle(node);
          if (style.display === 'none' || style.visibility === 'hidden') return true;
          node = node.parentElement;
        }
        return false;
      };

      const textLen = (el) => {
        if (!el || el.nodeType !== 1) return 0;
        return norm(el.innerText || el.textContent || el.getAttribute('aria-label') || '').length;
      };

      const idsHaveText = (idList) => {
        if (!idList) return false;
        for (const id of String(idList).split(/\s+/)) {
          const ref = id && document.getElementById(id);
          if (textLen(ref) >= minAltChars) return true;
        }
        return false;
      };

      const excludedChart = (el) => Boolean(el.closest(CHART_EXCLUDE_SELECTOR));
      const excludedAmbient = (el) => Boolean(el.closest(AMBIENT_EXCLUDE_SELECTOR));

      const figcaptionText = (root) => {
        const fig = root.matches('figure')
          ? root
          : root.closest('figure') || root.querySelector('figcaption')?.closest('figure');
        if (!fig) return '';
        const cap = fig.querySelector('figcaption');
        return cap ? norm(cap.innerText || cap.textContent || '') : '';
      };

      const accessibleName = (root, target) => {
        const nodes = [root, target].filter(Boolean);
        for (const el of nodes) {
          const alt = norm(el.getAttribute('alt') || '');
          if (alt.length >= minAltChars) return alt;
          const ariaLabel = norm(el.getAttribute('aria-label') || '');
          if (ariaLabel.length >= minAltChars) return ariaLabel;
          const title = norm(el.getAttribute('title') || '');
          if (title.length >= minAltChars) return title;
          if (idsHaveText(el.getAttribute('aria-labelledby'))) return 'labelledby';
          if (idsHaveText(el.getAttribute('aria-describedby'))) return 'describedby';
        }
        const caption = figcaptionText(root);
        if (caption.length >= minAltChars) return caption;
        return '';
      };

      const primaryTarget = (root) => {
        if (root.matches('img, svg')) return root;
        return root.querySelector('img, svg[role="img"], svg') || root;
      };

      const isDiagramRoot = (el) => {
        if (!el || el.nodeType !== 1 || !visible(el) || isHiddenSubtree(el)) return false;
        if (excludedChart(el) || excludedAmbient(el)) return false;

        if (el.matches(DIAGRAM_ROOT_SELECTOR)) return true;

        const tag = el.tagName.toLowerCase();
        if (tag === 'img' && el.closest('.ks-diagram-canvas, .forge-diagram, figure.forge-diagram')) {
          return true;
        }

        if (tag === 'svg' && el.getAttribute('role') === 'img') {
          if (el.closest('.forge-diagram, [data-diagram-key], figure.forge-diagram')) return true;
          const rect = el.getBoundingClientRect();
          if (rect.width >= 48 && rect.height >= 48 && el.querySelector('text, tspan')) return true;
        }

        return false;
      };

      const selectorHintFor = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 3).join('.');
        const key = el.getAttribute('data-diagram-key') || '';
        const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
        return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}${key ? `[key=${key}]` : ''}${hash ? `[@${hash}]` : ''}`;
      };

      const classifyDiagram = (root) => {
        const target = primaryTarget(root);
        const roleRoot = norm(root.getAttribute('role') || '');
        const roleTarget = target && target !== root ? norm(target.getAttribute('role') || '') : '';
        const role = roleRoot || roleTarget;

        const ariaHidden = root.getAttribute('aria-hidden') === 'true'
          || (target && target.getAttribute('aria-hidden') === 'true');

        const img = root.matches('img') ? root : root.querySelector('img');
        const emptyAlt = img && img.hasAttribute('alt') && norm(img.getAttribute('alt')) === '';

        const name = accessibleName(root, target);
        const hasName = Boolean(name);

        /** @type {Array<Record<string, unknown>>} */
        const issues = [];

        if (ariaHidden && role === 'img') {
          issues.push({ kind: 'diagram-alt-conflicting-role' });
        } else if (hasName && (ariaHidden || role === 'presentation')) {
          issues.push({ kind: 'diagram-alt-informative-hidden' });
        } else if (emptyAlt && hasName && !ariaHidden && role !== 'presentation') {
          issues.push({ kind: 'diagram-alt-decorative-named' });
        }

        const catalogLinked = root.hasAttribute('data-diagram-key');
        const needsSummary = !ariaHidden && role !== 'presentation'
          && (catalogLinked || role === 'figure' || role === 'img');

        if (needsSummary && !hasName) {
          issues.push({ kind: 'diagram-alt-missing-summary' });
        }

        return issues;
      };

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const scanned = new Set();

      for (const candidate of document.querySelectorAll(DIAGRAM_ROOT_SELECTOR)) {
        if (!isDiagramRoot(candidate)) continue;
        const key = selectorHintFor(candidate);
        if (scanned.has(key)) continue;
        scanned.add(key);

        for (const issue of classifyDiagram(candidate)) {
          violations.push({
            ...issue,
            selectorHint: key,
            className: norm(candidate.className).slice(0, 120),
          });
        }
      }

      for (const svg of document.querySelectorAll('svg[role="img"]')) {
        if (!isDiagramRoot(svg)) continue;
        const mount = svg.closest('.forge-diagram, [data-diagram-key], figure.forge-diagram') || svg;
        const key = selectorHintFor(mount);
        if (scanned.has(key)) continue;
        scanned.add(key);

        for (const issue of classifyDiagram(mount)) {
          violations.push({
            ...issue,
            selectorHint: key,
            className: norm(mount.className).slice(0, 120),
          });
        }
      }

      return {
        minAltChars,
        diagramCount: scanned.size,
        violations: violations.slice(0, 12),
      };
    },
    { minAltChars, DIAGRAM_ROOT_SELECTOR, CHART_EXCLUDE_SELECTOR, AMBIENT_EXCLUDE_SELECTOR },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.diagramAltReport
    ?? (page ? await collectDiagramAltReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromDiagramAltReport(report, url || metrics?.url || '');
}
