---
rule_id: DET.APP.PRIMITIVE_STYLES
lane: deterministic
title: App primitive styles
summary: React primitive mounts load forge-react-primitives / ks-fe styling.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primitive_styles
registry_status: implemented
page_version: c46becf0f3421283779fd56cbf19e9b3e06aa05ebe4bc0961df91e7d5e36b73f
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
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
