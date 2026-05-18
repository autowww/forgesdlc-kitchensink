# 03 — Build registry and allocate hashes

## Goal

Turn `visual-inventory.generated.json` into canonical `visual-registry.yaml` with stable 3-letter distinct hashes (exceptions documented).

## Expected changes

- `docs/design/catalog/visual-registry.yaml`
- `docs/design/catalog/visual-registry.generated.json` (normalized export)
- `docs/design/catalog/visual-registry-coverage.md`

## Registry fields (kit)

`hash`, `name`, `slug`, `type`, `family`, `status`, `source_paths`, `source_symbols`, `root_selector`, `contract`, `contract_status` (`own` | `family-covered` | `missing`), showcase/screenshot fields, `aliases`, `parent_hash`, `child_hashes`, `design_standard_refs`, notes, `hash_exception_reason` when letters not distinct.

## Coverage rule

Every inventory item has a decision: own row, family-covered, intentionally excluded (reason), or deprecated/removed.

## Validation

`node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml`

## Stop condition

No duplicate/invalid hashes; no silent inventory drops.

## Risks

Hash space; use `allocate-visual-hash.mjs` for suggestions.
