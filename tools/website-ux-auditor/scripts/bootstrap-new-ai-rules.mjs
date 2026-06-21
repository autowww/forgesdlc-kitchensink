#!/usr/bin/env node
/** One-off bootstrap for Prompt 06 AI rule pages + prompt sources. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KS_ROOT = path.resolve(__dirname, '../../..');
const rules = [
  ['AI.FORM.FRICTION_AND_RECOVERY', 'Form friction and recovery', 'Users can recover from validation mistakes with inline guidance and preserved input.'],
  ['AI.DASHBOARD.ACTIONABILITY_PRIORITY', 'Dashboard actionability priority', 'Operator surfaces prioritize actionable next steps over vanity metrics.'],
  ['AI.EMPTY_STATE.USEFULNESS', 'Empty state usefulness', 'Empty views explain why data is missing and offer a concrete next step.'],
  ['AI.RESPONSIVE.CROSS_DEVICE_COMPREHENSION', 'Responsive cross-device comprehension', 'Meaning and hierarchy survive across breakpoints—not only reflow.'],
  ['AI.ONBOARDING.PROGRESSIVE_DISCLOSURE', 'Onboarding progressive disclosure', 'Complexity is revealed in stages matched to user readiness.'],
  ['AI.INFORMATION_SCENT.NEXT_STEP', 'Information scent and next step', 'Labels, hierarchy, and CTAs make the next action obvious.'],
  ['AI.TRUST.DATA_FRESHNESS_PROVENANCE', 'Data freshness and provenance', 'Users can judge whether numbers are current, scoped, and trustworthy.'],
  ['AI.ERROR_COPY.REASSURANCE', 'Error copy reassurance', 'Errors reassure without blame and state a recovery path.'],
  ['AI.BRAND.GENERICITY_AND_DIFFERENTIATION', 'Brand genericity and differentiation', 'The product feels intentionally branded—not generic template soup.'],
  ['AI.APP.WORKFLOW_RISK_GUARDRAILS', 'Workflow risk guardrails', 'Destructive or irreversible actions have proportionate guardrails.'],
];

function kebab(id) {
  return id.toLowerCase().replaceAll('.', '-').replaceAll('_', '-');
}

const pageDir = path.join(KS_ROOT, 'docs/design/ux-audit/rule-pages');
const promptDir = path.join(KS_ROOT, 'tools/website-ux-auditor/design-rules/ai/prompts');

for (const [id, title, summary] of rules) {
  const k = kebab(id);
  const pagePath = path.join(pageDir, `${k}.md`);
  if (!fs.existsSync(pagePath)) {
    fs.writeFileSync(
      pagePath,
      `---
rule_id: ${id}
lane: ai
title: ${title}
summary: ${summary}
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#${k}
---

## Purpose

${summary}

Judgment overlay for \`${id}\`. Pair with related \`DET.*\` checks; propose \`candidateDeterministicRule\` when the pattern repeats.

## Required finding metadata

Each finding must include: \`principleId\`, \`severity\`, \`deterministicCoverage\`, \`candidateDeterministicRule\`, \`screenshotOrDomEvidence\`, \`hashesOrContractsAffected\`, \`confidence\`, \`recommendedFixScope\`, \`sourceFilesLikelyAffected\`.
`,
    );
  }
  const promptPath = path.join(promptDir, `${k}.md`);
  if (!fs.existsSync(promptPath)) {
    fs.writeFileSync(
      promptPath,
      `# ${id}

${summary}

PDCA framing:
- Plan: identify issues tied to ${id}.
- Do: propose concrete remediation steps.
- Check: define objective acceptance checks and evidence capture.
- Adjust: if repeatable, propose a deterministic \`DET.*\` candidate.

Return findings with required metadata: principleId, severity, deterministicCoverage, candidateDeterministicRule, screenshotOrDomEvidence, hashesOrContractsAffected, confidence, recommendedFixScope, sourceFilesLikelyAffected.
`,
    );
  }
}
console.log(`bootstrap-new-ai-rules: ensured ${rules.length} rule pages and prompts`);
