---
rule_id: DET.STUDIO.H1
lane: deterministic
title: Studio visible H1
summary: Workspace exposes a non-empty h1 so page identity and rail match checks can run.
page_version: studio-h1-v1
generated_at: 2026-08-13T00:00:00.000Z
registry_status: documented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-studio-h1
related_rules:
  - DET.STUDIO.TITLE_NAV_MATCH
  - DET.LANDMARKS.REQUIRED
---

## Purpose

Every Studio workspace route must expose exactly one visible **`h1`** in `main` (or the Cap header slot). Missing H1 breaks `page_identity` scoring, screen-reader outline, and `DET.STUDIO.TITLE_NAV_MATCH`.

## Passing signals

- One `h1` with non-empty text inside `main.fc-main` or `.fc-page-header`.
- Visually hidden `h1` is allowed only when a visible labelled equivalent exists (prefer visible H1 for operators).

## Failing signals

- No `h1`; only `h2` or rail label carries the page name.
- Empty `h1` or icon-only header.

## Before example

```html
<main class="fc-main">
  <div class="fc-page-header">
    <p class="fc-eyebrow">Operations</p>
    <h2>Facts</h2>
  </div>
</main>
```

## After example

```html
<main class="fc-main" data-testid="facts-workspace">
  <header class="fc-page-header">
    <h1>Facts</h1>
    <p class="text-muted">Inspect normalized financial facts for the selected issuer.</p>
  </header>
</main>
```

## Evidence and remediation

- `tools/studio-ux-pdca/score-page.mjs` — major finding when `h1` missing.

## Related rules

- `DET.STUDIO.TITLE_NAV_MATCH`
- `DET.LANDMARKS.REQUIRED`
