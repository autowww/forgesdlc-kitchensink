/**
 * DET.SECTION.SINGLE_JOB — each major content section should express one coherent topic,
 * detectable via heading/subheading alignment and lightweight keyword clustering.
 */

import { pageContext } from '../../../checks/context.js';
import {
  MIN_MAJOR_SECTION_HEIGHT_PX,
  MIN_MAJOR_SECTION_WORDS,
} from './det-section-heading.check.js';

export const MAX_SECTION_SINGLE_JOB_FINDINGS = 6;

/** Distinct topic buckets hit in one section before it reads as multi-job. */
export const MAX_TOPIC_BUCKETS_PER_SECTION = 2;

/** Minimum peer subheadings with low mutual overlap to flag divergent topics. */
export const MIN_DIVERGENT_SUBHEADINGS = 2;

/** Jaccard threshold: subheading titles look unrelated to each other / primary heading. */
export const LOW_TOPIC_OVERLAP = 0.12;

/** Jaccard threshold: primary heading tokens barely appear in section body keywords. */
export const HEADING_BODY_DRIFT = 0.1;

const EXCLUDED_SECTION_SELECTOR = [
  'nav',
  '[role="navigation"]',
  '.navbar',
  '.forge-toc',
  '.ks-doc-toc',
  'aside.forge-sidebar',
  '#ks-sidebar-aside',
  '.fs-sidebar',
  'footer',
  '.cookie',
  '[class*="cookie"]',
].join(',');

const HEADING_SELECTOR = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  '[role="heading"]',
].join(',');

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'our', 'are', 'was', 'were',
  'have', 'has', 'into', 'about', 'when', 'what', 'how', 'why', 'can', 'will', 'not', 'but',
  'all', 'any', 'each', 'more', 'most', 'other', 'than', 'then', 'them', 'they', 'their',
  'there', 'these', 'those', 'using', 'used', 'also', 'just', 'only', 'over', 'such', 'very',
]);

/** Intent lexicon buckets (deterministic substring tests). */
export const TOPIC_BUCKETS = [
  { id: 'workflow', re: /\b(how it works|workflow|stages?|lifecycle|pipeline|process|from intent)\b/i },
  { id: 'trust', re: /\b(trust|security|governance|boundary|privacy|audit|evidence|compliance)\b/i },
  { id: 'outcome', re: /\b(outcome|benefit|value|impact|result|why forge|why choose)\b/i },
  { id: 'ecosystem', re: /\b(forgesdlc|lenses|lcdl|fleet|platform|blueprints|ecosystem)\b/i },
  { id: 'reference', re: /\b(reference|api|schema|endpoint|chapter|appendix|documentation|handbook|adr)\b/i },
  { id: 'pricing', re: /\b(pricing|plan|tier|subscription|cost|license)\b/i },
  { id: 'onboarding', re: /\b(get started|quickstart|install|setup|try|sign up|start now)\b/i },
];

export const rule = {
  id: 'DET.SECTION.SINGLE_JOB',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'narrativeHero',
  defaultSeverity: 'minor',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-section-single-job',
};

/**
 * @param {string} text
 * @returns {string[]}
 */
export function contentTokens(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * @param {string[]} a
 * @param {string[]} b
 */
export function tokenJaccard(a, b) {
  const left = Array.isArray(a) ? a : [];
  const right = Array.isArray(b) ? b : [];
  if (!left.length || !right.length) return 0;
  const sa = new Set(left);
  const sb = new Set(right);
  let inter = 0;
  for (const t of sa) {
    if (sb.has(t)) inter += 1;
  }
  const union = sa.size + sb.size - inter;
  return union > 0 ? inter / union : 0;
}

/**
 * @param {string} haystack
 * @returns {string[]}
 */
export function topicBucketsInText(haystack) {
  const text = String(haystack || '');
  return TOPIC_BUCKETS.filter((b) => b.re.test(text)).map((b) => b.id);
}

/**
 * @param {string} bodyText
 * @param {number} [limit]
 */
export function topBodyKeywords(bodyText, limit = 8) {
  const counts = new Map();
  for (const token of contentTokens(bodyText)) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * @param {{
 *   sections?: Array<{
 *     selectorHint?: string,
 *     wordCount?: number,
 *     primaryHeading?: string,
 *     subheadings?: string[],
 *     bodySample?: string,
 *     cardTitles?: string[],
 *   }>,
 * }} snapshot
 */
export function violationsFromSectionSingleJobSnapshot(snapshot) {
  /** @type {Array<Record<string, unknown>>} */
  const violations = [];

  for (const section of Array.isArray(snapshot?.sections) ? snapshot.sections : []) {
    const words = Number(section?.wordCount ?? 0);
    if (words < MIN_MAJOR_SECTION_WORDS) continue;

    const hint = String(section?.selectorHint || 'section').slice(0, 120);
    const primary = String(section?.primaryHeading || '');
    const subheadings = (Array.isArray(section?.subheadings) ? section.subheadings : [])
      .map((h) => String(h || '').trim())
      .filter(Boolean);
    const bodySample = String(section?.bodySample || '');
    const cardTitles = (Array.isArray(section?.cardTitles) ? section.cardTitles : [])
      .map((t) => String(t || '').trim())
      .filter(Boolean);

    const clusterHaystack = [primary, ...subheadings, bodySample.slice(0, 600)].join('\n');
    const buckets = topicBucketsInText(clusterHaystack);
    if (buckets.length > MAX_TOPIC_BUCKETS_PER_SECTION) {
      violations.push({
        kind: 'multi-topic-buckets',
        selectorHint: hint,
        wordCount: words,
        buckets,
        bucketCount: buckets.length,
      });
    }

    const primaryTokens = contentTokens(primary);
    const subTokens = subheadings.map((h) => contentTokens(h)).filter((t) => t.length >= 2);
    if (subTokens.length >= MIN_DIVERGENT_SUBHEADINGS) {
      let divergentPairs = 0;
      for (let i = 0; i < subTokens.length; i += 1) {
        for (let j = i + 1; j < subTokens.length; j += 1) {
          const overlap = tokenJaccard(subTokens[i], subTokens[j]);
          const primaryOverlap = Math.max(
            tokenJaccard(primaryTokens, subTokens[i]),
            tokenJaccard(primaryTokens, subTokens[j]),
          );
          if (overlap < LOW_TOPIC_OVERLAP && primaryOverlap < LOW_TOPIC_OVERLAP) {
            divergentPairs += 1;
          }
        }
      }
      if (divergentPairs >= 1) {
        violations.push({
          kind: 'divergent-subheadings',
          selectorHint: hint,
          wordCount: words,
          subheadingCount: subheadings.length,
          sampleSubheadings: subheadings.slice(0, 3),
        });
      }
    }

    if (primaryTokens.length >= 2 && words >= 80) {
      const bodyKeywords = topBodyKeywords(bodySample);
      const overlap = tokenJaccard(primaryTokens, bodyKeywords);
      if (overlap < HEADING_BODY_DRIFT) {
        violations.push({
          kind: 'heading-body-drift',
          selectorHint: hint,
          wordCount: words,
          heading: primary.slice(0, 80),
          overlap: Number(overlap.toFixed(3)),
        });
      }
    }

    if (cardTitles.length >= 3) {
      const titleTokens = cardTitles.map((t) => contentTokens(t)).filter((t) => t.length >= 2);
      if (titleTokens.length >= 3) {
        let unrelatedPairs = 0;
        for (let i = 0; i < titleTokens.length; i += 1) {
          for (let j = i + 1; j < titleTokens.length; j += 1) {
            if (tokenJaccard(titleTokens[i], titleTokens[j]) < LOW_TOPIC_OVERLAP) unrelatedPairs += 1;
          }
        }
        const maxPairs = (titleTokens.length * (titleTokens.length - 1)) / 2;
        if (unrelatedPairs >= 2 && unrelatedPairs / maxPairs >= 0.5) {
          violations.push({
            kind: 'card-title-sprawl',
            selectorHint: hint,
            wordCount: words,
            cardCount: cardTitles.length,
            sampleTitles: cardTitles.slice(0, 4),
          });
        }
      }
    }
  }

  return violations;
}

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromSectionSingleJobReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, MAX_SECTION_SINGLE_JOB_FINDINGS)) {
    const kind = String(v.kind || 'section-single-job');
    const hint = String(v.selectorHint || 'section').slice(0, 120);
    const key = `${kind}:${hint}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (kind === 'multi-topic-buckets') {
      const count = Number(v.bucketCount ?? 0);
      findings.push({
        severity: count >= MAX_TOPIC_BUCKETS_PER_SECTION + 2 ? 'major' : 'minor',
        area: 'informationArchitecture',
        message: 'A major section mixes multiple distinct story topics (section should have one job).',
        evidence: `multi_topic_buckets section="${hint}" buckets=${(v.buckets || []).join(',')} count=${count}`,
        remediation:
          'Split the section into separate bands (one outcome, workflow, trust, or ecosystem block each) or narrow copy so the heading and body pursue a single intent.',
      });
    } else if (kind === 'divergent-subheadings') {
      findings.push({
        severity: Number(v.subheadingCount ?? 0) >= 3 ? 'major' : 'minor',
        area: 'informationArchitecture',
        message: 'Peer subheadings in a major section point at unrelated topics under one section title.',
        evidence: `divergent_subheadings section="${hint}" subheadings=${v.subheadingCount ?? '?'} sample="${String((v.sampleSubheadings || []).join(' | ')).slice(0, 100)}"`,
        remediation:
          'Give each topic its own section with one primary heading, or nest secondary topics under a clearly scoped parent block.',
      });
    } else if (kind === 'heading-body-drift') {
      findings.push({
        severity: 'minor',
        area: 'informationArchitecture',
        message: 'Section body keywords barely overlap the primary heading (heading promises a different topic than the prose).',
        evidence: `heading_body_drift section="${hint}" heading="${String(v.heading || '').slice(0, 60)}" jaccard=${v.overlap ?? '?'}`,
        remediation:
          'Align the section title with the first paragraphs, or move off-topic paragraphs into a linked docs page or adjacent section.',
      });
    } else if (kind === 'card-title-sprawl') {
      findings.push({
        severity: 'major',
        area: 'informationArchitecture',
        message: 'Multiple cards in one section advertise unrelated jobs instead of one coherent subsection theme.',
        evidence: `card_title_sprawl section="${hint}" cards=${v.cardCount ?? '?'} sample="${String((v.sampleTitles || []).join(' | ')).slice(0, 100)}"`,
        remediation:
          'Group cards under one shared subsection intent, or split card grids into separate sections with their own headings.',
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
export async function collectSectionSingleJobReport(page) {
  return page.evaluate(
    ({
      minWords,
      minHeight,
      excludedSectionSelector,
      headingSelector,
      topicBucketPatterns,
    }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const words = (s) => norm(s).split(/\s+/).filter(Boolean);
      const textOf = (el) => norm(el.innerText || el.textContent || el.getAttribute('aria-label') || '');

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const selectorHintFor = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 2).join('.');
        return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}`;
      };

      const bucketsInText = (text) => {
        const hay = String(text || '');
        const hits = [];
        for (const bucket of topicBucketPatterns) {
          try {
            const re = new RegExp(bucket.pattern, bucket.flags || 'i');
            if (re.test(hay)) hits.push(bucket.id);
          } catch {
            /* ignore bad pattern */
          }
        }
        return hits;
      };

      const main = document.querySelector('main#main') || document.querySelector('main') || document.body;
      const root = main || document.body;

      const peerHeadingsInSection = (sectionEl) => {
        /** @type {string[]} */
        const sub = [];
        let primary = '';
        for (const el of sectionEl.querySelectorAll(headingSelector)) {
          if (!visible(el)) continue;
          const owner = el.closest('section, article');
          if (owner && owner !== sectionEl) continue;
          const tag = el.tagName.toLowerCase();
          const level = /^h[1-6]$/.test(tag) ? Number.parseInt(tag.slice(1), 10) : 2;
          const text = textOf(el).slice(0, 120);
          if (!text) continue;
          if (!primary && level <= 3) {
            primary = text;
            continue;
          }
          if (level >= 3) sub.push(text);
        }

        if (!primary) {
          const labelledBy = norm(sectionEl.getAttribute('aria-labelledby') || '');
          for (const id of labelledBy.split(/\s+/).filter(Boolean)) {
            const label = document.getElementById(id);
            if (label && visible(label)) {
              primary = textOf(label).slice(0, 120);
              break;
            }
          }
        }

        return { primary, subheadings: sub };
      };

      const cardTitlesInSection = (sectionEl) => {
        /** @type {string[]} */
        const titles = [];
        const cardRoots = sectionEl.querySelectorAll(
          '[class*="card"], [data-card], [class*="tile"], [class*="panel"]',
        );
        for (const card of cardRoots) {
          if (!visible(card)) continue;
          const titleEl = card.querySelector(
            'h2, h3, h4, h5, h6, [class*="card-title"], [class*="tile-title"], .title',
          );
          const title = titleEl ? textOf(titleEl).slice(0, 100) : '';
          if (title.length >= 3) titles.push(title);
        }
        return titles;
      };

      /** @type {Array<Record<string, unknown>>} */
      const sections = [];
      for (const sectionEl of root.querySelectorAll('section, article')) {
        if (!visible(sectionEl)) continue;
        if (sectionEl.closest(excludedSectionSelector)) continue;
        const bodyText = textOf(sectionEl);
        const wordCount = words(bodyText).length;
        const height = Math.round(sectionEl.getBoundingClientRect().height);
        if (wordCount < minWords && height < minHeight) continue;

        const { primary, subheadings } = peerHeadingsInSection(sectionEl);
        const bodySample = bodyText.slice(0, 900);
        sections.push({
          selectorHint: selectorHintFor(sectionEl),
          wordCount,
          height,
          primaryHeading: primary,
          subheadings,
          bodySample,
          cardTitles: cardTitlesInSection(sectionEl),
          buckets: bucketsInText([primary, ...subheadings, bodySample].join('\n')),
        });
      }

      return {
        minMajorSectionWords: minWords,
        sectionCount: sections.length,
        sections,
      };
    },
    {
      minWords: MIN_MAJOR_SECTION_WORDS,
      minHeight: MIN_MAJOR_SECTION_HEIGHT_PX,
      excludedSectionSelector: EXCLUDED_SECTION_SELECTOR,
      headingSelector: HEADING_SELECTOR,
      topicBucketPatterns: TOPIC_BUCKETS.map((b) => ({
        id: b.id,
        pattern: b.re.source,
        flags: b.re.flags.replace('g', ''),
      })),
    },
  );
}

/**
 * @param {Record<string, unknown>} [metrics]
 * @param {string} [url]
 * @param {{ siteKind?: string }} [ctx]
 */
export function findingsFromSectionSingleJobMetrics(metrics, url = '', ctx = {}) {
  const pageUrl = url || String(metrics?.url || '');
  const burdenCtx = pageContext(pageUrl, ctx.siteKind || 'generic');
  if (burdenCtx.isPlatformHandbookInner) return [];

  const report = metrics?.sectionSingleJobReport;
  if (report) {
    const violations = violationsFromSectionSingleJobSnapshot(report);
    return findingsFromSectionSingleJobReport({ violations }, pageUrl);
  }

  return [];
}

export async function run({ metrics, page, url, ctx = {} }) {
  const pageUrl = url || String(metrics?.url || '');
  const burdenCtx = pageContext(pageUrl, ctx.siteKind || 'generic');
  if (burdenCtx.isPlatformHandbookInner) return [];

  let report = metrics?.sectionSingleJobReport;
  if (!report && page) {
    report = await collectSectionSingleJobReport(page);
  }

  if (report) {
    const violations = violationsFromSectionSingleJobSnapshot(report);
    return findingsFromSectionSingleJobReport({ violations }, pageUrl);
  }

  return findingsFromSectionSingleJobMetrics(metrics, pageUrl, ctx);
}
