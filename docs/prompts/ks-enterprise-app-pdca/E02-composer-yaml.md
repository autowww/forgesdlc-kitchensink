# E02 — Composer spike: ENT.APP YAML contracts

**Phase:** E02  
**Executor:** Composer 2.5  
**Depends on:** E01

## Goal

Add machine-readable ENT.APP principle contracts under `docs/design/enterprise-app/rules/` and index in README.

## Files to create

| Path |
|------|
| `docs/design/enterprise-app/README.md` |
| `docs/design/enterprise-app/rules/ENT.APP.01.yaml` … `ENT.APP.10.yaml` |
| `docs/design/enterprise-app/rules/ENT.APP.AI.yaml` |

## YAML schema (each file)

```yaml
id: ENT.APP.01
title: ...
recommended_components: [...]
recommended_composition:
  - name: ForgeRecordWorkspace
    status: planned
required_states: [...]
audit_rules:
  - DET.STUDIO.JOB_BUDGET
  - planned: DET.APP.WORK_STATE_PERSISTENCE   # only when not in registry
known_gaps: [...]
```

## Rules

- `recommended_composition` entries use `status: planned` unless already shipped (none in Phase A).
- ENT.APP.02 must include `planned: DET.APP.WORK_STATE_PERSISTENCE` under `audit_rules`.
- Every non-`planned:` `audit_rules` id must exist in `deterministic-design-rules.md` or `ai-enabled-design-principles.md`.
- README: index all YAML files, deprecate/demote summary, link to standard + PHASE-B-BACKLOG + ux-audit README.

## Also update

- `docs/design/ux-audit/README.md` — link to `enterprise-app/`
- `docs/design/forge-enterprise-app-ux-standard.md` — link to enterprise-app README (if not already)

## Forbidden scope

- No new check.js implementations
- No React compositions

## Acceptance

- [ ] 11 YAML files + README
- [ ] `grep -r 'planned:' docs/design/enterprise-app/rules/` includes WORK_STATE_PERSISTENCE
- [ ] No invented DET ids without `planned:` prefix

## Check

```bash
ls docs/design/enterprise-app/rules/ENT.APP.*.yaml | wc -l
# expect 11
```

## Report

List files changed; table of audit_rules ids (implemented vs planned).
