/**
 * DET.APP.FOCUS_TRAP — modals/panels should trap keyboard focus until dismissed.
 * Contract signals on closed shells; optional live open + tab-cycle probe when page is available.
 */

const MAX_OPEN_TESTS = 2;
const OPEN_PROBE_SLEEP_MS = 280;

export const rule = {
  id: 'DET.APP.FOCUS_TRAP',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-focus-trap',
};

/**
 * @param {{ overlayShellCount?: number, openTestsRun?: number, violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromAppFocusTrapReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const kind = String(v.kind || 'unknown');
    const key = `${kind}:${v.id || ''}:${v.className || ''}:${v.activeTag || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (kind === 'no-dismiss') {
      findings.push({
        severity: 'major',
        area: 'accessibility',
        message: 'Modal or panel shell lacks a keyboard-reachable dismiss control.',
        evidence: `shell id="${String(v.id || '')}" class="${String(v.className || '').slice(0, 100)}" kind=${v.shellKind || 'overlay'}`,
        remediation:
          'Add a visible close button with an accessible name, or wire data-bs-dismiss / Escape handling so users are not trapped without an exit.',
      });
      continue;
    }

    if (kind === 'no-trigger') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'Bootstrap modal/offcanvas shell has no visible opener control in the document.',
        evidence: `shell id="${String(v.id || '')}" class="${String(v.className || '').slice(0, 100)}"`,
        remediation:
          'Pair the shell with a button or link using data-bs-toggle and data-bs-target (or aria-controls) so keyboard users can open and exercise the trap.',
      });
      continue;
    }

    if (kind === 'trap-escape') {
      findings.push({
        severity: 'major',
        area: 'accessibility',
        message: 'While the overlay was open, keyboard focus moved outside the modal/panel shell.',
        evidence: `shell id="${String(v.id || '')}" focus landed on <${String(v.activeTag || '?')}> class="${String(v.activeClass || '').slice(0, 80)}"`,
        remediation:
          'Trap Tab cycles inside the open shell (Bootstrap modal/offcanvas, inert on the page root, or an explicit focus loop) until dismiss restores prior focus.',
      });
      continue;
    }

    if (kind === 'background-tabbable') {
      findings.push({
        severity: 'major',
        area: 'accessibility',
        message: 'Main content remained keyboard-focusable while an overlay panel was open.',
        evidence: `shell id="${String(v.id || '')}" class="${String(v.className || '').slice(0, 100)}"`,
        remediation:
          'Mark background content inert or aria-hidden while the overlay is open, and keep focus inside the panel until it closes.',
      });
      continue;
    }

    if (kind === 'no-focusable') {
      findings.push({
        severity: 'warn',
        area: 'accessibility',
        message: 'Open overlay shell exposes no tabbable controls for keyboard users.',
        evidence: `shell id="${String(v.id || '')}" class="${String(v.className || '').slice(0, 100)}"`,
        remediation:
          'Include at least one tabbable dismiss control and primary actions inside the open shell.',
      });
      continue;
    }

    if (kind === 'missing-aria-modal') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'Open dialog overlay is missing aria-modal="true".',
        evidence: `shell id="${String(v.id || '')}" role=dialog`,
        remediation:
          'Set role="dialog" with aria-modal="true" (and aria-labelledby or aria-label) while the overlay is open.',
      });
    }
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectAppFocusTrapReport(page) {
  return page.evaluate(
    async ({ MAX_OPEN_TESTS, OPEN_PROBE_SLEEP_MS }) => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const visible = (el) => {
        if (!el || el.nodeType !== 1) return false;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const TABBABLE =
        'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

      /** @param {ParentNode} root */
      function getTabbables(root) {
        return [...root.querySelectorAll(TABBABLE)].filter((el) => {
          if (!(el instanceof HTMLElement)) return false;
          if (!visible(el)) return false;
          if (el.getAttribute('aria-hidden') === 'true') return false;
          return true;
        });
      }

      /** @type {Array<{ el: HTMLElement, shellKind: string, id: string, className: string }>} */
      const shells = [];
      const seen = new Set();

      /** @param {Element | null} el @param {string} shellKind */
      function addShell(el, shellKind) {
        if (!(el instanceof HTMLElement) || seen.has(el)) return;
        seen.add(el);
        shells.push({
          el,
          shellKind,
          id: el.id || '',
          className: norm(el.className).slice(0, 100),
        });
      }

      for (const el of document.querySelectorAll('.modal, .offcanvas')) addShell(el, 'bootstrap');
      for (const el of document.querySelectorAll('#diagramModal, #topicPreviewModal')) addShell(el, 'ks-modal');
      for (const el of document.querySelectorAll(
        '.diagram-modal-backdrop[role="dialog"], [role="dialog"][aria-modal="true"]',
      )) {
        addShell(el, 'dialog');
      }

      /** @param {HTMLElement} shell */
      function hasDismiss(shell) {
        if (shell.querySelector('[data-bs-dismiss]')) return true;
        if (shell.querySelector('.btn-close, .diagram-modal-close, [data-topic-preview-close]')) return true;
        return [...shell.querySelectorAll('button')].some((b) => /close/i.test(
          norm(b.getAttribute('aria-label') || b.textContent || ''),
        ));
      }

      /** @param {HTMLElement} shell */
      function findBootstrapTrigger(shell) {
        const id = shell.id;
        if (!id) return null;
        const esc = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id;
        const tr = document.querySelector(`[data-bs-target="#${esc}"], [data-bs-target="#${id}"]`);
        return tr instanceof HTMLElement && visible(tr) ? tr : null;
      }

      /** @param {HTMLElement} shell */
      function isOpen(shell) {
        if (shell.classList.contains('show') || shell.classList.contains('active')) return true;
        if (shell.hasAttribute('hidden')) return false;
        return shell.getAttribute('aria-hidden') === 'false';
      }

      /** @param {HTMLElement} shell @param {string} shellKind @param {HTMLElement | null} trigger */
      async function openShell(shell, shellKind, trigger) {
        if (trigger) {
          trigger.click();
          await sleep(OPEN_PROBE_SLEEP_MS);
          return isOpen(shell);
        }
        if (shellKind === 'ks-modal' && shell.id === 'diagramModal'
          && typeof window.forgeApplyDiagramModalOpen === 'function') {
          window.forgeApplyDiagramModalOpen();
          await sleep(OPEN_PROBE_SLEEP_MS);
          return isOpen(shell);
        }
        return false;
      }

      /** @param {HTMLElement} shell @param {string} shellKind */
      async function closeShell(shell, shellKind) {
        if (shellKind === 'ks-modal') {
          if (typeof window.closeDiagramModal === 'function') window.closeDiagramModal();
          if (typeof window.closeTopicPreviewModal === 'function') window.closeTopicPreviewModal();
          shell.classList.remove('active');
          shell.setAttribute('hidden', '');
          shell.setAttribute('aria-hidden', 'true');
        } else {
          const dismiss = shell.querySelector('[data-bs-dismiss]');
          if (dismiss instanceof HTMLElement) dismiss.click();
          else {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          }
        }
        await sleep(OPEN_PROBE_SLEEP_MS);
      }

      /** @param {HTMLElement} shell */
      function probeTrapWhileOpen(shell) {
        /** @type {Array<Record<string, unknown>>} */
        const out = [];
        const tabInShell = getTabbables(shell);
        if (!tabInShell.length) {
          out.push({ kind: 'no-focusable', id: shell.id, className: norm(shell.className) });
          return out;
        }

        tabInShell[0].focus();
        const all = getTabbables(document.body);
        const steps = Math.min(all.length + 2, 30);
        for (let i = 0; i < steps; i += 1) {
          const active = document.activeElement;
          if (active instanceof HTMLElement && !shell.contains(active) && active !== document.body) {
            out.push({
              kind: 'trap-escape',
              id: shell.id,
              className: norm(shell.className),
              activeTag: active.tagName.toLowerCase(),
              activeClass: norm(active.className),
            });
            break;
          }
          const idx = active instanceof HTMLElement ? all.indexOf(active) : -1;
          const next = all[(idx >= 0 ? idx + 1 : 0) % all.length];
          if (next) next.focus();
        }

        const main = document.querySelector('main');
        if (main) {
          const mainTabs = getTabbables(main);
          if (mainTabs[0]) {
            mainTabs[0].focus();
            if (document.activeElement === mainTabs[0] && !shell.contains(mainTabs[0])) {
              out.push({ kind: 'background-tabbable', id: shell.id, className: norm(shell.className) });
            }
          }
        }

        if (shell.getAttribute('role') === 'dialog' && shell.getAttribute('aria-modal') !== 'true') {
          out.push({ kind: 'missing-aria-modal', id: shell.id, className: norm(shell.className) });
        }

        return out;
      }

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];

      for (const { el: shell, shellKind, id, className } of shells) {
        if (!hasDismiss(shell)) {
          violations.push({ kind: 'no-dismiss', id, className, shellKind });
        }
        if (shellKind === 'bootstrap' && id && !findBootstrapTrigger(shell)) {
          violations.push({ kind: 'no-trigger', id, className });
        }
      }

      let openTestsRun = 0;
      for (const { el: shell, shellKind } of shells) {
        if (openTestsRun >= MAX_OPEN_TESTS) break;
        const trigger = shellKind === 'bootstrap' ? findBootstrapTrigger(shell) : null;
        const canProbe = Boolean(trigger)
          || (shellKind === 'ks-modal' && shell.id === 'diagramModal'
            && typeof window.forgeApplyDiagramModalOpen === 'function');
        if (!canProbe) continue;

        const wasOpen = isOpen(shell);
        const opened = wasOpen || await openShell(shell, shellKind, trigger);
        if (!opened) continue;

        openTestsRun += 1;
        violations.push(...probeTrapWhileOpen(shell));

        if (!wasOpen) await closeShell(shell, shellKind);
      }

      return {
        overlayShellCount: shells.length,
        openTestsRun,
        violations: violations.slice(0, 12),
      };
    },
    { MAX_OPEN_TESTS, OPEN_PROBE_SLEEP_MS },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.appFocusTrapReport
    ?? (page ? await collectAppFocusTrapReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromAppFocusTrapReport(report, url || metrics?.url || '');
}
