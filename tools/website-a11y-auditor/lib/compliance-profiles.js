/**
 * Named compliance profiles bundle axe tag sets, DET standards tags, and report metadata.
 * Not legal conformance, VPAT, or certification.
 */

/** @typedef {{
 *   id: string,
 *   label: string,
 *   axePresetKey: string,
 *   detStandardsTags: string[],
 *   wcagVersion: string,
 *   level: string,
 *   jurisdictionNotes: string,
 *   manualTestingRequired: string[],
 * }} ComplianceProfileDef */

const MANUAL_GAPS_COMMON = [
  'Keyboard-only task flows and focus visibility beyond automated focus-order heuristics',
  'Media alternatives (captions, audio description, transcripts)',
  'Complex widgets and live regions (custom components, dynamic updates)',
  'Cognitive load and plain language (content judgment)',
];

/** @type {Record<string, ComplianceProfileDef>} */
export const COMPLIANCE_PROFILES = {
  wcag20a: {
    id: 'wcag20a',
    label: 'WCAG 2.0 Level A',
    axePresetKey: 'wcag20a',
    detStandardsTags: ['wcag2a', 'wcag2aa'],
    wcagVersion: '2.0',
    level: 'A',
    jurisdictionNotes:
      'Legacy contracts referencing WCAG 2.0 Level A; axe uses wcag2a tags only (no WCAG 2.1/2.2 rule tags).',
    manualTestingRequired: MANUAL_GAPS_COMMON,
  },
  wcag20aa: {
    id: 'wcag20aa',
    label: 'WCAG 2.0 Level AA',
    axePresetKey: 'wcag20aa',
    detStandardsTags: ['wcag2a', 'wcag2aa'],
    wcagVersion: '2.0',
    level: 'AA',
    jurisdictionNotes:
      'WCAG 2.0 Level A+AA per https://www.w3.org/TR/WCAG20/; axe wcag2a + wcag2aa tags (excludes wcag21*/wcag22*).',
    manualTestingRequired: MANUAL_GAPS_COMMON,
  },
  wcag20aaa: {
    id: 'wcag20aaa',
    label: 'WCAG 2.0 Level AAA',
    axePresetKey: 'wcag20aaa',
    detStandardsTags: ['wcag2a', 'wcag2aa', 'wcag2aaa'],
    wcagVersion: '2.0',
    level: 'AAA',
    jurisdictionNotes:
      'WCAG 2.0 full conformance target; axe adds wcag2aaa where Deque supports AAA rules.',
    manualTestingRequired: MANUAL_GAPS_COMMON,
  },
  wcag21a: {
    id: 'wcag21a',
    label: 'WCAG 2.1 Level A',
    axePresetKey: 'wcag21a',
    detStandardsTags: ['wcag2a', 'wcag21a', 'wcag2aa'],
    wcagVersion: '2.1',
    level: 'A',
    jurisdictionNotes: 'Deque axe tag mapping for WCAG 2.1 Level A.',
    manualTestingRequired: MANUAL_GAPS_COMMON,
  },
  wcag21aa: {
    id: 'wcag21aa',
    label: 'WCAG 2.1 Level AA',
    axePresetKey: 'wcag21aa',
    detStandardsTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    wcagVersion: '2.1',
    level: 'AA',
    jurisdictionNotes: 'Common procurement baseline; aligns with many ADA web references.',
    manualTestingRequired: MANUAL_GAPS_COMMON,
  },
  wcag21aaa: {
    id: 'wcag21aaa',
    label: 'WCAG 2.1 Level AAA',
    axePresetKey: 'wcag21aaa',
    detStandardsTags: [
      'wcag2a',
      'wcag2aa',
      'wcag2aaa',
      'wcag21a',
      'wcag21aa',
      'wcag21aaa',
      'wcag22aa',
    ],
    wcagVersion: '2.1',
    level: 'AAA',
    jurisdictionNotes:
      'WCAG 2.1 AAA per https://www.w3.org/TR/WCAG21/; axe uses wcag2aaa + wcag21aa tags where Deque supports AAA rules.',
    manualTestingRequired: MANUAL_GAPS_COMMON,
  },
  wcag22a: {
    id: 'wcag22a',
    label: 'WCAG 2.2 Level A',
    axePresetKey: 'wcag22a',
    detStandardsTags: ['wcag2a', 'wcag21a', 'wcag22aa'],
    wcagVersion: '2.2',
    level: 'A',
    jurisdictionNotes:
      'WCAG 2.2 Level A per https://www.w3.org/TR/WCAG22/; Deque axe tag mapping for 2.2 A.',
    manualTestingRequired: MANUAL_GAPS_COMMON,
  },
  wcag22aa: {
    id: 'wcag22aa',
    label: 'WCAG 2.2 Level AA',
    axePresetKey: 'wcag22aa',
    detStandardsTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
    wcagVersion: '2.2',
    level: 'AA',
    jurisdictionNotes:
      'Forge default profile; WCAG 2.2 AA per https://www.w3.org/TR/WCAG22/.',
    manualTestingRequired: MANUAL_GAPS_COMMON,
  },
  wcag22aaa: {
    id: 'wcag22aaa',
    label: 'WCAG 2.2 Level AAA',
    axePresetKey: 'wcag22aaa',
    detStandardsTags: [
      'wcag2a',
      'wcag2aa',
      'wcag2aaa',
      'wcag21a',
      'wcag21aa',
      'wcag21aaa',
      'wcag22aa',
      'wcag22aaa',
    ],
    wcagVersion: '2.2',
    level: 'AAA',
    jurisdictionNotes:
      'WCAG 2.2 AAA per https://www.w3.org/TR/WCAG22/; includes 2.2-only criteria (2.4.11–13, 2.5.7–8, 3.2.6, 3.3.7–9) plus full AAA stack.',
    manualTestingRequired: MANUAL_GAPS_COMMON,
  },
  wcag30bronze: {
    id: 'wcag30bronze',
    label: 'WCAG 3.0 Bronze (draft)',
    axePresetKey: 'wcag30bronze',
    detStandardsTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'wcag30bronze'],
    wcagVersion: '3.0',
    level: 'Bronze',
    conformanceTier: 'bronze',
    isDraft: true,
    automationProxy: 'wcag22aa',
    jurisdictionNotes:
      'W3C WCAG 3.0 Working Draft — Bronze tier. Axe/DET use WCAG 2.2 AA as automation proxy only; not legal conformance.',
    manualTestingRequired: [
      ...MANUAL_GAPS_COMMON,
      'WCAG 3.0 supplemental requirements and assertions (draft)',
      'Holistic / user testing where required for Silver/Gold (not Bronze proxy)',
    ],
  },
  wcag30silver: {
    id: 'wcag30silver',
    label: 'WCAG 3.0 Silver (draft)',
    axePresetKey: 'wcag30silver',
    detStandardsTags: [
      'wcag2a',
      'wcag2aa',
      'wcag21a',
      'wcag21aa',
      'wcag22aa',
      'wcag30bronze',
      'wcag30silver',
    ],
    wcagVersion: '3.0',
    level: 'Silver',
    conformanceTier: 'silver',
    isDraft: true,
    automationProxy: 'wcag22aa',
    jurisdictionNotes:
      'WCAG 3.0 Silver (draft). Automation proxy: WCAG 2.2 AA; additional supplemental outcomes are manual/AI.',
    manualTestingRequired: [
      ...MANUAL_GAPS_COMMON,
      'WCAG 3.0 Silver supplemental requirements (draft)',
      'Usability testing with people with disabilities where applicable',
    ],
  },
  wcag30gold: {
    id: 'wcag30gold',
    label: 'WCAG 3.0 Gold (draft)',
    axePresetKey: 'wcag30gold',
    detStandardsTags: [
      'wcag2a',
      'wcag2aa',
      'wcag2aaa',
      'wcag21a',
      'wcag21aa',
      'wcag22aa',
      'wcag22aaa',
      'wcag30bronze',
      'wcag30silver',
      'wcag30gold',
    ],
    wcagVersion: '3.0',
    level: 'Gold',
    conformanceTier: 'gold',
    isDraft: true,
    automationProxy: 'wcag22aaa',
    jurisdictionNotes:
      'WCAG 3.0 Gold (draft). Automation proxy upper bound: WCAG 2.2 AAA axe tags; not equivalent to 2.x AAA checklist.',
    manualTestingRequired: [
      ...MANUAL_GAPS_COMMON,
      'WCAG 3.0 Gold supplemental and organizational practices (draft)',
    ],
  },
  'ada-title-ii-wcag21aa': {
    id: 'ada-title-ii-wcag21aa',
    label: 'ADA Title II — WCAG 2.1 AA (axe mapping)',
    axePresetKey: 'wcag21aa',
    detStandardsTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    wcagVersion: '2.1',
    level: 'AA',
    jurisdictionNotes:
      'US state/local government web accessibility commonly references WCAG 2.1 Level AA. ' +
      'This profile uses the same axe and DET tag bundle as wcag21aa — not a separate automated ruleset.',
    manualTestingRequired: MANUAL_GAPS_COMMON,
  },
  'ada-title-iii-wcag21aa': {
    id: 'ada-title-iii-wcag21aa',
    label: 'ADA Title III — WCAG 2.1 AA (axe mapping)',
    axePresetKey: 'wcag21aa',
    detStandardsTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    wcagVersion: '2.1',
    level: 'AA',
    jurisdictionNotes:
      'US public accommodations web rules reference WCAG 2.1 Level AA for many sites. ' +
      'Same automation bundle as wcag21aa; confirm tender-specific requirements.',
    manualTestingRequired: MANUAL_GAPS_COMMON,
  },
  section508: {
    id: 'section508',
    label: 'US Section 508 (axe tag mapping)',
    axePresetKey: 'section508',
    detStandardsTags: ['section508', 'wcag2aa', 'wcag21aa'],
    wcagVersion: '2.0+',
    level: 'AA',
    jurisdictionNotes: 'Federal ICT refresh; axe section508 tag plus WCAG 2.x AA tags.',
    manualTestingRequired: MANUAL_GAPS_COMMON,
  },
  en301549: {
    id: 'en301549',
    label: 'EN 301 549 (EU ICT, axe tag mapping)',
    axePresetKey: 'en301549',
    detStandardsTags: ['wcag2aa', 'wcag21aa'],
    wcagVersion: '2.1',
    level: 'AA',
    jurisdictionNotes: 'EU procurement baseline; verify EN 301 549 revision in tender.',
    manualTestingRequired: MANUAL_GAPS_COMMON,
  },
  'best-practice': {
    id: 'best-practice',
    label: 'Deque best-practice',
    axePresetKey: 'best-practice',
    detStandardsTags: ['wcag2aa', 'wcag21aa', 'wcag22aa'],
    wcagVersion: '—',
    level: '—',
    jurisdictionNotes: 'Extra Deque rules beyond WCAG; not a legal conformance claim.',
    manualTestingRequired: MANUAL_GAPS_COMMON,
  },
};

export const COMPLIANCE_DISCLAIMER =
  'Automated axe and deterministic checks do not constitute legal conformance, ADA certification, VPAT completion, or WCAG sign-off. Pair with manual testing and, when needed, forge-accessibility Studio evidence.';

/**
 * @param {string} profileId
 * @returns {ComplianceProfileDef | null}
 */
export function getComplianceProfile(profileId) {
  const id = String(profileId || '').trim().toLowerCase();
  return COMPLIANCE_PROFILES[id] || null;
}

export function listComplianceProfileIds() {
  return Object.keys(COMPLIANCE_PROFILES);
}

/**
 * @param {{ standards?: string[] | null }} rule
 * @param {string[] | null | undefined} detStandardsTags
 */
export function ruleMatchesComplianceProfile(rule, detStandardsTags) {
  const ruleTags = Array.isArray(rule?.standards) ? rule.standards : [];
  if (!ruleTags.length) return true;
  const profileTags = Array.isArray(detStandardsTags) ? detStandardsTags : [];
  if (!profileTags.length) return true;
  return ruleTags.some((t) => profileTags.includes(String(t)));
}

/**
 * @param {object[]} deterministicRules
 * @param {string[] | null | undefined} detStandardsTags
 */
export function partitionRulesByComplianceProfile(deterministicRules, detStandardsTags) {
  const inScope = [];
  const excluded = [];
  for (const rule of deterministicRules || []) {
    if (ruleMatchesComplianceProfile(rule, detStandardsTags)) {
      inScope.push(rule);
    } else {
      excluded.push(rule);
    }
  }
  return { inScope, excluded };
}

/**
 * Serialize profiles for showcase / generated JSON (axe tags resolved externally).
 * @param {Record<string, { axeTags: string[] }>} axeTagsByPresetKey
 */
export function buildComplianceProfilesCrosswalk(axeTagsByPresetKey = {}) {
  const profiles = listComplianceProfileIds().map((id) => {
    const def = COMPLIANCE_PROFILES[id];
    const axeTags = axeTagsByPresetKey[def.axePresetKey] || [];
    return {
      id: def.id,
      label: def.label,
      wcagVersion: def.wcagVersion,
      level: def.level,
      axePresetKey: def.axePresetKey,
      axeTags,
      detStandardsTags: [...def.detStandardsTags],
      jurisdictionNotes: def.jurisdictionNotes,
      manualTestingRequired: [...def.manualTestingRequired],
    };
  });
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    disclaimer: COMPLIANCE_DISCLAIMER,
    profiles,
  };
}
