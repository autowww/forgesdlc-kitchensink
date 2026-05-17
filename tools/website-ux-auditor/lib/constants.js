/** Shared glossary and term lists for DOM metrics extraction and static scan. */

export const TECHNICAL_TRANSLATIONS = [
  ['Bearer-aware HTTP control plane', 'token-protected job control plane'],
  ['docker_argv jobs', 'containerized jobs'],
  ['SQLite-backed', 'local job history'],
  ['schema sidecars', 'versioned output contracts'],
  ['deterministic operators', 'predictable workflow control'],
  ['governed synchronous LLM tasks', 'reviewable LLM calls in production code'],
  ['agent workcells', 'bounded agent execution units'],
  ['canonical Markdown', 'source-of-truth content'],
  ['submodule refresh', 'dependency/update workflow'],
  ['/v1/* JSON', 'API for scripts and tools'],
];

export const TRUST_TERMS = [
  'trust', 'security', 'secure', 'privacy', 'local-first', 'local first', 'owned infrastructure',
  'data boundary', 'execution boundary', 'approval', 'review', 'audit', 'evidence', 'traceable',
  'governed', 'human-owned', 'operator', 'admin', 'control', 'out of scope', 'unsupported',
];

export const ECOSYSTEM_TERMS = ['ForgeSDLC', 'Lenses', 'LCDL', 'Fleet', 'Platform', 'Blueprints', 'Forge ecosystem'];

export const OUTCOME_TERMS = ['govern', 'trace', 'review', 'decide', 'ship', 'deliver', 'inspect', 'control', 'reduce', 'accelerate', 'clarity', 'evidence'];

export const CTA_TERMS = ['get started', 'start', 'install', 'try', 'run', 'explore', 'view', 'read', 'learn', 'docs', 'quickstart', 'contact'];

/** Labels that imply handbook / docs-tree chrome near the hero (homepage-shell heuristic). phrases: case-insensitive substring; boundaryTokens: `\b...\b`. */
export const HANDBOOK_CHROME_PHRASES = [
  'Handbook',
  'Chapters',
  'Product-agnostic',
  'Docs tree',
  'ADRs',
  'Sprints',
  'Evidence',
  'Prompts',
  'Maintainer setup',
];

export const SCHEMA_VERSION = 2;
