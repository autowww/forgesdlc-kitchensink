---
rule_id: DET.KS.HASH_SEMANTIC_UNIQUENESS
lane: deterministic
title: Hash semantic uniqueness
summary: A KS hash is not reused for unrelated data-ks-type and data-ks-name anatomy on the same page or build output.
page_version: 141d92a7f3895fec59de94986650adff42ba0b75bf3984386ac117a38d0d7395
generated_at: 2026-05-28T20:30:00.000Z
agent_model: composer-2.5-fast
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-ks-hash-semantic-uniqueness
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
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
