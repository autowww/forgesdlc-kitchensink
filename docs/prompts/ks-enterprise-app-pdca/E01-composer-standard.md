# E01 — Composer spike: deepen app standard

**Phase:** E01 (+ E01b backlog in same commit)  
**Executor:** Composer 2.5  
**Depends on:** E00 prompt pack present

## Goal

Expand `docs/design/forge-enterprise-app-ux-standard.md` with ENT.APP.01–10 + AI overlay chapters, practical control-selection tables, deprecate/demote ledger, and shell-lane demotion note. Create `docs/design/enterprise-app/PHASE-B-BACKLOG.md`.

## Files to edit/create

| Path | Action |
|------|--------|
| `docs/design/forge-enterprise-app-ux-standard.md` | Deepen |
| `docs/design/enterprise-app/PHASE-B-BACKLOG.md` | Create |

## Required content (standard)

1. Keep existing Purpose, Shell anatomy, First viewport, Copy pattern, Capture contract sections.
2. Add **Foundation** section with chapters:
   - ENT.APP.01 Complete job (`ForgeRecordWorkspace` — planned)
   - ENT.APP.02 Work continuity (`DET.APP.WORK_STATE_PERSISTENCE` — planned)
   - ENT.APP.03 State and freshness
   - ENT.APP.04 Error prevention and recovery
   - ENT.APP.05 Data workbench
   - ENT.APP.06 Permissions vs preferences
   - ENT.APP.07 Beginner and expert
   - ENT.APP.08 Contextual inspection and handoffs
   - ENT.APP.09 Accessibility contract
   - ENT.APP.10 Workflow measurement
   - ENT.APP.AI Governed AI overlay
3. Add **Practical control-selection guide** tables: choice, progress, action, feedback, data, disclosure.
4. Add **Badge vs banner vs callout** subsection under ENT.APP.03.
5. Add **Progress control distinction** table (stepper vs stage bar vs flow vs timeline).
6. Add **Deprecate / demote ledger** (SECTION.SINGLE_JOB on Studio; badge-as-ACL; informal editable Dtb; stage-as-wizard; bottom-sheet-as-desktop-inspector; DET.STUDIO as full ENT substitute; near-duplicate DET IDs).
7. Link to `docs/design/enterprise-app/README.md` and `PHASE-B-BACKLOG.md`.
8. Demote `DET.STUDIO.*` to **Shell lane** (density/IA only).

## Forbidden scope

- No new React/JS components
- No edits to `enterprise-app-ruleset.json` (E03)
- No YAML contracts yet (E02)

## Acceptance

- [ ] ENT.APP.01–10 + AI chapters present with KS component names that exist today (`react/Frh`, `Ftb`, `Dtb`, etc.)
- [ ] Control tables present (6 categories + badge/banner/callout + progress distinction)
- [ ] Deprecate ledger explicit
- [ ] PHASE-B-BACKLOG lists P0 compositions (QueueWorkbench, GovernedForm first) and P0 primitives
- [ ] Links to `react/` primitives and dynamic-ui API resolve

## Check

```bash
grep -c 'ENT.APP.0' docs/design/forge-enterprise-app-ux-standard.md
test -f docs/design/enterprise-app/PHASE-B-BACKLOG.md
```

## Report

List files changed and any assumptions.
