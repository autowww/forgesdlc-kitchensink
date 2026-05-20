# Rule page Markdown schema

Path: `docs/design/ux-audit/rule-pages/<rule-id-kebab>.md`

## Front matter (required)

```yaml
---
rule_id: DET.NAV.DEDUP
lane: deterministic
title: Navigation deduplication
summary: One-line description for the handbook index.
page_version: <hex sha256 from pagegen / rule-page-version.mjs>
generated_at: 2026-05-19T12:00:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: <registry.generated.json fingerprint>
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-nav-dedup
related_rules:
  - DET.NAV.DEPTH
  - AI.NARRATIVE.COHERENCE
---
```

## Body sections (required headings)

Use these exact `##` headings (case-insensitive match):

1. `## Purpose`
2. `## Passing signals`
3. `## Failing signals`
4. `## Before example` — include a fenced `html` block with KS markup that **fails** the rule
5. `## After example` — include a fenced `html` block with KS markup that **passes**
6. `## Evidence and remediation`
7. `## Related rules`

## Example HTML blocks

```html
<div class="forge-card p-3">
  <p class="forge-support mb-0">Example markup using Kitchen Sink classes.</p>
</div>
```

Do **not** use Mermaid. Use real KS classes from `css/` and `components/`.
