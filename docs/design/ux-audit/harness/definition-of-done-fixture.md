# Definition of Done — Fixture

## Purpose

The fixture is done when it is the canonical defect input for detection (and optional agent) campaigns.

## Acceptance criteria

- [ ] Fail HTML is served from `website/` (paths match manifest).
- [ ] `invoke-det-ruleset-harness.sh` (or AI harness) records `detection_ok` using this fixture root.
- [ ] Shared campaign path documented when used for agent pilot: `FORGE_UX_RULESET_FIXTURE_ROOT` points at an existing detection campaign (avoids `missing_fixture`).
- [ ] Rebuild via `--rebuild-fixtures` reproduces the same manifest entry from handbook Before.

## Verification

```bash
cd tools/website-ux-auditor/auditor-tests
./invoke-det-ruleset-harness.sh --only-rule DET.EXAMPLE --force
# fixtureRoot in state.jsonl matches campaign manifest
```

## Known exclusions

- Fixtures live in workbench (gitignored at workspace root); authoritative copies are regenerated from in-repo handbook sources.
- Agent pilot may copy per-rule `fixture-website/` under `agent-pilot-campaigns/`; detection campaign root remains source of truth.
