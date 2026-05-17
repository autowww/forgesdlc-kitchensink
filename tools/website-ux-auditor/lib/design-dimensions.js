/** Design UX dimensions aligned to forge-enterprise-ai-website-standard.md sections. */

export const DESIGN_DIMENSION_IDS = [
  'narrativeHero',
  'informationArchitecture',
  'depthAndTechnicalDisclosure',
  'trustAndEcosystemTruth',
  'visualRhythmFirstScreen',
  'accessibilitySemanticsMeta',
];

/**
 * Finding `area` from checks → primary dimension bucket.
 * `inventory` / `site-inspection` are ancillary (coverage), not pillar scores.
 */
export const AREA_TO_DESIGN_DIMENSION = {
  hero: 'narrativeHero',
  messaging: 'narrativeHero',
  conversion: 'narrativeHero',
  'first-screen': 'visualRhythmFirstScreen',
  navigation: 'informationArchitecture',
  'information-architecture': 'informationArchitecture',
  ecosystem: 'trustAndEcosystemTruth',
  'page-depth': 'depthAndTechnicalDisclosure',
  'technical-depth': 'depthAndTechnicalDisclosure',
  readability: 'depthAndTechnicalDisclosure',
  trust: 'trustAndEcosystemTruth',
  accessibility: 'accessibilitySemanticsMeta',
  metadata: 'accessibilitySemanticsMeta',
  semantics: 'accessibilitySemanticsMeta',
  inventory: null,
  'site-inspection': null,
};

export const DESIGN_DIMENSION_META = {
  narrativeHero: {
    label: 'Narrative, hero & CTAs',
    standardSections: ['Core principle', 'Messaging rules', 'Landing page anatomy', 'Universal storyline'],
  },
  informationArchitecture: {
    label: 'Information architecture & navigation',
    standardSections: [
      'Information architecture rules',
      'Anti-patterns',
      'Public homepage shell rule (v2 addendum)',
      'Page mode taxonomy (v2 addendum)',
    ],

  },
  depthAndTechnicalDisclosure: {
    label: 'Page depth & technical disclosure',
    standardSections: ['Page length and depth limits', 'Translation rules for technical language'],
  },
  trustAndEcosystemTruth: {
    label: 'Trust model & ecosystem fit',
    standardSections: ['Trust block template', 'Required reusable sections', 'Messaging rules'],
  },
  visualRhythmFirstScreen: {
    label: 'Visual rhythm & first screen',
    standardSections: ['Visual design principles', 'Landing page anatomy'],
  },
  accessibilitySemanticsMeta: {
    label: 'Accessibility, semantics & metadata',
    standardSections: ['Agent implementation rules', 'Visual design principles'],
  },
};

/** Finding areas omitted from design-standard perfection / pillar damage. */
export const ANCILLARY_FINDING_AREAS = new Set(['inventory', 'site-inspection']);
