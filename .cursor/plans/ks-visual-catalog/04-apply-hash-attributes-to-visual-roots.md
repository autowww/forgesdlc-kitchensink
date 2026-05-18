# 04 — Apply hash attributes to visual roots

## Goal

Implement `ks_hash_attrs` (Python) and `ksVisualAttrs` (React); stamp layout shells and showcase surfaces per registry.

## Required attributes

`hash="XYZ" data-ks-hash="XYZ"` plus `data-ks-type` and `data-ks-name` where practical.

## Files to inspect

- `components/layouts.py`, `components/*.py`, `generator/pages/*.py`, `generator/layout_previews.py`
- `react/*.tsx`, `museum/studio/index.html` (where practical)

## Rules

- Layout hash on dominant layout wrapper; page hash on `<main>` (or equivalent) when both apply—**different nodes**.
- Component type hash repeats per instance type, not per instance id.
- No duplicate roots for same contract without registry approval.

## Validation

Rebuild showcase; grep or `check-visual-catalog` HTML mode for required markers.

## Stop condition

Generated showcase HTML includes markers for all `emit_marker_in_showcase: true` rows.

## Rollback

Remove attrs string concat only; no visual redesign.
