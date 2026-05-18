Read the focused remediation phase below and create a precise implementation plan. Do not edit files in this step. Save or summarize the plan under .cursor/plans/ks-visual-catalog-remediation/ when possible. Include exact files to inspect, files likely to change, validation commands, risks, and rollback notes.

--- PHASE PROMPT START ---
# 02 - Harden visual catalog validation tooling

## Purpose

Make `tools/design-catalog` a reliable source-of-truth validator for the hash catalog.

## Required implementation

Inspect the existing `tools/design-catalog` scripts and strengthen or add:

```text
tools/design-catalog/allocate-visual-hash.mjs
tools/design-catalog/inventory-ks-visuals.mjs
tools/design-catalog/check-visual-catalog.mjs
tools/design-catalog/capture-showcase-screenshots.mjs
tools/design-catalog/changed-visual-contracts.mjs
```

It is acceptable if one optional script is deferred, but the final report must explain why.

## Validation rules required

`check-visual-catalog.mjs` must detect:

- invalid hash format
- duplicate hashes
- repeated letters inside one hash unless explicitly waived
- registry rows with missing source files
- missing contract files
- contract files containing placeholder language
- registry rows with `contract_status: family-covered` but no parent/family contract
- missing emitted hash markers for generated pages/layouts/components that the repo can build locally
- deprecated hashes still emitted without an allowed alias
- new visual files/functions not represented in the registry
- registry rows not found in the source-derived inventory
- screenshot status without required metadata or reason

## Generated artifacts

Regenerate or create:

```text
docs/design/catalog/visual-inventory.generated.json
docs/design/catalog/visual-registry.generated.json
docs/design/catalog/visual-registry-coverage.md
```

These generated files should include enough detail for humans and agents to see current coverage and gaps.

## Acceptance criteria

- The catalog checker exits non-zero when a fixture or known bad sample has an invalid hash, duplicate hash, missing contract, or placeholder contract text.
- The checker can run from repo root with a documented command.
- The generated coverage report uses current counts and does not contain stale numbers.
- The checker produces actionable messages that name the hash, type, source path, and contract path where possible.
- `.cursor/plans/ks-visual-catalog-remediation/02-catalog-validation-tooling.md` records commands and outputs.

## Do not

- Do not make validation depend on network access.
- Do not silently pass missing screenshots unless the registry marks them `not-applicable` or `planned` with a reason.
--- PHASE PROMPT END ---
