# Definition of Done — Rule page (handbook)

## Purpose

The handbook page is done when it is version-stable, buildable into fixtures, and published to showcase when required.

## Acceptance criteria

- [ ] `npm run pagegen:manifest` reports `current` for the rule, or `stale` with a scheduled pagegen refresh documented in closure notes.
- [ ] Fixture builder produces fail HTML from Before without manual edits.
- [ ] `python3 generator/build-showcase.py` includes the rule in showcase when policy requires handbook HTML output.
- [ ] `agent_model` reflects pagegen (not long-term `bootstrap-missing-rule-pages.py` only) unless bootstrap is explicitly accepted for the release.

## Verification

```bash
cd tools/website-ux-auditor
npm run pagegen:manifest
cd ../..
python3 generator/build_rule_defect_fixtures.py --only-rule DET.EXAMPLE --out-dir /tmp/fixture-test
```

## Known exclusions

- Manifest **stale** with passing harness campaigns is acceptable short-term; track `handbook_quality` in [E2E-COVERAGE-MATRIX.md](E2E-COVERAGE-MATRIX.md).
- Bootstrap pages may pass remediation verify before pagegen upgrade.
