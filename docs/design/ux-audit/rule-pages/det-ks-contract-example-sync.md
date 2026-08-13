---
rule_id: DET.KS.CONTRACT_EXAMPLE_SYNC
lane: deterministic
title: Contract and example sync
summary: Rule-page examples, defect fixtures, and contract verification snippets stay aligned per governed hash and rule id.
page_version: 373d976454d3f1c1135c7b115042a2d202e7b7f5c38b61ec8fe7b3d4ac2adb42
generated_at: 2026-05-28T20:30:00.000Z
agent_model: composer-2.5-fast
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-ks-contract-example-sync
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
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
