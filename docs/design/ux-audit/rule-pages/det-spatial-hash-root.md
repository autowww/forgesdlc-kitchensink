---
rule_id: DET.SPATIAL.HASH_ROOT
lane: deterministic
title: Spatial effect hash roots
summary: Spatial showcase demos (Flp, Hol, Tlz, …) must emit paired hash and data-ks-hash markers on their root element.
page_version: 5f762406a8ab70023eb84c68980b7f70b93359cca91c5d096c32392f5ed6a461
generated_at: 2026-07-22T00:00:00.000Z
agent_model: ks-spatial-pdca
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-spatial-hash_root
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
---

## Purpose

Kitchen Sink spatial primitives on `spatial-effects.html` are governed by three-letter hashes. This rule ensures each spatial hash present on a crawled page has complete marker pairing.

## Passing signals

- `[data-ks-hash="Flp"]` (and siblings) appear with matching `hash="Flp"` on the same root.
- `data-ks-type` and `data-ks-name` present when emitted via `ks_hash_attrs`.

## Failing signals

- Spatial hash in DOM without paired attribute.
- Incomplete marker rows in `ksVisualHashReport`.

## Deterministic checks

Run `tools/spatial-effects-verifier/run-all-oracles.mjs` after `build-showcase.py` for behavior parity; this rule covers marker pairing only.
