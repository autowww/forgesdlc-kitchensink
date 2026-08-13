---
rule_id: DET.KS.HASH_SEMANTIC_UNIQUENESS
lane: deterministic
title: Hash semantic uniqueness
summary: A KS hash is not reused for unrelated data-ks-type and data-ks-name anatomy on the same page or build output.
page_version: 09a9534a9ea872d6602672b54effd6ccb25f6037030b33ec1f87d3d0c2e1e501
generated_at: 2026-05-28T20:30:00.000Z
agent_model: composer-2.5-fast
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-ks-hash-semantic-uniqueness
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
---

## Purpose

Three-letter hashes identify **one visual surface anatomy**. Reusing hash `Fsb` for both a react-primitive banner and an unrelated `section` is a semantic collision unless documented in the catalog. **Scope:** KS-driven sites only.

## Passing signals

- Each hash maps to one `(data-ks-type, data-ks-name)` pair per page/build.

## Failing signals

- **hash-semantic-collision** — hash `Fsb` on `react-primitive|forge-status-banner` and `section|unrelated-section`.

## Before example

```html
<div data-ks-hash="Fsb" data-ks-type="react-primitive" data-ks-name="forge-status-banner"></div>
<section data-ks-hash="Fsb" data-ks-type="section" data-ks-name="unrelated-section"></section>
```

## After example

```html
<div data-ks-hash="Fsb" data-ks-type="react-primitive" data-ks-name="forge-status-banner"></div>
<section data-ks-hash="Sec" data-ks-type="section" data-ks-name="unrelated-section"></section>
```

## Deterministic checks

- `DET.KS.HASH_SEMANTIC_UNIQUENESS` — `det-ks-hash-semantic-uniqueness.check.js`.

## Remediation

Allocate a new registry hash for the second surface or document intentional reuse in the family contract.
