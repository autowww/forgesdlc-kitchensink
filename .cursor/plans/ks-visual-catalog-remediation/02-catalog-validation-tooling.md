# Phase 02 — Harden visual catalog validation tooling

## Scope completed

- **`check-visual-catalog.mjs`**: Expanded validation (hash format, duplicates, letter repeats, source/contract presence, `family-covered` parent or `FAM-*` contract, `parent_hash` targets, screenshot metadata for `planned`/`missing`/`captured`, egregious contract placeholders, registry rows vs inventory, showcase markers, deprecated+alias rule). Messages include hash, type, source path, and contract path when available.
- **`inventory-ks-visuals.mjs`**: Emits **`chrome-region`** rows by scanning `chrome_region_attrs("…")` and `_chrome_space("…")` in `components/layouts.py` and `components/components.py`.
- **`lib/contract-placeholders.mjs`**: Shared placeholder detection (errors for lorem/example patterns; stub bullets warn by default, strict mode optional).
- **`lib/parse-registry.mjs`**: JSON export includes optional `screenshot_reason`.
- **Synthetic fixture**: `tools/design-catalog/fixtures/bad-visual-catalog/` plus `tools/design-catalog/verify-bad-fixture.sh` (expects checker exit **1**).
- **Docs**: `docs/design/catalog/README.md` updated with flags and fixture verification.
- **Generated artifacts** (from a full run): `docs/design/catalog/visual-inventory.generated.json`, `docs/design/catalog/visual-registry.generated.json`, `visual-registry-coverage.md`.

## Deferred / optional

- **`capture-showcase-screenshots.mjs`**: Still optional operational tooling; requires local static hosting of `showcase/` and Playwright. Clarified in-file that checks do not depend on it; no network needed for YAML/HTML contract validation.

## Documented commands (repo root)

```bash
python3 generator/build-showcase.py
node tools/design-catalog/inventory-ks-visuals.mjs --repo . --out docs/design/catalog/visual-inventory.generated.json
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase
```

With inventory refresh inside the checker:

```bash
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase --refresh-inventory
```

Fixture self-test:

```bash
bash tools/design-catalog/verify-bad-fixture.sh
```

## Acceptance run outputs (captured 2026-05-18)

**Kitchen Sink (expected success, exit 0):**

- One summary warning: `47 contract file(s) still contain stub bullets (TBD/TODO/FIXME); …`
- `check-visual-catalog OK (64 entries). Wrote docs/design/catalog/visual-registry-coverage.md`
- Coverage excerpt: registry `64` entries; inventory `356` items; `chrome-region: 6`; alignment line “All non-family registry rows matched at least one inventory item.”

**Bad fixture (expected failure, exit 1):**

- Invalid hash `9ZZ`, duplicate `DUP`, repeated letters `QQA`, missing source `MSR`, missing contract `MCN`, bad `family-covered` `FCV`, lorem placeholder `PLH`, deprecated emitted `DEP` (representative messages; order may vary).

## Notes

- Validation uses only local disk (no network).
- `--strict-contract-placeholders` upgrades stub bullets to **errors** (current contracts still use many `TBD` stubs; default remains warn-once with count).
