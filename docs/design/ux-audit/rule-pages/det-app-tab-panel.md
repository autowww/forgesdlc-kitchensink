---
rule_id: DET.APP.TAB_PANEL
lane: deterministic
title: App tab panel
summary: Selected tabs expose aria-selected, aria-controls, and a visible panel.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-tab-panel
registry_status: implemented
page_version: 60f6b6db233866f1684348e6d05161383624f404ad9821dbd8cecac7bbbee8b2
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
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
