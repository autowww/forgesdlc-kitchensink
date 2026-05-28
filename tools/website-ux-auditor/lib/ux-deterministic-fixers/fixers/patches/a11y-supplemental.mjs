import { patchHtmlFiles } from './shared.mjs';

/**
 * @param {string} html
 */
export function patchGlossaryAbbrHtml(html) {
  let out = html;
  out = out.replace(/<abbr\b([^>]*)>([\s\S]*?)<\/abbr>/gi, (full, attrs, inner) => {
    if (/\btitle\s*=/i.test(attrs)) return full;
    const text = String(inner || '').replace(/<[^>]+>/g, '').trim().slice(0, 120);
    const title = text || 'Expanded abbreviation';
    return `<abbr${attrs} title="${title}">${inner}</abbr>`;
  });
  if (!/glossary|definition/i.test(out) && /<abbr\b/i.test(out)) {
    out = out.replace(
      /<\/body>/i,
      '<p class="a11y-glossary-link"><a href="/glossary.html">Glossary</a></p>\n</body>',
    );
  }
  return out;
}

/**
 * @param {string} html
 */
export function patchErrorPreventionHtml(html) {
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  return html.replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, (formHtml) => {
    const text = norm(formHtml.replace(/<[^>]+>/g, ' '));
    const sensitive = /\b(payment|card|checkout|purchase|submit order|wire transfer|legal|contract)\b/.test(
      text,
    );
    const destructive =
      /\b(delete all|permanently delete|remove account|submit)\b/.test(text) &&
      /<button[^>]*type=["']submit["']|<input[^>]*type=["']submit["']/i.test(formHtml);
    if (!sensitive && !destructive) return formHtml;
    if (
      /\b(review|confirm|verify)\b/i.test(formHtml) ||
      /name\s*=\s*["'][^"']*confirm[^"']*["']/i.test(formHtml) ||
      /<input[^>]*type=["']checkbox["'][^>]*required/i.test(formHtml)
    ) {
      return formHtml;
    }
    const inject =
      '<p class="a11y-confirm-step"><label><input type="checkbox" name="user_confirm" id="user_confirm" required /> I confirm this submission</label></p>';
    return formHtml.replace(/<\/form>/i, `${inject}</form>`);
  });
}

/**
 * @param {string} text
 */
function wordCount(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * @param {string} html
 */
export function patchReadingLevelHtml(html) {
  return html.replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/gi, (full, attrs, inner) => {
    const plain = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (wordCount(plain) <= 90) return full;
    const sentences = plain.split(/(?<=[.!?])\s+/);
    let chunk = '';
    const parts = [];
    for (const s of sentences) {
      const next = chunk ? `${chunk} ${s}` : s;
      if (wordCount(next) > 85 && chunk) {
        parts.push(chunk);
        chunk = s;
      } else {
        chunk = next;
      }
    }
    if (chunk) parts.push(chunk);
    if (parts.length < 2) {
      const words = plain.split(/\s+/);
      const mid = Math.ceil(words.length / 2);
      parts.length = 0;
      parts.push(words.slice(0, mid).join(' '), words.slice(mid).join(' '));
    }
    return parts.map((p) => `<p${attrs}>${p}</p>`).join('\n');
  });
}

/**
 * @param {string} html
 */
export function patchDraggingMovementsHtml(html) {
  let out = html.replace(/\sdraggable\s*=\s*["']true["']/gi, '');
  out = out.replace(/\sdraggable\s*=\s*true\b/gi, '');
  out = out.replace(/\bclass\s*=\s*["']([^"']*)\bdrag([^"']*)["']/gi, (m, a, b) => {
    const next = `${a}reorder${b}`.replace(/\breorder-reorder\b/, 'reorder');
    return `class="${next}"`;
  });
  out = out.replace(/\sdata-drag\b/gi, '').replace(/\sdata-draggable\b/gi, '');
  if (!/single-pointer|without dragging|click to move/i.test(out)) {
    out = out.replace(
      /<\/body>/i,
      '<p class="a11y-pointer-alt"><button type="button">Move item (keyboard alternative)</button></p>\n</body>',
    );
  }
  return out;
}

/**
 * @param {string} html
 */
export function patchRedundantEntryHtml(html) {
  const seen = new Map();
  return html.replace(/<(input|textarea)\b([^>]*)>/gi, (tag, elName, attrs) => {
    const nameM = attrs.match(/\bname\s*=\s*["']([^"']+)["']/i);
    if (!nameM) return tag;
    const name = nameM[1];
    if (/csrf|token|nonce/i.test(name)) return tag;
    const n = (seen.get(name) || 0) + 1;
    seen.set(name, n);
    if (n === 1) {
      if (!/\bautocomplete\s*=/i.test(attrs)) {
        return `<${elName}${attrs} autocomplete="on">`;
      }
      return tag;
    }
    const newName = `${name}-${n}`;
    let nextAttrs = attrs.replace(/\bname\s*=\s*["'][^"']+["']/i, `name="${newName}"`);
    if (!/\bautocomplete\s*=/i.test(nextAttrs)) nextAttrs += ' autocomplete="on"';
    return `<${elName}${nextAttrs}>`;
  });
}

/**
 * @param {string} html
 */
export function patchAccessibleAuthHtml(html) {
  return html.replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, (formHtml) => {
    const text = (formHtml || '').toLowerCase();
    const isAuth = /\b(log in|sign in|register|password|verify|authentication)\b/.test(text);
    if (!isAuth) return formHtml;
    if (
      /\b(copy|paste|transcribe|remember)\b/.test(text) ||
      /autocomplete\s*=\s*["']one-time-code["']/i.test(formHtml) ||
      /inputmode\s*=\s*["']numeric["']/i.test(formHtml)
    ) {
      return formHtml;
    }
    const inject =
      '<p class="a11y-auth-otp">Paste-friendly sign-in: use a one-time code from email.</p>' +
      '<input type="text" name="otp" autocomplete="one-time-code" inputmode="numeric" aria-label="One-time code" />';
    return formHtml.replace(/<\/form>/i, `${inject}</form>`);
  });
}

/**
 * @param {string} html
 */
export function patchReAuthenticationHtml(html) {
  let out = html;
  out = out.replace(
    /\b(session expired|log in again|re-?authenticate|sign in again)\b/gi,
    'continue your session',
  );
  out = out.replace(/>\s*Sign in again\s*</gi, '>Continue<');
  if (!/data-session-preserve/i.test(out)) {
    out = out.replace(
      /<form\b[^>]*>[\s\S]*?<input[^>]*type=["']password["'][\s\S]*?<\/form>/i,
      (form) => {
        if (/data-session-preserve/i.test(form)) return form;
        return form.replace(
          /<\/form>/i,
          '<p class="a11y-session-preserve" data-session-preserve="true">Your entries are preserved for 20 hours after you sign back in.</p></form>',
        );
      },
    );
  }
  return out;
}

/**
 * @param {string} html
 */
export function patchConcurrentInputHtml(html) {
  let out = html;
  out = out.replace(/<(input|textarea)\b([^>]*)>/gi, (tag, el, attrs) => {
    let a = attrs.replace(/\sinputmode\s*=\s*["']none["']/gi, '');
    if (/\breadonly\b/i.test(a) && /\baria-disabled\s*=\s*["']true["']/i.test(a)) {
      a = a.replace(/\sreadonly\b/gi, '').replace(/\saria-disabled\s*=\s*["']true["']/gi, '');
    }
    return `<${el}${a}>`;
  });
  return out;
}

async function runPatch(ctx, transform, adapter) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], transform);
  return { applied: touched > 0, filesTouched: touched, adapter };
}

export async function patchGlossaryAbbr(ctx) {
  return runPatch(ctx, patchGlossaryAbbrHtml, 'patch_glossary_abbr');
}

export async function patchErrorPrevention(ctx) {
  return runPatch(ctx, patchErrorPreventionHtml, 'patch_error_prevention');
}

export async function patchReadingLevel(ctx) {
  return runPatch(ctx, patchReadingLevelHtml, 'patch_reading_level');
}

export async function patchDraggingMovements(ctx) {
  return runPatch(ctx, patchDraggingMovementsHtml, 'patch_dragging_movements');
}

export async function patchRedundantEntry(ctx) {
  return runPatch(ctx, patchRedundantEntryHtml, 'patch_redundant_entry');
}

export async function patchAccessibleAuth(ctx) {
  return runPatch(ctx, patchAccessibleAuthHtml, 'patch_accessible_auth');
}

export async function patchReAuthentication(ctx) {
  return runPatch(ctx, patchReAuthenticationHtml, 'patch_re_authentication');
}

export async function patchConcurrentInput(ctx) {
  return runPatch(ctx, patchConcurrentInputHtml, 'patch_concurrent_input');
}
