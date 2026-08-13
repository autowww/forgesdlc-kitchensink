---
rule_id: DET.KS.VISUAL_FAMILY_COVERAGE
lane: deterministic
title: Visual family coverage
summary: Consumer-bound components, react primitives, and SVG assets have registry rows and contracts where policy requires.
page_version: 372fb6ccde94dcae83a6f9aa45f05d1e4c4816ab65d2929fa23dcc5a2b0c7c43
generated_at: 2026-05-28T20:30:00.000Z
agent_model: composer-2.5-fast
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-ks-visual-family-coverage
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
---

## Purpose

Registry rows that **emit HTML** to consumers (`emits_html`, `react-primitive`, `components/`, `react/`, `assets/svg/`) must have `contract_status: own` with an on-disk contract, or `family-covered` with a justified family contract. **Scope:** KS repos; repo scan only.

## Passing signals

- `node tools/design-catalog/check-visual-catalog.mjs` passes contract path coverage.
- `DET.KS.VISUAL_FAMILY_COVERAGE` reports zero violations.

## Failing signals

- **missing-contract-path** — consumer-bound hash without contract.
- **contract-file-missing** — `contract:` path not found on disk.

## Before example

Registry row without contract:

```yaml
hash: Zzz
type: component
emits_html: true
contract_status: missing
```

## After example

```yaml
hash: Zzz
type: component
emits_html: true
contract_status: own
contract: docs/design/catalog/components/Zzz-example.md
```

## Deterministic checks

- `DET.KS.VISUAL_FAMILY_COVERAGE` — `det-ks-visual-family-coverage.check.js`.
- `DET.CONTRACT.PATH` — companion path existence gate.

## Remediation

Add `{HASH}-*.md` under `docs/design/catalog/` or mark `family-covered` with a valid family contract file.
