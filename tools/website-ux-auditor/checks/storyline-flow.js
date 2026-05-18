import { makeFinding } from '../lib/severity.js';
import { pageContext } from './context.js';

export const checkId = 'storyline-flow';

const REMEDIATION = [
  'Reorder homepage sections to match the Product Story Contract (Linear benchmark): category hero → immediate visual → staged workflow → AI as a real workflow capability → proof/trust after the promise.',
  'Prefer layout and section order changes before rewriting long prose.',
].join(' ');

function indexMatching(headings, re) {
  const idx = headings.findIndex((h) => re.test(String(h.text || '')));
  return idx >= 0 ? idx : -1;
}

/** Homepage Linear-shaped story heuristics — requires earlyMainHeadings from dom-metrics. */
export function runCheck(m, url, ctx = {}) {
  const siteKind = ctx.siteKind || 'generic';
  const { isHome, isPlatformHandbookInner } = pageContext(url, siteKind);
  if (!isHome || isPlatformHandbookInner) return [];
  if (!Array.isArray(m.earlyMainHeadings)) return [];

  const h2s = m.earlyMainHeadings.filter((h) => h.tag === 'h2');

  const trustRe = /\b(trust|security posture|governance|boundary|privacy|designed for)\b/i;
  const workflowRe = /\b(how it works|how we work|workflow|stages|lifecycle|pipeline|flow\b|from intent|intent\b.*evidence)\b/i;
  const docsRe = /\b(reference|chapter|appendix|documentation index|handbook overview|table of contents|\badrs?\b)\b/i;

  const trustIdx = indexMatching(h2s, trustRe);
  const workflowIdx = indexMatching(h2s, workflowRe);
  const docsIdx = indexMatching(h2s, docsRe);

  /** @type {ReturnType<typeof makeFinding>[]} */
  const findings = [];

  if (docsIdx >= 0 && docsIdx <= 2 && (workflowIdx < 0 || docsIdx < workflowIdx)) {
    findings.push(
      makeFinding({
        checkId,
        severity: 'critical',
        area: 'product-story',
        message: 'Documentation-like framing heads the story before a staged workflow section (docs-first layout).',
        evidence: `early_h2_docs_idx=${docsIdx}; workflow_h2_idx=${workflowIdx}`,
        remediation: REMEDIATION,
      }),
    );
  }

  if (trustIdx >= 0 && workflowIdx >= 0 && trustIdx < workflowIdx) {
    findings.push(
      makeFinding({
        checkId,
        severity: 'critical',
        area: 'product-story',
        message: 'Proof/trust heading appears before the staged workflow story.',
        evidence: `trust_h2_idx=${trustIdx}; workflow_h2_idx=${workflowIdx}`,
        remediation: REMEDIATION,
      }),
    );
  }

  const wfSignals = typeof m.workflowStorySignalHits === 'number' ? m.workflowStorySignalHits : 0;
  const aiSignals = typeof m.aiCapabilityStoryHits === 'number' ? m.aiCapabilityStoryHits : 0;
  const wc = typeof m.wordCount === 'number' ? m.wordCount : 0;

  if (workflowIdx < 0 && wfSignals < 2 && wc > 450) {
    findings.push(
      makeFinding({
        checkId,
        severity: 'major',
        area: 'product-story',
        message: 'Long homepage lacks a clear staged workflow section heading.',
        evidence: `word_count=${wc}; workflow_heading_miss=1; workflow_text_signals=${wfSignals}`,
        remediation: REMEDIATION,
      }),
    );
  }

  const genericAi = Array.isArray(m.genericAiHits) ? m.genericAiHits.length : 0;
  if (genericAi >= 1 && aiSignals < 2 && wc > 350) {
    findings.push(
      makeFinding({
        checkId,
        severity: 'major',
        area: 'product-story',
        message: 'Generic AI phrasing appears without concrete workflow or boundary story in the body.',
        evidence: `generic_ai_token_hits=${genericAi}; ai_capability_story_hits=${aiSignals}`,
        remediation: REMEDIATION,
      }),
    );
  }

  return findings;
}
