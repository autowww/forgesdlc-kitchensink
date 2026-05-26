# A11Y rule page Markdown schema

Path: `docs/design/a11y-audit/rule-pages/<rule-id-kebab>.md`

Filename **must** contain `-generic-` or `-ks-` matching registry `scope`.

## Front matter (required)

```yaml
---
rule_id: DET.A11Y.GENERIC.LANG
lane: deterministic
scope: generic
title: Document language
summary: Root html element must declare lang for assistive tech.
page_version: <hex sha256>
generated_at: 2026-05-26T12:00:00.000Z
registry_fingerprint: <registry.generated.json fingerprint>
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-lang
related_rules:
  - DET.A11Y.GENERIC.TITLE
---
```

## Body sections (required headings)

1. `## Purpose`
2. `## Passing signals`
3. `## Failing signals`
4. `## Before example` — fenced `html` that **fails** the rule
5. `## After example` — fenced `html` that **passes**
6. `## Evidence and remediation`
7. `## Related rules`

Do **not** use Mermaid. Prefer Kitchen Sink classes when illustrating KS handbook chrome.
