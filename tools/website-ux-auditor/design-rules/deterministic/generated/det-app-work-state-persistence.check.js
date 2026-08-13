/**
 * DET.APP.WORK_STATE_PERSISTENCE — editable workspaces expose autosave, draft, or saved-view persistence cues.
 */

export const rule = {
  id: 'DET.APP.WORK_STATE_PERSISTENCE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-work-state-persistence',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromWorkStateReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 8).map((v) => ({
    severity: 'warn',
    area: 'informationArchitecture',
    message:
      'An editable workspace is missing visible work-state persistence (autosave, draft recovery, or saved views).',
    evidence: `workspace="${String(v.workspaceHint || '')}"`,
    remediation:
      'Mount ForgeAutosaveStatus (Fas), ForgeDraftRecovery (Fdr), or ForgeSavedViewManager (Fsm) inside ForgePersistentWorkspace (Fpw); emit [data-work-state] or DET.APP.WORK_STATE_PERSISTENCE markers.',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectWorkStateReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 4 && rect.height > 4;
    };

    const persistenceRe = /autosaved|draft|last saved|saving/i;

    const roots = new Set();
    for (const el of document.querySelectorAll(
      '[data-studio-workspace="persistent"], [data-ks-hash="Fpw"], [data-work-state], form[data-ks-form], .studio-page',
    )) {
      if (visible(el)) roots.add(el);
    }

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const root of roots) {
      const hasInputs = Boolean(
        root.querySelector('input:not([type="hidden"]), textarea, select, [contenteditable="true"]'),
      );
      const isPersistent =
        root.getAttribute('data-studio-workspace') === 'persistent'
        || root.getAttribute('data-ks-hash') === 'Fpw';
      const isEditableCandidate = hasInputs || isPersistent;
      if (!isEditableCandidate) continue;

      const text = norm(root.innerText || root.textContent || '');
      const hasPersistence =
        root.querySelector(
          '[data-work-state], .ks-fe-autosave, [data-ks-hash="Fas"], .forge-persistent-workspace__autosave, [data-ks-hash="Fdr"], [data-ks-hash="Fsm"]',
        )
        || persistenceRe.test(text);

      if (!hasPersistence) {
        const id = root.id ? `#${root.id}` : '';
        const ws = root.getAttribute('data-studio-workspace') || '';
        const hash = root.getAttribute('data-ks-hash') || '';
        violations.push({
          workspaceHint: id || ws || hash || 'editable-workspace',
        });
      }
    }

    return { violations: violations.slice(0, 8) };
  });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.workStateReport
    ?? (page ? await collectWorkStateReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromWorkStateReport(report, url || metrics?.url || '');
}
