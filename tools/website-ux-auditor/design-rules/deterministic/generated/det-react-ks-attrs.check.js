/**
 * DET.REACT.KS_ATTRS — KS React primitive roots emit data-ks-hash, data-ks-type,
 * and data-ks-name per ksReactPrimitiveAttrs / ksVisualAttrs conventions.
 */

/** Cap findings per page pass (DOM scan). */
export const MAX_REACT_KS_ATTRS_FINDINGS = 10;

/** Governed hash token shape (matches react/ksVisualAttrs.ts). */
export const HASH_TOKEN_RE = /^[A-Za-z]{3}$/;

const PRIMITIVE_ROOT_SELECTOR = [
  '[data-ks-react-root="true"]',
  '[data-ks-type="react-primitive"][data-ks-hash]',
  '[data-ks-type="react-primitive"]',
].join(',');

export const rule = {
  id: 'DET.REACT.KS_ATTRS',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'minor',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-react-ks_attrs',
};

/**
 * @param {string} hash
 * @returns {boolean}
 */
export function isValidKsHashToken(hash) {
  const h = String(hash || '').trim();
  return HASH_TOKEN_RE.test(h) && new Set(h).size === 3;
}

/**
 * @param {{
 *   primitiveRootCount?: number,
 *   violations?: Array<Record<string, unknown>>,
 * } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromReactKsAttrsReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, MAX_REACT_KS_ATTRS_FINDINGS)) {
    const kind = String(v.kind || 'unknown');
    const key = `${kind}:${v.hash || ''}:${v.ksName || ''}:${v.tag || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const hash = String(v.hash || '?');
    const tag = String(v.tag || 'element');
    const ksName = String(v.ksName || '');

    let message = 'A KS React primitive root is missing governed data-ks-* markers.';
    let remediation =
      'Spread `ksReactPrimitiveAttrs(componentKey)` from `react/ksVisualAttrs.ts` on each primitive root per docs/design/catalog/primitives/FAM-react-primitives.md.';

    if (kind === 'missing-data-ks-hash') {
      message = 'A KS React primitive root is missing data-ks-hash.';
    } else if (kind === 'invalid-data-ks-hash') {
      message = `A KS React primitive root has invalid data-ks-hash="${hash}" (expected three distinct ASCII letters).`;
    } else if (kind === 'missing-data-ks-type') {
      message = 'A KS React primitive root is missing data-ks-type.';
    } else if (kind === 'wrong-data-ks-type') {
      message = `A KS React primitive root has data-ks-type="${String(v.ksType || '')}" — expected "react-primitive".`;
    } else if (kind === 'missing-data-ks-name') {
      message = 'A KS React primitive root is missing data-ks-name.';
    } else if (kind === 'hash-mismatch') {
      message = `hash="${String(v.hashAttr || '')}" and data-ks-hash="${hash}" disagree on a react-primitive root.`;
      remediation =
        'Emit the same three-letter hash in both `hash` and `data-ks-hash` via `ksReactPrimitiveAttrs()` on the primitive root.';
    } else if (kind === 'missing-hash-attr') {
      message = 'A KS React primitive root has data-ks-hash without a matching hash= attribute.';
      remediation =
        'Include both `hash` and `data-ks-hash` on primitive roots (see `ksVisualAttrs` / `ksReactPrimitiveAttrs`).';
    } else if (kind === 'missing-react-root-flag') {
      message = 'A react-primitive root is missing data-ks-react-root="true".';
      remediation =
        'Use `ksReactPrimitiveAttrs()` so the root carries data-ks-react-root="true" for registry selectors.';
    }

    findings.push({
      severity: kind === 'invalid-data-ks-hash' || kind === 'hash-mismatch' ? 'warn' : 'minor',
      area: 'visual-catalog',
      hash: hash !== '?' ? hash : undefined,
      selector: hash !== '?' ? `[data-ks-hash="${hash}"]` : undefined,
      message,
      evidence: `kind=${kind} <${tag}> data-ks-name=${ksName || '(missing)'} hash=${hash}`,
      remediation,
    });
  }

  const total = violations.length;
  if (total > MAX_REACT_KS_ATTRS_FINDINGS && findings.length >= MAX_REACT_KS_ATTRS_FINDINGS) {
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message: `Additional react-primitive KS attribute issues omitted (${total - MAX_REACT_KS_ATTRS_FINDINGS} more).`,
      evidence: `react_ks_attrs_violation_total=${total}`,
      remediation:
        'Inspect forge-react-primitives showcase HTML and ensure every primitive root uses ksReactPrimitiveAttrs().',
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
export async function collectReactKsAttrsReport(page) {
  return page.evaluate(({ PRIMITIVE_ROOT_SELECTOR }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const hashRe = /^[A-Za-z]{3}$/;

      const isValidHash = (h) => {
        const t = norm(h);
        return hashRe.test(t) && new Set(t).size === 3;
      };

      const visible = (el) => {
        if (!el || el.nodeType !== 1) return false;
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

      const isPrimitiveRoot = (el) => {
        if (el.getAttribute('data-ks-react-root') === 'true') return true;
        if (norm(el.getAttribute('data-ks-type')) === 'react-primitive') return true;
        return false;
      };

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const nodes = [...document.querySelectorAll(PRIMITIVE_ROOT_SELECTOR)];
      const roots = nodes.filter((el) => isPrimitiveRoot(el) && visible(el) && !isHiddenSubtree(el));

      const push = (payload) => {
        violations.push(payload);
      };

      for (const root of roots) {
        const tag = root.tagName.toLowerCase();
        const dataHash = norm(root.getAttribute('data-ks-hash') || '');
        const hashAttr = norm(root.getAttribute('hash') || '');
        const ksType = norm(root.getAttribute('data-ks-type') || '');
        const ksName = norm(root.getAttribute('data-ks-name') || '');
        const hash = dataHash || hashAttr || '?';

        if (!dataHash) {
          push({ kind: 'missing-data-ks-hash', hash, tag, ksName });
        } else if (!isValidHash(dataHash)) {
          push({ kind: 'invalid-data-ks-hash', hash: dataHash, tag, ksName });
        }

        if (!ksType) {
          push({ kind: 'missing-data-ks-type', hash, tag, ksName });
        } else if (ksType !== 'react-primitive') {
          push({ kind: 'wrong-data-ks-type', hash, tag, ksName, ksType });
        }

        if (!ksName) {
          push({ kind: 'missing-data-ks-name', hash, tag, ksName });
        }

        if (dataHash && hashAttr && dataHash !== hashAttr) {
          push({ kind: 'hash-mismatch', hash: dataHash, hashAttr, tag, ksName });
        } else if (dataHash && !hashAttr) {
          push({ kind: 'missing-hash-attr', hash: dataHash, tag, ksName });
        }

        if (root.getAttribute('data-ks-react-root') !== 'true' && ksType === 'react-primitive') {
          push({ kind: 'missing-react-root-flag', hash, tag, ksName });
        }
      }

      return {
        primitiveRootCount: roots.length,
        violations: violations.slice(0, 12),
      };
    }, { PRIMITIVE_ROOT_SELECTOR });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.reactKsAttrsReport
    ?? (page ? await collectReactKsAttrsReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromReactKsAttrsReport(report, url || metrics?.url || '');
}
