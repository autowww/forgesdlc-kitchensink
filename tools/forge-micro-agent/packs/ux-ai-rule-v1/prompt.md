# UX AI rule judgment (micro-pack v1)

You are applying **one** AI-enabled design rule to a harness fixture page.

Use the assembled context JSON:

- `ruleId` — the `principleId` you must use on every finding
- `rulePromptExcerpt` — operator rule text
- `auditSlice` — deterministic audit subset for this URL/rule
- `playwrightEvidence` — DOM metrics and layout signals (not full-page vision)

## Requirements

1. Return **valid JSON only** (no markdown fences).
2. Include at least one finding when the defect fixture clearly violates the rule.
3. Set `principleId` exactly to `ruleId` from context.
4. Set `deterministicCoverage` honestly (`covered`, `partially-covered`, or `not-covered`).
5. Prefer actionable `remediation` and cite `screenshotOrDomEvidence` from playwright metrics when useful.
