---
rule_id: DET.KS.PRIMITIVE_VERSION_MATCH
lane: deterministic
title: Primitive version alignment
summary: Runtime data-ks-primitive-version matches registry/contract primitive_version when either is present.
page_version: d62aa3874ad23258093eb86857f84022eb29a00430830ee1d05102f79d3d46e8
generated_at: 2026-05-28T20:30:00.000Z
agent_model: composer-2.5-fast
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-ks-primitive-version-match
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
---

## Purpose

When a react-primitive root or registry row declares a **primitive version**, the DOM attribute `data-ks-primitive-version` must match `primitive_version` in `visual-registry.yaml` or the contract **Primitive version** line. **Scope:** `rulesScope` `ks` / `auto`; generic sites skip with `skipped_scope`.

## Passing signals

- `data-ks-primitive-version` equals catalog version for each governed hash, or neither side declares a version.
- `DET.KS.PRIMITIVE_VERSION_MATCH` returns no findings.

## Failing signals

- **version-mismatch:** DOM `v2` vs registry `v1` on hash `Fsb`.
- **missing-runtime-version:** registry declares version; DOM omits attribute.

## Before example

```html
<div data-ks-hash="Fsb" data-ks-type="react-primitive" data-ks-name="forge-status-banner"></div>
```

## After example

```html
<div
  hash="Fsb"
  data-ks-hash="Fsb"
  data-ks-type="react-primitive"
  data-ks-name="forge-status-banner"
  data-ks-primitive-version="v1"
></div>
```

## Deterministic checks

- `DET.KS.PRIMITIVE_VERSION_MATCH` — `det-ks-primitive-version-match.check.js` crosswalks DOM and `visual-registry.generated.json`.

## Remediation

Set `primitive_version` in the registry and contract, then emit matching `data-ks-primitive-version` from `ksReactPrimitiveAttrs` or the consumer mount.
