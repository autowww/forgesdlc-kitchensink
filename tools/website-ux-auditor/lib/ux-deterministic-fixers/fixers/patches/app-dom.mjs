/**
 * HTML patches for DET.APP.* rules (static shells and harness fixtures).
 */

import { patchPrimitiveStylesHtml } from '../../vite-react-patcher/css-patcher.mjs';

/**
 * @param {string} html
 */
export function patchDemoDisclosureHtml(html) {
  return html.replace(
    /(<(?:div|section|article)\b[^>]*\bdata-demo(?:=["'][^"']*["'])?[^>]*>)/gi,
    (open) => {
      if (/\b(demo|sample|mock|illustrative)\b/i.test(open)) return open;
      return `${open}\n  <span class="badge studio-demo-label">Demo sample</span>`;
    },
  );
}

/**
 * @param {string} html
 */
export function patchPrimaryCtaHtml(html) {
  let kept = false;
  return html.replace(
    /<(?:button|a)\b([^>]*(?:data-studio-primary-cta|\bclass=["'][^"']*btn-primary[^"']*["'])[^>]*)>/gi,
    (full, attrs) => {
      if (!kept) {
        kept = true;
        if (!/\bdata-studio-primary-cta\b/.test(attrs)) {
          return full.replace(/>$/, ' data-studio-primary-cta="true">');
        }
        return full;
      }
      let next = attrs.replace(/\s*data-studio-primary-cta(?:=["'][^"']*["'])?/gi, '');
      next = next.replace(/\bclass=(["'])([^"']*)\1/i, (_m, q, cls) => {
        return `class=${q}${cls.replace(/\bbtn-primary\b/g, 'btn-secondary')}${q}`;
      });
      return full.replace(attrs, next);
    },
  );
}

/**
 * @param {string} html
 */
export function patchPrimaryStateHtml(html) {
  let kept = false;
  return html.replace(
    /<(?:div|section)\b([^>]*(?:data-studio-primary-state|studio-state--)[^>]*)>/gi,
    (full, attrs) => {
      if (!kept) {
        kept = true;
        if (!/\bdata-studio-primary-state\b/.test(attrs)) {
          return full.replace(/>$/, ' data-studio-primary-state="true">');
        }
        return full;
      }
      if (/\bhidden\b/.test(attrs) || /style=["'][^"']*display\s*:\s*none/.test(attrs)) return full;
      return full.replace(/>$/, ' hidden aria-hidden="true">');
    },
  );
}

/**
 * @param {string} html
 */
export function patchTabPanelHtml(html) {
  let tabIdx = 0;
  return html.replace(
    /<(?:button|a)\b([^>]*role=["']tab["'][^>]*)>/gi,
    (full, attrs) => {
      const panel = `studio-tab-panel-${tabIdx}`;
      tabIdx += 1;
      let next = attrs;
      if (!/\baria-selected=/.test(next)) {
        next += tabIdx === 1 ? ' aria-selected="true"' : ' aria-selected="false"';
      }
      if (!/\baria-controls=/.test(next)) next += ` aria-controls="${panel}"`;
      return `<button${next}>`;
    },
  );
}

/**
 * @param {string} html
 */
export function patchTileAffordanceHtml(html) {
  return html.replace(
    /<(?:div|article)\b([^>]*(?:data-studio-tile|dashboard-kpi-card)[^>]*)>/gi,
    (full, attrs) => {
      if (/\bhref=/.test(attrs) || /\brole=["']button["']/.test(attrs)) return full;
      let next = attrs;
      if (!/\brole=/.test(next)) next += ' role="button"';
      if (!/\btabindex=/.test(next)) next += ' tabindex="0"';
      return `<div${next}>`;
    },
  );
}

/**
 * @param {string} html
 */
export function patchShellIntegrationHtml(html) {
  return html.replace(
    /<div\b([^>]*\bclass=["'][^"']*\balert\b[^"']*["'][^>]*)>([\s\S]*?)<\/div>/gi,
    (full, attrs, inner) => {
      if (!/\bks-fe-|\bdata-ks-react-root/.test(full)) return full;
      if (/\bks-fe-status-banner\b/.test(attrs)) return full;
      return `<div class="ks-fe-status-banner ks-fe-banner--info"${attrs.replace(/\bclass=["'][^"']*["']/i, '')}>${inner}</div>`;
    },
  );
}

/**
 * @param {string} html
 * @param {string} ruleId
 */
export function patchAppHtmlForRule(html, ruleId) {
  switch (ruleId) {
    case 'DET.APP.DEMO_DISCLOSURE':
      return patchDemoDisclosureHtml(html);
    case 'DET.APP.PRIMARY_CTA':
      return patchPrimaryCtaHtml(html);
    case 'DET.APP.PRIMARY_STATE':
      return patchPrimaryStateHtml(html);
    case 'DET.APP.TAB_PANEL':
      return patchTabPanelHtml(html);
    case 'DET.APP.TILE_AFFORDANCE':
      return patchTileAffordanceHtml(html);
    case 'DET.APP.SHELL_INTEGRATION':
      return patchShellIntegrationHtml(html);
    case 'DET.APP.PRIMITIVE_STYLES':
      return patchPrimitiveStylesHtml(html);
    default:
      return html;
  }
}
