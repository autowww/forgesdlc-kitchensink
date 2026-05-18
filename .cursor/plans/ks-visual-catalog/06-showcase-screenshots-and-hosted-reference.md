# 06 — Showcase screenshots and hosted reference

## Goal

Playwright capture by `[hash="XYZ"], [data-ks-hash="XYZ"]`; document `https://ks.forgesdlc.com/showcase/screenshots/XYZ.png`.

## Expected changes

- `tools/design-catalog/capture-showcase-screenshots.mjs`
- Registry `screenshot_status: planned|captured|...`
- README instructions for local capture

## Acceptance

Phase 1 allows `planned`; script works for a sample subset.

## Risks

Headless diffs; optional mobile/dark captures later.
