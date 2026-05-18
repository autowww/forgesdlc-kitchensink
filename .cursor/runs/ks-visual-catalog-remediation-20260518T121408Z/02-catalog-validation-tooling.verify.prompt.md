Verify this remediation phase without editing files.

Start your response with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide evidence, missing work, and exact next actions.

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

--- EXECUTION LOG START ---
## Summary

### `check-visual-catalog.mjs`
- Validates **hash format**, **duplicates**, **repeated letters** (unless `hash_exception_reason`), **missing sources/contracts**, **`family-covered`** (needs **`parent_hash` → existing row** or **`FAM-*` contract basename**), **`parent_hash` targets**, **screenshot** rules (`planned` / `missing` need `screenshot_url`, `notes`, or `screenshot_reason`; `captured` needs URL; unknown status errors), and **contract placeholders** via `lib/contract-placeholders.mjs` (hard fails for lorem / example markers; **TBD/TODO/FIXME** = one summary warning unless `--strict-contract-placeholders` or `--verbose-contract-placeholders`).
- **Registry ↔ inventory**: non–family rows must match inventory (layouts, pages, layout-previews, chrome-regions, react-primitives, desktop-interface, library-consumer); family rows (Ksc-style) stay exempt.
- **Flags**: `--refresh-inventory`, `--strict-contract-placeholders`, `--verbose-contract-placeholders`, `--allow-minimal-showcase` (for the tiny bad fixture only).
- **Artifacts**: writes **`visual-registry.generated.json`** with `generatedAt`, and **`visual-registry-coverage.md`** with timestamp, counts, inventory snapshot, and alignment line.

### `inventory-ks-visuals.mjs`
- Adds **`chrome-region`** items by parsing **`chrome_region_attrs("…")`** and **`_chrome_space("…")`** in `components/layouts.py` and `components/components.py` (fixes missing **doc-sidebar**, **doc-offcanvas**, **product-primary-nav** in inventory).

### Fixture & CI
- **`tools/design-catalog/fixtures/bad-visual-catalog/`** + **`verify-bad-fixture.sh`** (expects exit **1** with invalid/duplicate/repeat/missing contract/source/family-covered/placeholder/deprecated errors).
- **`.github/workflows/ci.yml`** runs `verify-bad-fixture.sh` after the main catalog check.

### Other scripts
- **`parse-registry.mjs`**: `screenshot_reason` in generated JSON.
- **`changed-visual-contracts.mjs`**: prints suggested inventory + check commands.
- **`capture-showcase-screenshots.mjs`**: clarifies local server / loopback use (still optional tooling).
- **`allocate-visual-hash.mjs`**: notes that **`check-visual-catalog`** enforces format/uniqueness.

### Docs & evidence
- **`docs/design/catalog/README.md`**: commands, flags, screenshot metadata, fixture link.
- **`.cursor/plans/ks-visual-catalog-remediation/02-catalog-validation-tooling.md`**: commands and sample outputs.

### Acceptance
- Full run: **`check-visual-catalog OK (64 entries)`** with one expected stub warning (**47** contract files with TBD-style bullets).
- **Regenerated** `visual-inventory.generated.json`, `visual-registry.generated.json`, and `visual-registry-coverage.md` with **current** counts (e.g. **356** inventory items, **6** chrome-region).

**Deferred (as documented):** screenshot capture remains optional automation (`capture-showcase-screenshots.mjs`); catalog validation stays offline and does not call it.
--- EXECUTION LOG END ---
