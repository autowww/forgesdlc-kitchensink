/**
 * AI audit finding normalization for website-a11y-auditor.
 */

const KNOWN_SEVERITIES = new Set(['blocker', 'critical', 'major', 'warn', 'minor', 'trivial', 'cosmetic']);

export function normalizeAiSeverity(level) {
  const sev = String(level || '').trim().toLowerCase();
  if (KNOWN_SEVERITIES.has(sev)) return sev;
  if (sev === 'high') return 'critical';
  if (sev === 'medium') return 'major';
  if (sev === 'low') return 'minor';
  return 'minor';
}

export function normalizeAiConfidence(raw) {
  if (raw == null || raw === '') return 0.5;
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.min(1, Math.max(0, raw));
  const s = String(raw).trim().toLowerCase();
  if (s === 'high') return 0.85;
  if (s === 'medium') return 0.5;
  if (s === 'low') return 0.2;
  const n = Number(s);
  if (Number.isFinite(n)) return Math.min(1, Math.max(0, n));
  return 0.5;
}

export function extractJsonFromAgentText(rawText) {
  const raw = String(rawText || '').trim();
  if (!raw) return null;
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]);
    } catch {
      /* fall through */
    }
  }
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * @param {object} rawFinding
 * @param {string} [fallbackUrl]
 */
export function normalizeAiFinding(rawFinding, fallbackUrl = '') {
  if (!rawFinding || typeof rawFinding !== 'object') return null;
  const severity = normalizeAiSeverity(rawFinding.severity);
  const principleId = String(rawFinding.principleId || rawFinding.principle_id || '').trim();
  const candidate = String(
    rawFinding.candidateDeterministicRule || rawFinding.candidate_deterministic_rule || '',
  ).trim();
  const screenshotOrDomEvidence = String(
    rawFinding.screenshotOrDomEvidence || rawFinding.screenshot_or_dom_evidence || '',
  ).trim();
  const evidence = String(rawFinding.evidence || rawFinding.screenshotOrDomEvidence || '').trim();
  const message = String(rawFinding.title || rawFinding.message || '').trim();
  const ruleId = candidate || principleId;
  return {
    lane: 'ai',
    url: String(rawFinding.url || fallbackUrl || '').trim(),
    severity,
    area: 'accessibility',
    principleId,
    checkId: ruleId || principleId,
    ruleId: ruleId || principleId,
    candidateDeterministicRule: candidate,
    deterministicCoverage: String(rawFinding.deterministicCoverage || 'not-covered').trim(),
    screenshotOrDomEvidence: screenshotOrDomEvidence || evidence,
    message,
    evidence,
    remediation: String(rawFinding.remediation || '').trim(),
    confidence: normalizeAiConfidence(rawFinding.confidence),
    source: 'ai-assisted',
  };
}

/**
 * @param {object[]} findings
 */
export function mergeAiFindingsIntoAuditData(auditData, findings) {
  const list = auditData.findings || (auditData.findings = []);
  for (const f of findings || []) {
    const n = normalizeAiFinding(f);
    if (n) list.push(n);
  }
  return auditData;
}
