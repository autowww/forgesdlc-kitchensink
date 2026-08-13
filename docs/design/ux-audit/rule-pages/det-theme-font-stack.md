---
rule_id: DET.THEME.FONT_STACK
lane: deterministic
title: Theme Font Stack
summary: Harness bootstrap handbook page for DET.THEME.FONT_STACK.
page_version: 98a09642577c12bdb7970e39495209846242f7cbfe29c251149f3cc71b744a95
generated_at: 2026-05-25T13:41:26Z
agent_model: handbook-version-sync
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-theme-font_stack
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-theme-font-stack.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.THEME.FONT_STACK` on the defect fixture.

## Before example

```html
<!DOCTYPE html>
<html lang="en" data-forge-theme="forge">
<head>
  <meta charset="utf-8">
  <title>Font stack drift</title>
  <style>
    .drift-title { font-family: "Comic Sans MS", cursive; }
    .drift-body { font-family: Georgia, serif; }
  </style>
</head>
<body>
<main id="main" class="doc-main px-4 py-4">
  <h1 class="drift-title font-display mb-2">Wrong display stack</h1>
  <p class="drift-body forge-support mb-0">Body uses non-token font-family.</p>
</main>
</body>
</html>
```

## After example

```html
<!DOCTYPE html>
<html lang="en" data-forge-theme="forge">
<head>
  <meta charset="utf-8">
  <title>Approved font stacks</title>
  <link rel="stylesheet" href="/assets/forge-theme.css">
</head>
<body>
<main id="main" class="doc-main px-4 py-4">
  <h1 class="font-display mb-2">Display uses Forge stack</h1>
  <p class="forge-support mb-0">Body and labels use theme token stacks only.</p>
</main>
</body>
</html>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.THEME.FONT_STACK`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
