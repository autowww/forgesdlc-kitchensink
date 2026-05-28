import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.ACCESSIBLE_AUTHENTICATION',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-accessible-authentication',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    for (const form of document.querySelectorAll('form')) {
      const text = (form.textContent || '').toLowerCase();
      const isAuth = /\b(log in|sign in|register|password|verify|authentication)\b/.test(text);
      if (!isAuth) continue;
      const hasCopyTest = /\b(copy|paste|transcribe|remember)\b/.test(text);
      const hasAlt =
        form.querySelector('[type="email"],[autocomplete="username"],[autocomplete="current-password"]') &&
        form.querySelector('button[type="submit"],input[type="submit"]');
      if (!hasCopyTest && !form.querySelector('[autocomplete="one-time-code"],[inputmode="numeric"]')) {
        hits.push({ id: form.id || '', kind: 'auth-no-otp-hint' });
        if (hits.length >= 2) break;
      }
      if (hasAlt && form.querySelector('textarea')) {
        hits.push({ id: form.id || '', kind: 'auth-textarea' });
      }
    }
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message: 'Authentication flow may rely on cognitive tests (3.3.8 / 3.3.9 supplemental).',
    evidence: String(h.kind),
    remediation: 'Prefer WebAuthn, magic links, or paste-friendly one-time codes over memory/copy tasks.',
  }));

  return withUrl(findings, ctx.url);
}
