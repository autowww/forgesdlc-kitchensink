---
rule_id: DET.SPATIAL.HASH_ROOT
lane: deterministic
title: Spatial effect hash roots
summary: Spatial showcase demos (Flp, Hol, Tlz, …) must emit paired hash and data-ks-hash markers on their root element.
page_version: 1b3aaed0d0d901d9774e3c470547859eec0dc5b9103ccc2b216fd2fe3d3a1509
generated_at: 2026-07-22T00:00:00.000Z
agent_model: ks-spatial-pdca
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-spatial-hash_root
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
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
