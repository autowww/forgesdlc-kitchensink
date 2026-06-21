/**
 * Safe string-level JSX/TSX patches (no AST — refuses ambiguous matches).
 */

/**
 * @param {string} src
 * @param {string} attrName
 */
export function hasJsxAttr(src, attrName) {
  return new RegExp(`\\b${attrName}\\s*=`, 'm').test(src);
}

/**
 * @param {string} openTag inner portion after tag name (includes leading space)
 * @param {string} attrName
 * @param {string} value quoted or expression
 */
export function injectJsxAttr(openTag, attrName, value) {
  if (new RegExp(`\\b${attrName}\\s*=`).test(openTag)) return openTag;
  return `${openTag} ${attrName}=${value}`;
}

/**
 * Add attribute to first matching JSX opening tag.
 * @param {string} src
 * @param {RegExp} tagOpenRe must capture open tag through `>` in group 1
 * @param {string} attrName
 * @param {string} value e.g. '"demo"' or '{"demo"}'
 */
export function patchFirstJsxTag(src, tagOpenRe, attrName, value) {
  return src.replace(tagOpenRe, (full, openInner) => {
    if (hasJsxAttr(openInner, attrName)) return full;
    const injected = injectJsxAttr(openInner, attrName, value);
    return full.replace(openInner, injected);
  });
}

/**
 * @param {string} src
 * @param {string} selectorHint e.g. #foo or data-demo
 */
export function patchDemoDisclosureJsx(src) {
  let next = src;
  const demoRe = /(<(?:div|section|article)\b)([^>]*\bdata-demo(?:-label)?(?:=\{[^}]+\}|="[^"]*"|='[^']*')?[^>]*)>/gi;
  if (!demoRe.test(src)) return src;
  next = src.replace(demoRe, (full, tag, attrs) => {
    if (/\b(demo|sample|mock|illustrative)\b/i.test(full)) return full;
    return `${tag}${attrs}>\n        <span className="studio-demo-label badge">Demo sample</span>`;
  });
  return next;
}

/**
 * @param {string} src
 */
export function patchPrimaryCtaJsx(src) {
  let seen = false;
  return src.replace(
    /(<(?:button|a)\b)([^>]*(?:data-studio-primary-cta|\bclassName=["'][^"']*btn-primary[^"']*["'])[^>]*)>/gi,
    (full, tag, attrs) => {
      if (!seen) {
        seen = true;
        if (!/\bdata-studio-primary-cta\b/.test(attrs)) {
          return `${tag}${attrs} data-studio-primary-cta="true">`;
        }
        return full;
      }
      let next = attrs.replace(/\s*data-studio-primary-cta(?:=\{[^}]+\}|="[^"]*"|='[^']*')?/gi, '');
      next = next.replace(/className=(["'])([^"']*)\1/i, (_m, q, cls) => {
        const demoted = cls.replace(/\bbtn-primary\b/g, 'btn-secondary');
        return `className=${q}${demoted}${q}`;
      });
      return `${tag}${next}>`;
    },
  );
}

/**
 * @param {string} src
 */
export function patchPrimaryStateJsx(src) {
  let marked = false;
  return src.replace(
    /(<(?:div|section)\b)([^>]*(?:data-studio-primary-state|studio-state--)[^>]*)>/gi,
    (full, tag, attrs) => {
      if (!marked) {
        marked = true;
        if (!/\bdata-studio-primary-state\b/.test(attrs)) {
          return `${tag}${attrs} data-studio-primary-state="true">`;
        }
        return full;
      }
      if (/\bhidden\b/.test(attrs) || /style=\{\{[^}]*display:\s*['"]none/.test(attrs)) return full;
      return `${tag}${attrs} hidden aria-hidden="true">`;
    },
  );
}

/**
 * @param {string} src
 */
export function patchTabPanelJsx(src) {
  let panelId = 'studio-tab-panel-0';
  let tabIdx = 0;
  return src.replace(
    /(<(?:button|a)\b)([^>]*role=["']tab["'][^>]*)>/gi,
    (full, tag, attrs) => {
      const id = `studio-tab-${tabIdx}`;
      const panel = `${panelId}-${tabIdx}`;
      tabIdx += 1;
      let next = attrs;
      if (!/\baria-selected=/.test(next)) {
        next += tabIdx === 1 ? ' aria-selected="true"' : ' aria-selected="false"';
      }
      if (!/\baria-controls=/.test(next)) {
        next += ` aria-controls="${panel}"`;
      }
      if (!/\bid=/.test(next)) next += ` id="${id}"`;
      return `${tag}${next}>`;
    },
  );
}

/**
 * @param {string} src
 */
export function patchTileAffordanceJsx(src) {
  return src.replace(
    /(<(?:div|article)\b)([^>]*(?:data-studio-tile|dashboard-kpi-card)[^>]*)>/gi,
    (full, tag, attrs) => {
      if (/\bhref=/.test(attrs) || /\brole=["']button["']/.test(attrs)) return full;
      let next = attrs;
      if (!/\brole=/.test(next)) next += ' role="button"';
      if (!/\btabIndex=/.test(next) && !/\btabindex=/.test(next)) next += ' tabIndex={0}';
      return `${tag}${next}>`;
    },
  );
}

/**
 * @param {string} src
 * @param {string} ruleId
 */
export function patchJsxForRule(src, ruleId) {
  switch (ruleId) {
    case 'DET.APP.DEMO_DISCLOSURE':
      return patchDemoDisclosureJsx(src);
    case 'DET.APP.PRIMARY_CTA':
      return patchPrimaryCtaJsx(src);
    case 'DET.APP.PRIMARY_STATE':
      return patchPrimaryStateJsx(src);
    case 'DET.APP.TAB_PANEL':
      return patchTabPanelJsx(src);
    case 'DET.APP.TILE_AFFORDANCE':
      return patchTileAffordanceJsx(src);
    default:
      return src;
  }
}

/**
 * @param {string} src
 * @param {Record<string, string>} attrs
 */
export function patchJsxRootAttrs(src, attrs) {
  let next = src;
  for (const [name, value] of Object.entries(attrs)) {
    next = patchFirstJsxTag(
      next,
      /(<[A-Za-z][A-Za-z0-9]*)(\s[^>]*)>/,
      name,
      `"${value}"`,
    );
  }
  return next;
}
