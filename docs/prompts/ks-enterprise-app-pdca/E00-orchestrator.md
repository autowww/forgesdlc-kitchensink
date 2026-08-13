# E00 — Grok orchestrator (ENT.APP Phase A)

**Role:** Orchestrator. You sequence E01–E05, verify acceptance, open remediations, and **stop before Phase B**. You do not bulk-edit files—delegate to Composer spikes.

**Repo:** `/home/lzvyahin/Code/forgesdlc-kitchensink` (standalone Kitchen Sink).

## Mission

Ship Phase A: deepen the Forge Enterprise Application UX Standard (ENT.APP.01–10 + AI), YAML contracts, widened Studio PDCA closed pack, FORM handbook gap closed, primitive cross-links, and a green verify bundle—**without** new React/JS compositions.

## Execution order

1. **E01** — Paste [`E01-composer-standard.md`](E01-composer-standard.md) to Composer. Gate: standard has ENT.APP chapters, control tables, deprecate ledger, Phase B backlog link.
2. **E02** — Paste [`E02-composer-yaml.md`](E02-composer-yaml.md). Gate: 11 YAML files + README; every `audit_rules` id exists in registry or is `planned:`.
3. **E03** — Paste [`E03-composer-pdca-pack.md`](E03-composer-pdca-pack.md). Gate: ruleset tests pass; new DET.APP rows present; `DET.SECTION.SINGLE_JOB` absent.
4. **E04** — Paste [`E04-composer-handbook-xlinks.md`](E04-composer-handbook-xlinks.md). Gate: `DET.FORM.LABEL_ERROR_SUMMARY` not `missing` in manifest; primitive cross-links added.
5. **E05** — Paste [`E05-verify-and-build.md`](E05-verify-and-build.md). Gate: full verify bundle green.

## PDCA per phase

- **Plan:** Read spike acceptance bullets before delegating.
- **Do:** One Composer spike at a time; no parallel E0n.
- **Check:** Run spike verify commands; collect `files changed` report from Composer.
- **Adjust:** If check fails, re-paste same spike with failure output until green; then advance.

## Reject immediately

- PRs/commits adding `react/ForgeQueue*`, `ForgeGovernedForm`, or other Phase B composition source
- Studio pages scored with `DET.SECTION.SINGLE_JOB`
- YAML claiming compositions ship when `known_gaps` says `planned`
- New near-duplicate DET IDs when an existing `DET.APP.*` suffices

## E06 consistency gate (Grok, after E05)

- [ ] `forge-enterprise-app-ux-standard.md` links to `docs/design/enterprise-app/README.md`
- [ ] Each ENT.APP YAML `audit_rules` id is in `deterministic-design-rules.md` / `ai-enabled-design-principles.md` or marked `planned:` in YAML
- [ ] `enterprise-app-ruleset.json` rule ids ⊆ registry (or documented AI ids); pack excludes `DET.SECTION.SINGLE_JOB`
- [ ] `assess-studio-ux.txt` references ENT.APP path and forbids SECTION.SINGLE_JOB on Studio
- [ ] `element-level-ruleset-matrix.md` Studio row mentions widened DET.APP ids (if updated this cycle)
- [ ] Phase B backlog lists QueueWorkbench + GovernedForm first
- [ ] No doc claims `ForgeQueueWorkbench` / `ForgeGovernedForm` are shipped APIs

## Stop line

When E06 is green, **stop**. Phase B (compositions/primitives) is a separate initiative—do not start without explicit user request.
