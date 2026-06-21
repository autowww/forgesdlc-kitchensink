---
rule_id: DET.APP.SHELL_INTEGRATION
lane: deterministic
title: App shell integration
summary: No Bootstrap alert/badge metaphors beside governed react-primitive roots.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-shell_integration
registry_status: implemented
page_version: 6dd4b00f88ac436ec18a428e36d29cdb99c488cfb214472e05ceacaacc05d8d7
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
generated_at: 2026-05-28T17:05:34.736Z
---

## Purpose

Inside app workspace shells, flag Bootstrap `alert` / `badge` patterns adjacent to governed react-primitive roots.

## Before example

```html
<main id="main" class="studio-page" data-studio-workspace="run">
<div class="alert alert-danger" role="alert">Failed step</div>
<div class="ks-fe-status-banner" data-ks-react-root="true" data-ks-type="react-primitive" data-ks-hash="Fsb" data-ks-name="forge-status-banner">
  <span>Run status</span>
</div>
</main>
```

## After example

```html
<main id="main" class="studio-page" data-studio-workspace="run">
<div class="ks-fe-status-banner ks-fe-banner--failed" data-ks-react-root="true" data-ks-type="react-primitive" data-ks-hash="Fsb" data-ks-name="forge-status-banner" role="alert">
  <span>Failed step — run status</span>
</div>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.SHELL_INTEGRATION`.
