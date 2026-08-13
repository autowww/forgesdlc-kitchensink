---
rule_id: DET.SCREENSHOT.STATUS
lane: deterministic
title: Screenshot Status
summary: Harness bootstrap handbook page for DET.SCREENSHOT.STATUS.
page_version: d10b8604068a062f294dc08e28894664b070ea1fcb2f5b9384952be893f6ff45
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-screenshot-status
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-screenshot-status.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.SCREENSHOT.STATUS` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4"><p class="forge-support">Registry screenshot_status mismatch (repo overlay).</p></main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4"><p class="forge-support">Screenshot status aligned with catalog.</p></main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.SCREENSHOT.STATUS`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
