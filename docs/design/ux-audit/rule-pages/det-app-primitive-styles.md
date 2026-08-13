---
rule_id: DET.APP.PRIMITIVE_STYLES
lane: deterministic
title: App primitive styles
summary: React primitive mounts load forge-react-primitives / ks-fe styling.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primitive_styles
registry_status: implemented
page_version: 76c7acb31ee30d7f4ebfab54c47113e0645f4fc2fbb72d9aac357b46fd29c066
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
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
