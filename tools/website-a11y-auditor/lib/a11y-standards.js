/**
 * Accessibility standard presets → axe-core runOnly tags.
 * Compliance profiles bundle presets + DET standards tags for reporting.
 */

import {
  COMPLIANCE_DISCLAIMER,
  COMPLIANCE_PROFILES,
  getComplianceProfile,
  listComplianceProfileIds,
} from './compliance-profiles.js';

/** @type {Record<string, { id: string, label: string, axeTags: string[], notes?: string }>} */
export const A11Y_STANDARD_PRESETS = {
  wcag20a: {
    id: 'wcag20a',
    label: 'WCAG 2.0 Level A',
    axeTags: ['wcag2a'],
    notes: 'Deque wcag2a tag set (WCAG 2.0 Level A).',
  },
  wcag20aa: {
    id: 'wcag20aa',
    label: 'WCAG 2.0 Level AA',
    axeTags: ['wcag2a', 'wcag2aa'],
    notes: 'WCAG 2.0 A+AA; excludes wcag21aa/wcag22aa axe tags.',
  },
  wcag20aaa: {
    id: 'wcag20aaa',
    label: 'WCAG 2.0 Level AAA',
    axeTags: ['wcag2a', 'wcag2aa', 'wcag2aaa'],
    notes: 'WCAG 2.0 AAA axe tag set where supported.',
  },
  wcag21a: {
    id: 'wcag21a',
    label: 'WCAG 2.1 Level A',
    axeTags: ['wcag2a', 'wcag21a'],
    notes: 'Deque tag set for WCAG 2.1 A.',
  },
  wcag21aa: {
    id: 'wcag21aa',
    label: 'WCAG 2.1 Level AA',
    axeTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    notes: 'Common procurement default.',
  },
  wcag21aaa: {
    id: 'wcag21aaa',
    label: 'WCAG 2.1 Level AAA',
    axeTags: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa'],
    notes: 'WCAG 2.1 AAA; wcag2aaa + wcag21aa axe tags.',
  },
  wcag22a: {
    id: 'wcag22a',
    label: 'WCAG 2.2 Level A',
    axeTags: ['wcag2a', 'wcag21a'],
    notes: 'WCAG 2.2 Level A; same axe tag pattern as wcag21a.',
  },
  wcag22aa: {
    id: 'wcag22aa',
    label: 'WCAG 2.2 Level AA',
    axeTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
    notes: 'Includes WCAG 2.2 AA criteria in axe tag set.',
  },
  wcag22aaa: {
    id: 'wcag22aaa',
    label: 'WCAG 2.2 Level AAA',
    axeTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'wcag22aaa'],
    notes: 'AAA axe tag set where supported by axe-core.',
  },
  wcag30bronze: {
    id: 'wcag30bronze',
    label: 'WCAG 3.0 Bronze (draft)',
    axeTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
    notes: 'Automation proxy: WCAG 2.2 AA axe tags. WCAG 3.0 has no wcag30* axe tags.',
  },
  wcag30silver: {
    id: 'wcag30silver',
    label: 'WCAG 3.0 Silver (draft)',
    axeTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
    notes: 'Automation proxy: WCAG 2.2 AA; supplemental WCAG 3 outcomes are manual/AI.',
  },
  wcag30gold: {
    id: 'wcag30gold',
    label: 'WCAG 3.0 Gold (draft)',
    axeTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'wcag22aaa'],
    notes: 'Automation proxy upper bound: WCAG 2.2 AAA axe tags where supported.',
  },
  section508: {
    id: 'section508',
    label: 'US Section 508 (axe tag mapping)',
    axeTags: ['section508', 'wcag2aa'],
    notes: 'Federal ICT refresh; not a legal conformance claim.',
  },
  en301549: {
    id: 'en301549',
    label: 'EN 301 549 (EU ICT, axe tag mapping)',
    axeTags: ['wcag2aa', 'wcag21aa'],
    notes: 'EU procurement baseline; verify revision in tender.',
  },
  'best-practice': {
    id: 'best-practice',
    label: 'Deque best-practice',
    axeTags: ['best-practice'],
    notes: 'Extra rules beyond WCAG; not a legal conformance claim.',
  },
};

const WCAG_LEVEL_TAGS = {
  a: ['wcag2a', 'wcag21a'],
  aa: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  aaa: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'wcag22aaa'],
};

/**
 * @param {{
 *   standard?: string | null,
 *   complianceProfile?: string | null,
 *   axeTags?: string[] | null,
 *   wcagLevel?: string | null,
 *   includeBestPractice?: boolean,
 * }} opts
 */
export function resolveA11yStandard(opts = {}) {
  const profileId = String(opts.complianceProfile || opts.standard || 'wcag22aa')
    .trim()
    .toLowerCase();
  const explicitTags = Array.isArray(opts.axeTags)
    ? opts.axeTags.map((t) => String(t).trim()).filter(Boolean)
    : null;

  if (explicitTags?.length) {
    const tags = uniqueTags(explicitTags);
    return {
      presetId: 'custom',
      label: 'Custom axe tags',
      axeTags: tags,
      standardsProfile: tags.join(','),
      notes: 'Explicit --axe-tags override.',
      complianceProfile: buildCustomComplianceProfile(profileId, tags),
      detStandardsTags: tags.filter((t) => !t.startsWith('best-')),
    };
  }

  const level = String(opts.wcagLevel || '').trim().toLowerCase();
  if (level && WCAG_LEVEL_TAGS[level]) {
    let tags = [...WCAG_LEVEL_TAGS[level]];
    if (opts.includeBestPractice) tags.push('best-practice');
    tags = uniqueTags(tags);
    const derivedId = `wcag-level-${level}`;
    return {
      presetId: derivedId,
      label: `WCAG level ${level.toUpperCase()} (derived)`,
      axeTags: tags,
      standardsProfile: tags.join(','),
      notes: 'Derived from --wcag-level.',
      complianceProfile: {
        id: derivedId,
        label: `WCAG level ${level.toUpperCase()} (derived)`,
        wcagVersion: level === 'aaa' ? '2.2' : '2.1',
        level: level.toUpperCase(),
        jurisdictionNotes: 'Derived from --wcag-level; not a named compliance bundle.',
        manualTestingRequired: COMPLIANCE_PROFILES.wcag22aa.manualTestingRequired,
        axePresetKey: null,
      },
      detStandardsTags: tags.filter((t) => t.startsWith('wcag') || t === 'section508'),
    };
  }

  const profileDef = getComplianceProfile(profileId);
  if (profileDef) {
    const preset = A11Y_STANDARD_PRESETS[profileDef.axePresetKey] || A11Y_STANDARD_PRESETS.wcag22aa;
    let tags = [...preset.axeTags];
    if (opts.includeBestPractice && !tags.includes('best-practice')) {
      tags.push('best-practice');
    }
    tags = uniqueTags(tags);
    return {
      presetId: profileDef.id,
      label: profileDef.label,
      axeTags: tags,
      standardsProfile: tags.join(','),
      notes: profileDef.jurisdictionNotes,
      complianceProfile: {
        id: profileDef.id,
        label: profileDef.label,
        wcagVersion: profileDef.wcagVersion,
        level: profileDef.level,
        jurisdictionNotes: profileDef.jurisdictionNotes,
        manualTestingRequired: profileDef.manualTestingRequired,
        axePresetKey: profileDef.axePresetKey,
      },
      detStandardsTags: [...profileDef.detStandardsTags],
    };
  }

  const preset = A11Y_STANDARD_PRESETS[profileId] || A11Y_STANDARD_PRESETS.wcag22aa;
  let tags = [...preset.axeTags];
  if (opts.includeBestPractice && !tags.includes('best-practice')) {
    tags.push('best-practice');
  }
  tags = uniqueTags(tags);
  const fallbackProfile = getComplianceProfile(preset.id) || COMPLIANCE_PROFILES.wcag22aa;
  return {
    presetId: preset.id,
    label: preset.label,
    axeTags: tags,
    standardsProfile: tags.join(','),
    notes: preset.notes || '',
    complianceProfile: {
      id: fallbackProfile.id,
      label: preset.label,
      wcagVersion: fallbackProfile.wcagVersion,
      level: fallbackProfile.level,
      jurisdictionNotes: preset.notes || fallbackProfile.jurisdictionNotes,
      manualTestingRequired: fallbackProfile.manualTestingRequired,
      axePresetKey: preset.id,
    },
    detStandardsTags: [...fallbackProfile.detStandardsTags],
  };
}

/**
 * @param {string} profileId
 * @param {string[]} tags
 */
function buildCustomComplianceProfile(profileId, tags) {
  return {
    id: profileId === 'custom' ? 'custom' : profileId,
    label: 'Custom axe tags',
    wcagVersion: '—',
    level: '—',
    jurisdictionNotes: 'Explicit --axe-tags override.',
    manualTestingRequired: COMPLIANCE_PROFILES.wcag22aa.manualTestingRequired,
    axePresetKey: null,
  };
}

/** @param {string[]} tags */
function uniqueTags(tags) {
  return [...new Set(tags.map((t) => t.trim()).filter(Boolean))];
}

export function listStandardPresetIds() {
  return listComplianceProfileIds();
}

export { COMPLIANCE_DISCLAIMER, listComplianceProfileIds };
