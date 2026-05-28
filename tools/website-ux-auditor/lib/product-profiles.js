import path from 'node:path';

import { fileExists } from './files.js';

/** Merged into each profile via `homepageShell`; Platform uses stricter sidebar blocker (>12 sidebar links). See v2 standard addendum. */
export const HOMEPAGE_SHELL_DEFAULTS = {
  /** Blocker when visible sidebar/offcanvas link count exceeds this (Platform: 12; others: relaxed). */
  maxSidebarOffcanvasLinksBlocker: 999,
  /** Critical finding when visible document links strictly above main H1 exceed this (after excluding auxiliary links). */
  maxPreMainFirstH1LinksCritical: 10,
  /** Contributes to Platform blocker when combined with sidebar link wall; also informational. */
  handbookChromeTermCritical: 2,
  /** Major when duplicate normalized link texts in chrome regions exceed surplus pairs. */
  duplicateNavLinkTextsMajor: 8,
  /** Guidance only (checks may use later). */
  maxFirstScreenNavLinks: 8,
};

export const PRODUCT_PROFILES = {
  forgesdlc: {
    name: 'ForgeSDLC',
    oneLiner: 'The methodology for governed human + agent software delivery.',
    promise: 'Govern software delivery across humans and AI agents.',
    primaryAudience: 'leaders, architects, engineers, and delivery teams',
    preferredStory: 'intent -> structured work -> human or agent execution -> review -> evidence -> release',
    homepageMustUseProductShell: true,
    handbookShellAllowedOnlyBeyondHome: true,
    homepageShell: { ...HOMEPAGE_SHELL_DEFAULTS, maxSidebarOffcanvasLinksBlocker: 24 },
  },
  lcdl: {
    name: 'Forge LCDL',
    oneLiner: 'A governed task layer for reliable LLM calls in Python systems.',
    promise: 'Build governed LLM tasks into Python systems.',
    primaryAudience: 'engineers, AI application builders, and reviewers',
    preferredStory: 'contract -> schema -> model call -> validation/repair -> typed result -> reviewable outcome',
    homepageMustUseProductShell: true,
    handbookShellAllowedOnlyBeyondHome: true,
    homepageShell: { ...HOMEPAGE_SHELL_DEFAULTS, maxSidebarOffcanvasLinksBlocker: 24 },
  },
  fleet: {
    name: 'Forge Fleet',
    oneLiner: 'A controlled job execution plane for automations on infrastructure you own.',
    promise: 'Run controlled automation jobs on infrastructure you own.',
    primaryAudience: 'operators, platform engineers, and automation authors',
    preferredStory: 'request -> job template -> containerized execution -> logs/status -> audit trail',
    homepageMustUseProductShell: true,
    handbookShellAllowedOnlyBeyondHome: true,
    homepageShell: { ...HOMEPAGE_SHELL_DEFAULTS, maxSidebarOffcanvasLinksBlocker: 24 },
  },
  lenses: {
    name: 'Forge Lenses',
    oneLiner: 'A local-first control plane for inspecting and guiding Forge workspaces.',
    promise: 'See and govern your Forge workspace locally.',
    primaryAudience: 'workspace owners, engineers, workshop facilitators, and reviewers',
    preferredStory: 'workspace -> dashboard -> health signals -> guided action -> optional Fleet/LLM integrations',
    homepageMustUseProductShell: true,
    handbookShellAllowedOnlyBeyondHome: true,
    homepageShell: { ...HOMEPAGE_SHELL_DEFAULTS, maxSidebarOffcanvasLinksBlocker: 24 },
  },
  platform: {
    name: 'Forge Platform',
    oneLiner: 'The integrated architecture that connects methodology, workspace visibility, governed reasoning, and controlled execution.',
    promise: 'Connect governed delivery from intent to execution.',
    primaryAudience: 'enterprise evaluators, platform owners, architects, and maintainers',
    preferredStory: 'methodology -> workspace visibility -> governed reasoning -> controlled execution -> evidence',
    homepageMustUseProductShell: true,
    handbookShellAllowedOnlyBeyondHome: true,
    homepageShell: { ...HOMEPAGE_SHELL_DEFAULTS, maxSidebarOffcanvasLinksBlocker: 12 },
  },
  generic: {
    name: 'Forge website',
    oneLiner: 'A Forge product site for governed AI-enabled delivery.',
    promise: 'Make the product clear, governed, and enterprise-ready.',
    primaryAudience: 'new visitors, technical evaluators, and internal implementers',
    preferredStory: 'human outcome -> governed system -> bounded execution -> trust -> next action',
    homepageMustUseProductShell: true,
    handbookShellAllowedOnlyBeyondHome: true,
    homepageShell: { ...HOMEPAGE_SHELL_DEFAULTS },
  },
  'a11y-studio': {
    name: 'Forge A11y Studio',
    oneLiner: 'A local-first accessibility control workbench for governed audits and evidence.',
    promise: 'Run, review, and trace accessibility work without leaving the machine.',
    primaryAudience: 'accessibility engineers, reviewers, and platform operators',
    preferredStory: 'registry -> governed run -> evidence -> triage -> remediation -> monitor',
    homepageMustUseProductShell: false,
    handbookShellAllowedOnlyBeyondHome: false,
    pageMode: 'app',
    homepageShell: { ...HOMEPAGE_SHELL_DEFAULTS, maxSidebarOffcanvasLinksBlocker: 999 },
  },
  'app-shell': {
    name: 'Forge app shell',
    oneLiner: 'A desktop-first operator UI built on KS app chrome.',
    promise: 'Consistent studio chrome with governed workflows.',
    primaryAudience: 'operators and engineers',
    preferredStory: 'context -> workspace -> action -> evidence',
    homepageMustUseProductShell: false,
    handbookShellAllowedOnlyBeyondHome: false,
    pageMode: 'app',
    homepageShell: { ...HOMEPAGE_SHELL_DEFAULTS, maxSidebarOffcanvasLinksBlocker: 999 },
  },
};

export function inferSiteKind(args, inventory) {
  if (args.siteKind && args.siteKind !== 'auto') return PRODUCT_PROFILES[args.siteKind] ? args.siteKind : 'generic';
  const haystack = [args.site || '', inventory.packageName || '', inventory.framework || '', ...inventory.topFiles.slice(0, 80)].join(' ').toLowerCase();
  for (const kind of ['a11y-studio', 'app-shell', 'forgesdlc', 'lenses', 'lcdl', 'fleet', 'platform']) {
    if (haystack.includes(kind)) return kind;
  }
  if (/forge[-_]?accessibility|a11ystudio/.test(haystack.replace(/-/g, ''))) return 'a11y-studio';
  return 'generic';
}

/**
 * Populate args.standard using repo default KS path when file exists.
 * @param {object} args
 * @returns {Promise<void>}
 */
export async function applyDefaultForgeStandard(args) {
  const fallbackStandard = path.join(args.repo, 'docs/design/forge-enterprise-ai-website-standard.md');
  if (!args.standard && (await fileExists(fallbackStandard))) {
    args.standard = fallbackStandard;
  }
}

/**
 * @param {string} siteKind resolved kind key
 */
export function homepageShellPolicyFor(siteKind) {
  const key = PRODUCT_PROFILES[siteKind] ? siteKind : 'generic';
  const p = PRODUCT_PROFILES[key];
  return { ...HOMEPAGE_SHELL_DEFAULTS, ...(p.homepageShell || {}) };
}
