# 05 — Generate design contracts

## Goal

For each registry row with `contract_status: own`, add Markdown contract at `contract` path. For `family-covered`, family file lists covered child hashes.

## Expected changes

- Contracts under `docs/design/catalog/{layouts,pages,components,...}/`
- Family contracts for bundled CSS/JS/SVG where appropriate

## Each contract includes

Purpose, expected look, anatomy, content rules, states, variants, responsive, a11y, enterprise rules, forbidden patterns, sources, dependencies, showcase + screenshot, acceptance checklist, change rules, changelog.

## Validation

`check-visual-catalog.mjs` verifies files exist for `own` rows and family coverage lists.

## Stop condition

No active row lacks contract path or family coverage.

## Risks

Contract staleness; tie to registry `last_reviewed`.
