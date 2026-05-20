Verify this phase without editing files.

Start with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide concise evidence, missing work, and exact next actions.

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

--- EXECUTION LOG START ---
Here is what was delivered for **phase 04**.

### Documentation
- **`docs/design/ux-audit/ai-enabled-design-principles.md`** — Frames AI review as an advisory layer; documents the required JSON metadata block; adds the **seven canonical** `principleId` values; keeps other `AI.*` ids as extended vocabulary. Replaced the old `AI.VISUAL.HIERARCHY` row with **`AI.VISUAL.HIERARCHY_CONFIDENCE`**, added **`AI.GOVERNANCE.CREDIBILITY`**, **`AI.CONTRACT.ACTIONABILITY`**, and **`AI.RULE_DISCOVERY.CANDIDATE_DETERMINISTIC_RULE`**.

### Tooling
- **`tools/website-ux-auditor/lib/ai-audit-batches.js`** — Introduces exported **`AI_REVIEW_CONTRACT`**; adds it to the manifest and **each batch**; extends **`normalizeAiFinding`** with `principleId`, `deterministicCoverage`, `candidateDeterministicRule`, `hashesOrContractsAffected`, `screenshotOrDomEvidence`, and **numeric** `confidence` (still accepts `high|medium|low`); updates markdown output accordingly.
- **`tools/website-ux-auditor/build-ai-audit-batches.mjs`** / **`aggregate-ai-audit-results.mjs`** — Usage text documents `aiReviewContract` and preserved finding fields.
- **`tools/website-ux-auditor/cursor-agent-run-ux-audit.sh`** — Prompt tells the agent to use `aiReviewContract`, map to canonical principles, and **prefer deterministic rule promotion**; JSON schema matches the new fields and **`confidence`** as a number.

### Tests & plan evidence
- **`auditor-tests/ai-audit-batches.test.js`** — Asserts `aiReviewContract` on manifests/batches and that aggregation keeps **`candidateDeterministicRule`** and related fields (`confidence` → `0.85` for legacy `"high"`).
- **`.cursor/plans/ks-ux-component-rules/04-ai-enabled-principles-and-prompts.md`** — Phase report with evidence.
- **`00-master-sequence.md`** — Links the phase 04 report.

### Verification
- **`cd tools/website-ux-auditor && npm test`** — **99/99** passing.
--- EXECUTION LOG END ---
