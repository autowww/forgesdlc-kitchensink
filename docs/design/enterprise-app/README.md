# Enterprise application UX — ENT.APP contracts

Machine-readable contracts linking **enterprise application principles** → recommended KS components → required states → audit rule IDs.

Sibling to the narrative **[Forge enterprise app UX standard](../forge-enterprise-app-ux-standard.md)**. Public marketing sites use **[forge-enterprise-ai-website-standard.md](../forge-enterprise-ai-website-standard.md)** instead.

## Index

| ID | Title | Composition (shipped) |
|----|-------|----------------------|
| [ENT.APP.01](rules/ENT.APP.01.yaml) | Design the complete job | `ForgeRecordWorkspace` (`Frw`) |
| [ENT.APP.02](rules/ENT.APP.02.yaml) | Never make users reconstruct work | `ForgePersistentWorkspace` (`Fpw`) |
| [ENT.APP.03](rules/ENT.APP.03.yaml) | State, freshness, consequences | `ForgeAsyncOperation` (`Fao`) |
| [ENT.APP.04](rules/ENT.APP.04.yaml) | Error prevention and recovery | `ForgeGovernedForm` (`Fgf`) |
| [ENT.APP.05](rules/ENT.APP.05.yaml) | Data workbench | `ForgeQueueWorkbench` (`Fqw`) |
| [ENT.APP.06](rules/ENT.APP.06.yaml) | Permissions vs preferences | `ForgePermissionBoundary` (`Fpb`) |
| [ENT.APP.07](rules/ENT.APP.07.yaml) | Beginner and expert | `ForgeAdaptiveWorkspace` (`Faw`) |
| [ENT.APP.08](rules/ENT.APP.08.yaml) | Contextual inspection and handoffs | `ForgeInspectionWorkspace` (`Fix`) |
| [ENT.APP.09](rules/ENT.APP.09.yaml) | Accessibility as API | Component state matrices (see [a11y-state-matrices.md](a11y-state-matrices.md)) |
| [ENT.APP.10](rules/ENT.APP.10.yaml) | Workflow measurement | `ForgeWorkflowMetrics` (`Fwm`) |
| [ENT.APP.AI](rules/ENT.APP.AI.yaml) | Governed AI overlay | `ForgeAISuggestionReview` (`Fai`) |

## Schema

Each YAML file includes:

- `recommended_components` — existing KS primitives/APIs
- `recommended_composition` — shipped compositions with `status: shipped`, `module`, and `hash`
- `required_states` — UX states consumers must implement
- `audit_rules` — implemented DET/AI ids (use `planned: <id>` only for rules not yet wired)
- `known_gaps` — remaining consumer or integration gaps (empty when Phase B scope is complete)

Per-primitive accessibility state matrices ship in [a11y-state-matrices.md](a11y-state-matrices.md) and [`tools/studio-ux-pdca/lib/enterprise-app-a11y-matrices.json`](../../tools/studio-ux-pdca/lib/enterprise-app-a11y-matrices.json).

## Deprecate / demote (summary)

| Pattern | Action |
|---------|--------|
| `DET.SECTION.SINGLE_JOB` on Studio | Demote → `DET.STUDIO.JOB_BUDGET` |
| Badge as ACL | Deprecate |
| Informal editable `Dtb` | Deprecate → `ForgeEditableGridAdapter` |
| Stage bar as wizard | Demote → `Swz` |
| Bottom sheet as desktop inspector | Deprecate → split pane |
| `DET.STUDIO.*` as full ENT substitute | Demote → shell lane only |

Full ledger: [standard § Deprecate](../forge-enterprise-app-ux-standard.md#deprecate--demote-ledger).

## Phase B

**P0 + P1 shipped** — implementations and hashes tracked in **[PHASE-B-BACKLOG.md](PHASE-B-BACKLOG.md)**. Showcase: [`enterprise-app-compositions.html`](../../showcase/enterprise-app-compositions.html) (after build).

## Related

- UX audit catalog: [../ux-audit/enterprise-app-ux-rules.md](../ux-audit/enterprise-app-ux-rules.md)
- Studio PDCA pack: [../../tools/studio-ux-pdca/lib/enterprise-app-ruleset.json](../../tools/studio-ux-pdca/lib/enterprise-app-ruleset.json)
- PDCA prompt pack: [../../prompts/ks-enterprise-app-pdca/README.md](../../prompts/ks-enterprise-app-pdca/README.md)
