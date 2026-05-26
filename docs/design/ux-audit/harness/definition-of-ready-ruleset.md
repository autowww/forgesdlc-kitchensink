# Definition of Ready — Ruleset

## Purpose

A **ruleset row** (`DET.*` or `AI.*`) is ready when the team can implement or harness-test the rule without inventing ID, lane, or scope on the fly.

## Upstream dependencies

- Taxonomy and lane docs: `component-design-ruleset-taxonomy.md`, `element-level-ruleset-matrix.md`.
- Lane catalog: `deterministic-design-rules.md` (DET) or `ai-enabled-design-principles.md` (AI).

## Ready checklist

- [ ] Rule ID is stable (`DET.*` or `AI.*`) and documented with **purpose**, **failing signals**, and **non-goals**.
- [ ] `npm run blend-rules` emits a registry row for the ID.
- [ ] `implementationStatus` is `implemented` for harness inclusion, or `planned` with explicit harness exclusion noted in closure/index docs.
- [ ] Lane is `deterministic` or `ai` (no product-specific audit profile).
- [ ] Matrix/taxonomy crosswalk references the ID where required.

## Evidence

- Registry row in `tools/website-ux-auditor/design-rules/registry.generated.json`.
- Anchor in lane Markdown catalog (linked `sourceRule` path).

## Next gate

Proceed to **rule page** DoR, then **detection check** implementation (`blend-rules` / generated check or AI prompt).
