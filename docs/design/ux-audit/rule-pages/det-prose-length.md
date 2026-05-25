---
rule_id: DET.PROSE.LENGTH
lane: deterministic
title: Prose Length
summary: Harness bootstrap handbook page for DET.PROSE.LENGTH.
page_version: 7cb660d59d54b5098fd4e611214e94d48eedf661f023f61ee77a0d8e3ecc1bac
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-prose-length
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-prose-length.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.PROSE.LENGTH` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<p class="forge-support">Governed delivery requires clarity across stakeholders and agents. Governed delivery requires clarity across stakeholders and agents. Governed delivery requires clarity across stakeholders and agents. Governed delivery requires clarity across stakeholders and agents. Governed delivery requires clarity across stakeholders and agents. Governed delivery requires clarity across stakeholders and agents. Governed delivery requires clarity across stakeholders and agents. Governed delivery requires clarity across stakeholders and agents. Governed delivery requires clarity across stakeholders and agents. Governed delivery requires clarity across stakeholders and agents. Governed delivery requires clarity across stakeholders and agents. Governed delivery requires clarity across stakeholders and agents. </p>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4"><p class="forge-support">Short paragraph within the word cap.</p></main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.PROSE.LENGTH`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
