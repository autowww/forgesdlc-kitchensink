# KS enterprise app UX — PDCA prompt pack (Phase A)

Ready-to-paste prompts for **Grok orchestration** + **Composer execution** of ENT.APP Phase A (docs, YAML contracts, PDCA pack widening—no new compositions).

## How to run

1. Open a **Grok** (or high-tier orchestrator) chat in `forgesdlc-kitchensink`.
2. Paste [`E00-orchestrator.md`](E00-orchestrator.md) as the system/task prompt.
3. For each phase **E01 → E05**, paste the matching Composer spike into a **Composer 2.5** agent (or `grunt` subagent).
4. After each spike, run the spike's **Check** commands; Grok gates the next phase only when green.
5. Grok runs the **E06 consistency gate** (checklist in E00) after E05.

## Spike index

| File | Executor | Scope |
|------|----------|-------|
| [`E00-orchestrator.md`](E00-orchestrator.md) | Grok | Sequence E01–E05; acceptance gates; remediate; stop before Phase B |
| [`E01-composer-standard.md`](E01-composer-standard.md) | Composer | Deepen `forge-enterprise-app-ux-standard.md` + `PHASE-B-BACKLOG.md` |
| [`E02-composer-yaml.md`](E02-composer-yaml.md) | Composer | `docs/design/enterprise-app/rules/*.yaml` + README |
| [`E03-composer-pdca-pack.md`](E03-composer-pdca-pack.md) | Composer | `enterprise-app-ruleset.json`, assess prompt, tests |
| [`E04-composer-handbook-xlinks.md`](E04-composer-handbook-xlinks.md) | Composer | FORM handbook + primitive ENT cross-links |
| [`E05-verify-and-build.md`](E05-verify-and-build.md) | Composer/Bash | Manifest, showcase, ruleset tests |

## Master sequence

See [`.cursor/plans/ks-enterprise-app-pdca/00-master-sequence.md`](../../../.cursor/plans/ks-enterprise-app-pdca/00-master-sequence.md).

## Out of scope

Phase B compositions (`ForgeQueueWorkbench`, `ForgeGovernedForm`, …), new DET check implementations, consumer submodule propagation, Firebase deploy.
