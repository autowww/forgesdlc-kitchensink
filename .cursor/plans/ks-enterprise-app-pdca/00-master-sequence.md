# ENT.APP Phase A — master sequence

**Goal:** Embed enterprise application UX principles (ENT.APP.01–10 + AI overlay) into Kitchen Sink docs, YAML contracts, and the Studio UX PDCA closed pack—without shipping new React compositions.

**Repo:** `forgesdlc-kitchensink` only. Do not edit consumer submodules in this cycle.

## Principles

1. **Sibling standard** — Enterprise *application* UX (`forge-enterprise-app-ux-standard.md`) stays separate from the public marketing website standard.
2. **Shell lane** — `DET.STUDIO.*` governs Studio SPA density/IA; it does not replace ENT.APP workflow principles.
3. **Contracts before compositions** — YAML `known_gaps` and Phase B backlog name planned compositions; Phase A must not claim they ship.
4. **Prefer extend DET** — Use existing `DET.APP.*` / `DET.FORM.*` in the PDCA pack; mark new checks as `planned:` in YAML until implemented.
5. **Closed pack** — GPT/Cursor cite only rule IDs in `enterprise-app-ruleset.json`; forbid marketing `DET.SECTION.SINGLE_JOB` on Studio pages.
6. **No Fleet profile** — Forge Market may appear only as a generic regression example.

## Phase order

| Phase | Executor | Deliverable | Gate |
|-------|----------|-------------|------|
| E00 | Grok | Prompt pack + this sequence | README lists spikes; orchestrator forbids Phase B |
| E01 | Composer | Deepened app standard + deprecate ledger | ENT.APP.01–10 + control tables; links resolve |
| E01b | Composer | `PHASE-B-BACKLOG.md` | P0 compositions/primitives ordered |
| E02 | Composer | `docs/design/enterprise-app/rules/*.yaml` + README | Every `audit_rules` id in registry or `planned:` |
| E03 | Composer | Widened `enterprise-app-ruleset.json`, assess prompt, tests | `node --test` green; no SECTION.SINGLE_JOB |
| E04 | Composer | FORM handbook page + primitive cross-links | FORM rule not `missing` in manifest |
| E05 | Composer/Bash | Manifest, showcase build, consistency gate | All verify commands green |
| E06 | Grok | Drift prevention checklist | standard ↔ YAML ↔ JSON ↔ prompt aligned |

## Forbidden scope (all phases)

- No new React/JS components under `react/`, `js/`, or `components/`
- No `ForgeQueueWorkbench`, `ForgeGovernedForm`, or other Phase B composition implementations
- No new `check.js` for `planned:` audit rules
- No consumer submodule bumps
- Do not edit `.cursor/plans/ent.app_phase_a_*.plan.md`

## Verification bundle (E05)

```bash
node --test tools/studio-ux-pdca/lib/enterprise-app-ruleset.test.mjs
cd tools/website-ux-auditor && npm run pagegen:manifest
cd ../.. && python3 generator/build-showcase.py
```

## Rollback

Revert per-phase commits on `forgesdlc-kitchensink` master (or feature branch). Phase A is docs + JSON only—no runtime API changes.

## References

- Canonical standard: `docs/design/forge-enterprise-app-ux-standard.md`
- ENT contracts: `docs/design/enterprise-app/`
- PDCA pack: `tools/studio-ux-pdca/lib/enterprise-app-ruleset.json`
- Prompt pack: `docs/prompts/ks-enterprise-app-pdca/`
