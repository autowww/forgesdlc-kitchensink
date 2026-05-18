# 08 — Auditor, scorer, remediation awareness

## Goal

Lightweight catalog reporting using shared low-level parser; hash-addressable remediation references.

## Architecture

- Parser in `tools/design-catalog/lib/`; thin `tools/website-ux-auditor/lib/visual-catalog.js` re-export **or** equivalent without circular imports.
- `analyze-website-ux.mjs` **must not** call `score-website-ux.mjs` and vice versa.

## Auditor

Collect hashes from DOM; unknown/ deprecated / missing contract signals; cite contract paths when finding sits inside known hash boundary.

## Scorer

Add visual-catalog governance dimension/gate; do not over-penalize `planned` screenshots.

## Remediation plans

Include hash, type, name, contract path when applicable.

## Validation

Existing `auditor-tests/*.test.js` pass.

## Stop condition

No regression in default audit/score behavior when catalog absent.
