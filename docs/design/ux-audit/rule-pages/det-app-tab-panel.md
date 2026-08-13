---
rule_id: DET.APP.TAB_PANEL
lane: deterministic
title: App tab panel
summary: Selected tabs expose aria-selected, aria-controls, and a visible panel.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-tab-panel
registry_status: implemented
page_version: b2b1b6cdf3d830b2d74a2ec8e30d27cd80f3a5d9a28a6a1391274fbdcaa88177
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
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
