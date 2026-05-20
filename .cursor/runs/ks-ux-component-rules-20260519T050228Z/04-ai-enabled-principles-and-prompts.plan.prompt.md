Read the phase prompt below and create a precise implementation plan. Do not edit files in this planning step. The work belongs under .cursor/plans/ks-ux-component-rules/. Include files to inspect/change, deterministic checks, AI-enabled rules, risks, and validation commands.

--- PHASE PROMPT START ---
# 04 — AI-enabled principles and prompts

Goal: define AI-enabled review as an advisory layer for high-order design quality and rule discovery.

Update:

- `docs/design/ux-audit/ai-enabled-design-principles.md`
- `tools/website-ux-auditor/lib/ai-audit-batches.js`
- `tools/website-ux-auditor/build-ai-audit-batches.mjs`
- `tools/website-ux-auditor/aggregate-ai-audit-results.mjs`
- `tools/website-ux-auditor/cursor-agent-run-ux-audit.sh`

AI review principles must include:

- `AI.PREMIUM.ENTERPRISE_FEEL`
- `AI.VISUAL.HIERARCHY_CONFIDENCE`
- `AI.CONTEXT.COGNITIVE_CLARITY`
- `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE`
- `AI.GOVERNANCE.CREDIBILITY`
- `AI.CONTRACT.ACTIONABILITY`
- `AI.RULE_DISCOVERY.CANDIDATE_DETERMINISTIC_RULE`

Every AI finding must include:

```json
{
  "principleId": "AI.CONTEXT.COGNITIVE_CLARITY",
  "deterministicCoverage": "covered|partially-covered|not-covered",
  "candidateDeterministicRule": "...",
  "hashesOrContractsAffected": ["..."],
  "screenshotOrDomEvidence": "...",
  "confidence": 0.0
}
```

Acceptance:
- AI batch tests pass;
- aggregator preserves candidate deterministic rule fields;
- AI prompts instruct the agent to prefer deterministic rule promotion for repeatable issues.
--- PHASE PROMPT END ---
