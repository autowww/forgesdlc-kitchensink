/**
 * DET.APP.WIZARD_PROGRESS_CONTROLS — wizard flows show step progress, back/next, and disabled-next reasons.
 */

export const rule = {
  id: 'DET.APP.WIZARD_PROGRESS_CONTROLS',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-wizard-progress-controls',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromWizardProgressReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 8).map((v) => ({
    severity: 'major',
    area: 'informationArchitecture',
    message:
      v.issue === 'missing-step-indicator'
        ? 'A wizard/stepper flow does not expose current step or total steps.'
        : v.issue === 'missing-nav-controls'
          ? 'A wizard is missing stable Back and Next (or equivalent) controls.'
          : 'Wizard Next is disabled without visible explanation.',
    evidence: `issue=${String(v.issue || '')} wizard="${String(v.wizardHint || '')}"`,
    remediation:
      'Add Step X of Y (or progressbar aria-valuenow), stable Back/Next buttons, and precondition text when Next is disabled.',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectWizardProgressReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 4 && rect.height > 4;
    };

    const hasVisibleReason = (control) => {
      const title = norm(control.getAttribute('title') || '');
      if (title.length >= 8) return true;
      const describedBy = control.getAttribute('aria-describedby');
      if (describedBy) {
        for (const id of describedBy.split(/\s+/)) {
          const node = document.getElementById(id);
          if (node && visible(node) && norm(node.textContent).length >= 8) return true;
        }
      }
      const scope = control.closest('[data-wizard], .wizard, form') || control.parentElement;
      if (scope) {
        for (const hint of scope.querySelectorAll('[data-disabled-reason], .form-text, [role="note"]')) {
          if (visible(hint) && norm(hint.textContent).length >= 8) return true;
        }
      }
      return false;
    };

    const wizards = [
      ...document.querySelectorAll('[data-wizard], .wizard, [role="group"][aria-label*="step" i]'),
    ].filter(visible);

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const wizard of wizards) {
      const hint = wizard.id ? `#${wizard.id}` : 'wizard';
      const text = norm(wizard.innerText || '');
      const stepIndicator =
        /step\s+\d+\s+of\s+\d+/i.test(text)
        || wizard.querySelector('[role="progressbar"][aria-valuenow], [aria-current="step"]');

      if (!stepIndicator) {
        violations.push({ issue: 'missing-step-indicator', wizardHint: hint });
      }

      const back = wizard.querySelector(
        'button[data-action="back"], button[aria-label*="back" i], button:not([type="submit"])',
      );
      const next = wizard.querySelector(
        'button[data-action="next"], button.btn-primary, button[aria-label*="next" i]',
      );
      if (!back || !next || !visible(back) || !visible(next)) {
        violations.push({ issue: 'missing-nav-controls', wizardHint: hint });
      }

      if (next && visible(next) && (next.disabled || next.getAttribute('aria-disabled') === 'true')) {
        if (!hasVisibleReason(next)) {
          violations.push({ issue: 'disabled-next-without-reason', wizardHint: hint });
        }
      }
    }

    return { violations: violations.slice(0, 10) };
  });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.wizardProgressReport
    ?? (page ? await collectWizardProgressReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromWizardProgressReport(report, url || metrics?.url || '');
}
