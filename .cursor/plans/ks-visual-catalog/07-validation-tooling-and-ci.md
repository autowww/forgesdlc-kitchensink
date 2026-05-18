# 07 — Validation tooling and CI

## Goal

Standalone design-catalog CLIs (never call auditor/scorer entrypoints); CI gate.

## Tools

- `inventory-ks-visuals.mjs`, `allocate-visual-hash.mjs`, `check-visual-catalog.mjs`, `capture-showcase-screenshots.mjs`, `changed-visual-contracts.mjs`

## CI commands (kit)

```bash
python3 generator/build-showcase.py
node tools/design-catalog/inventory-ks-visuals.mjs --repo . --out docs/design/catalog/visual-inventory.generated.json
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml
cd tools/website-ux-auditor && node --test auditor-tests/*.test.js
```

Plus `pytest forge-autodoc/tests -q` in same pipeline/job.

## Stop condition

Check fails on duplicates, invalid hashes, missing contracts/sources, unregistered inventory symbols (per policy), missing HTML markers for required rows, deprecated emission without alias.

## Risks

Flaky HTML scan paths; pin showcase output dir.
