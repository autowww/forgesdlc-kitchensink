---
rule_id: DET.PY.KS_HASH_ATTRS
lane: deterministic
title: Py Ks Hash Attrs
summary: Harness bootstrap handbook page for DET.PY.KS_HASH_ATTRS.
page_version: eb469ed4bed7e9d1f2929a2a0a01db1447f416e349992d6e61c6e277a98464a1
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-py-ks_hash_attrs
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-py-ks-hash-attrs.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.PY.KS_HASH_ATTRS` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4"><p class="forge-support">Python manual hash literal in repo overlay.</p></main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4"><p class="forge-support">Helpers used in generators.</p></main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.PY.KS_HASH_ATTRS`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
