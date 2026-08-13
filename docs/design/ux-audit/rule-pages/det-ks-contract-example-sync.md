---
rule_id: DET.KS.CONTRACT_EXAMPLE_SYNC
lane: deterministic
title: Contract and example sync
summary: Rule-page examples, defect fixtures, and contract verification snippets stay aligned per governed hash and rule id.
page_version: b9512b7a85f0a1b14677a75f9e2986a972dd73c53dc36bd81a10408fbbb58545
generated_at: 2026-05-28T20:30:00.000Z
agent_model: composer-2.5-fast
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-ks-contract-example-sync
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
---

## Purpose

Repo scan of `docs/design/ux-audit/rule-pages/det-*.md` ensures **## Deterministic checks** cites the page `rule_id`, and the primary Before-example hash appears in remediation or checks sections—not only inside the failing snippet. **Scope:** KS repos; runs without a browser.

## Passing signals

- Every DET rule page lists its `rule_id` under **Deterministic checks**.
- Governed hashes in Before examples are referenced elsewhere on the page.

## Failing signals

- **rule-id-missing-in-deterministic-checks**
- **hash-not-referenced-outside-before**

## Before example

```html
<div data-ks-hash="Hbk" data-ks-type="layout"></div>
```

## After example

```html
<div hash="Hbk" data-ks-hash="Hbk" data-ks-type="layout" data-ks-name="layout-handbook"></div>
```

## Deterministic checks

- `DET.KS.CONTRACT_EXAMPLE_SYNC` — `det-ks-contract-example-sync.check.js` scans rule pages under `docs/design/ux-audit/rule-pages/`.

## Remediation

Update rule page, `generator/build_rule_defect_fixtures.py` output, and contract **Deterministic checks** in one change set.
