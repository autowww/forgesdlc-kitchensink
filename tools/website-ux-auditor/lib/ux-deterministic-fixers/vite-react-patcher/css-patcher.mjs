/**
 * CSS and Vite entry patches for font stack, primitive imports, overflow.
 */

/**
 * @param {string} css
 * @param {string} selector
 * @param {string} token e.g. var(--forge-font-body)
 */
export function patchFontStackRule(css, selector, token) {
  if (!selector) {
    return css.replace(
      /font-family\s*:\s*[^;}\n]+;/gi,
      (m, offset, whole) => {
        if (/\bvar\s*\(\s*--forge-font-/.test(m)) return m;
        const before = whole.slice(Math.max(0, offset - 80), offset);
        if (/body\s*\{/.test(before) || /:root\s*\{/.test(before)) {
          return `font-family: ${token};`;
        }
        return m;
      },
    );
  }
  const selEsc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const blockRx = new RegExp(
    `(${selEsc}\\s*\\{[^}]*?)font-family\\s*:[^;}\n]*;`,
    'i',
  );
  if (blockRx.test(css)) {
    return css.replace(blockRx, `$1font-family: ${token};`);
  }
  return `${css}\n${selector} {\n  font-family: ${token};\n}\n`;
}

/**
 * @param {string} src
 * @param {string} cssImportPath
 */
export function ensureCssImportInTs(src, cssImportPath) {
  const imp = `import '${cssImportPath}';\n`;
  if (src.includes(cssImportPath)) return src;
  const lines = src.split('\n');
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*import\s/.test(lines[i])) lastImport = i;
  }
  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, imp.trim());
    return `${lines.join('\n')}\n`;
  }
  return `${imp}${src}`;
}

/**
 * @param {string} html
 * @param {string} href
 */
export function ensureCssLinkInHtml(html, href) {
  if (html.includes(href)) return html;
  const tag = `<link rel="stylesheet" href="${href}" />`;
  if (/<link[^>]+rel=["']stylesheet["']/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>\n  ${tag}`);
  }
  return html.replace(/<head([^>]*)>/i, `<head$1>\n  ${tag}`);
}

/**
 * @param {string} css
 */
export function patchResponsiveOverflow(css) {
  if (/overflow-x\s*:\s*hidden/.test(css) && /\.studio-page|main|\[data-studio-workspace\]/.test(css)) {
    return css;
  }
  return `${css}\n/* ux-fixer: contain horizontal overflow */\nbody, main, [data-studio-workspace], .studio-page {\n  overflow-x: hidden;\n  max-width: 100%;\n}\n`;
}

/**
 * @param {string} html
 */
export function patchPrimitiveStylesHtml(html) {
  const hrefs = [
    'css/forge-react-primitives.css',
    '/css/forge-react-primitives.css',
    '../css/forge-react-primitives.css',
  ];
  for (const href of hrefs) {
    if (html.includes('forge-react-primitives')) return html;
  }
  return ensureCssLinkInHtml(html, 'css/forge-react-primitives.css');
}
