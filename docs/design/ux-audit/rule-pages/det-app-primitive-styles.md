---
rule_id: DET.APP.PRIMITIVE_STYLES
lane: deterministic
title: App primitive styles
summary: React primitive mounts load forge-react-primitives / ks-fe styling.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primitive_styles
registry_status: implemented
page_version: 99ba11a044f8f4918ff5cceac079d45debc47bf555721a35512bf719913a562e
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-05-28T17:05:34.733Z
---

## Purpose

When `data-ks-react-root` is present, the page must link `forge-react-primitives.css` and roots should carry `ks-fe-*` classes.

## Before example

```html
<head>
  <link rel="stylesheet" href="/css/forge-theme.css">
</head>
<main id="main">
<div data-ks-react-root="true" data-ks-type="react-primitive" data-ks-hash="Fsb" data-ks-name="forge-status-banner">
  <span>Status</span>
</div>
</main>
```

## After example

```html
<head>
  <link rel="stylesheet" href="/css/forge-theme.css">
  <link rel="stylesheet" href="/css/forge-react-primitives.css">
</head>
<main id="main">
<div class="ks-fe-status-banner" data-ks-react-root="true" data-ks-type="react-primitive" data-ks-hash="Fsb" data-ks-name="forge-status-banner">
  <span>Status</span>
</div>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.PRIMITIVE_STYLES`.
