import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { makeFinding } from '../../website-ux-auditor/lib/severity.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AXE_VENDOR = path.resolve(__dirname, '../vendor/axe.min.js');

const IMPACT_SEVERITY = {
  critical: 'critical',
  serious: 'major',
  moderate: 'warn',
  minor: 'minor',
};

/**
 * @param {import('playwright').Page} page
 * @param {string[]} axeTags
 * @param {string} standardsProfile
 */
export async function runAxeOnPage(page, axeTags, standardsProfile) {
  if (!fs.existsSync(AXE_VENDOR)) {
    return {
      error: `axe.min.js not found at ${AXE_VENDOR} — run npm install && npm run vendor:axe`,
      violations: [],
      tags: axeTags,
    };
  }

  try {
    await page.addScriptTag({ path: AXE_VENDOR });
    await page.waitForFunction(
      () => typeof window.axe !== 'undefined' && typeof window.axe.run === 'function',
      { timeout: 15_000 },
    );
  } catch (error) {
    return {
      error: `axe script load failed: ${error?.message || error}`,
      violations: [],
      tags: axeTags,
    };
  }

  try {
    const result = await page.evaluate(async (tags) => {
      return await window.axe.run(document, {
        runOnly: { type: 'tag', values: tags },
      });
    }, axeTags);

    if (!result || typeof result !== 'object') {
      return { error: 'axe.run returned non-object', violations: [], tags: axeTags };
    }
    return { ...result, tags: axeTags, standardsProfile };
  } catch (error) {
    return {
      error: `axe.run failed: ${error?.message || error}`,
      violations: [],
      tags: axeTags,
    };
  }
}

/**
 * @param {Record<string, unknown>} axeResult
 * @param {string} url
 */
export function findingsFromAxeResult(axeResult, url) {
  if (axeResult?.error) {
    return [
      makeFinding({
        checkId: 'axe-lane',
        ruleId: 'AXE.RUNNER.ERROR',
        severity: 'major',
        area: 'accessibility',
        message: 'Automated axe-core scan did not complete for this page.',
        evidence: String(axeResult.error),
        remediation: 'Run npm run vendor:axe in tools/website-a11y-auditor and retry the audit.',
      }),
    ];
  }

  const violations = Array.isArray(axeResult?.violations) ? axeResult.violations : [];
  const standardsProfile = String(axeResult?.standardsProfile || axeResult?.tags?.join(',') || '');
  const findings = [];

  for (const v of violations.slice(0, 40)) {
    const impact = String(v.impact || 'moderate').toLowerCase();
    const severity = IMPACT_SEVERITY[impact] || 'warn';
    const ruleId = `AXE.${String(v.id || 'unknown').replace(/[^a-zA-Z0-9._-]+/g, '_')}`;
    const nodes = Array.isArray(v.nodes) ? v.nodes : [];
    const target = nodes[0]?.target ? JSON.stringify(nodes[0].target).slice(0, 200) : '';
    const wcag = Array.isArray(v.tags)
      ? v.tags.filter((t) => /^wcag/i.test(String(t)))
      : [];

    findings.push(
      makeFinding({
        checkId: 'axe-lane',
        ruleId,
        severity,
        area: 'accessibility',
        message: String(v.help || v.description || v.id || 'axe violation'),
        evidence: [
          url ? `url=${url}` : '',
          target ? `target=${target}` : '',
          wcag.length ? `wcag=${wcag.join(',')}` : '',
          standardsProfile ? `profile=${standardsProfile}` : '',
        ]
          .filter(Boolean)
          .join(' '),
        remediation: String(v.helpUrl || 'Fix per WCAG guidance for this rule.'),
      }),
    );
  }

  return findings;
}
