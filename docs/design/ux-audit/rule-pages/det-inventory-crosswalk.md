---
rule_id: DET.INVENTORY.CROSSWALK
lane: deterministic
title: Inventory Crosswalk
summary: Harness bootstrap handbook page for DET.INVENTORY.CROSSWALK.
page_version: 30545bbdc5a818afcd63addb77644aa4024a7d1ac43f281ecc516df8a1946c6d
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-inventory-crosswalk
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-inventory-crosswalk.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.INVENTORY.CROSSWALK` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4"><p class="forge-support">Repo overlay carries unregistered showcase hash Zzz.</p></main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4"><p data-ks-hash="Hbk" hash="Hbk" class="forge-support">Registered hash markers.</p></main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.INVENTORY.CROSSWALK`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
