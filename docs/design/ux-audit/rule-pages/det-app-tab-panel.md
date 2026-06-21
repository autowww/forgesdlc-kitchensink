---
rule_id: DET.APP.TAB_PANEL
lane: deterministic
title: App tab panel
summary: Selected tabs expose aria-selected, aria-controls, and a visible panel.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-tab-panel
registry_status: implemented
page_version: cd5988e61d5012d6ced7da339f98c242cc686c3999672533de58bde548de4a3e
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
generated_at: 2026-05-28T17:05:34.738Z
---

## Purpose

Tab interfaces in operator UIs must wire WAI-ARIA tab semantics.

## Before example

```html
<main id="main">
<div role="tablist" aria-label="Run views">
  <button role="tab" id="tab-summary">Summary</button>
  <button role="tab" id="tab-findings">Findings</button>
</div>
<div id="panel-summary" role="tabpanel" hidden>Summary body</div>
<div id="panel-findings" role="tabpanel">Findings body</div>
</main>
```

## After example

```html
<main id="main">
<div role="tablist" aria-label="Run views">
  <button role="tab" id="tab-summary" aria-selected="true" aria-controls="panel-summary">Summary</button>
  <button role="tab" id="tab-findings" aria-selected="false" aria-controls="panel-findings">Findings</button>
</div>
<div id="panel-summary" role="tabpanel">Summary body</div>
<div id="panel-findings" role="tabpanel" hidden>Findings body</div>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.TAB_PANEL`.
