# KS UX component rules — phase 04 (AI-enabled principles + prompts)

## Goal

Define **AI-enabled review** as an **advisory layer** for high-order design quality and for **discovering candidate deterministic rules** (`DET.*` / catalog checks), without replacing hash governance or deterministic passes.

## What changed (implementation)

### `docs/design/ux-audit/ai-enabled-design-principles.md`

- Documents seven **canonical** `principleId` values (premium feel, hierarchy confidence, cognitive clarity, product explanatory value, governance credibility, contract actionability, rule discovery).
- Specifies **required judgment metadata** on every AI finding: `principleId`, `deterministicCoverage`, `candidateDeterministicRule`, `hashesOrContractsAffected`, `screenshotOrDomEvidence`, `confidence` (0.0–1.0).
- Keeps extended optional `AI.*` vocabulary in later sections for richer notes.

### `tools/website-ux-auditor/lib/ai-audit-batches.js`

- Exports **`AI_REVIEW_CONTRACT`** (principle ids + required metadata keys + path to the principles doc).
- Embeds **`aiReviewContract`** on the manifest and **each batch JSON** so Cursor agent prompts are self-contained.
- **`normalizeAiFinding`** preserves and normalizes:
  - `candidateDeterministicRule`, `principleId`, `hashesOrContractsAffected`, `screenshotOrDomEvidence`,
  - `deterministicCoverage` (`covered` | `partially-covered` | `not-covered`),
  - numeric **`confidence`** (legacy `high|medium|low` still accepted and mapped).
- **`aggregateAiAuditResults`** markdown lists principle, coverage, candidate rule, hashes/contracts, and screenshot/DOM evidence.

### `tools/website-ux-auditor/build-ai-audit-batches.mjs` / `aggregate-ai-audit-results.mjs`

- Usage text notes the emitted **`aiReviewContract`** and preserved finding fields (documentation only).

### `tools/website-ux-auditor/cursor-agent-run-ux-audit.sh`

- Prompt instructs the agent to read **`aiReviewContract`** from the batch file, map findings to canonical **`principleId`** values, and **prefer deterministic rule promotion** (`candidateDeterministicRule`) for repeatable patterns.
- Returned finding schema uses **`confidence`** as a number and includes all required metadata fields.

## Tests / verification commands

```bash
cd tools/website-ux-auditor && npm test
```

## Evidence — phase 04

**Completed:** 2026-05-19.

**Checks run:**

- `cd /home/lzvyahin/Code/forgesdlc-kitchensink/tools/website-ux-auditor && npm test` → **99/99 pass** (including extended `auditor-tests/ai-audit-batches.test.js` assertions on `candidateDeterministicRule` and numeric confidence).

**Files touched (this phase):**

- `docs/design/ux-audit/ai-enabled-design-principles.md`
- `tools/website-ux-auditor/lib/ai-audit-batches.js`
- `tools/website-ux-auditor/build-ai-audit-batches.mjs`
- `tools/website-ux-auditor/aggregate-ai-audit-results.mjs`
- `tools/website-ux-auditor/cursor-agent-run-ux-audit.sh`
- `tools/website-ux-auditor/auditor-tests/ai-audit-batches.test.js`

**Acceptance:**

- AI batch tests pass; aggregator preserves **`candidateDeterministicRule`** and related fields in `ai-audit-data.json` / report markdown.
- Prompts steer agents toward **deterministic promotion** for repeatable issues.

---

*Next step:* Phase **05** — contract specificity and visual analysis (`05-contract-specificity-and-visual-analysis.md`).
