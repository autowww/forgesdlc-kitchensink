# UX ruleset harness — Definition of Ready / Done

Governance for the Kitchen Sink **DET / AI ruleset harness**: when each artifact is ready to build, and what evidence proves it is done. Use this pack before adding rules, fixtures, or campaign scripts.

**Scope:** KS-wide harness only (`workbench/ux-auditor/`, defect fixtures, `auditor-tests/`). Do **not** use for consumer-site remediation (Fleet profiles, product repos).

## Artifact dependency chain

```text
Ruleset ──► Rule page ──► Detection check ──► Fixture ──► Auditor
                                                      │
                    Deterministic fixer ◄─────────────┤ (pilot rules; verify)
                    Remediation script fix ◄──────────┤ (handbook After / legacy apply)
                    Remediation script (agent) ◄──────┘ (only if fixer verify fails)
                              │
                    Harness campaign (orchestrates all lanes)
```

| Term (operator) | Canonical artifact | Primary location |
|-----------------|-------------------|------------------|
| Ruleset | `DET.*` / `AI.*` catalog + registry | `deterministic-design-rules.md`, `ai-enabled-design-principles.md`, `design-rules/registry.generated.json` |
| Rule page | Handbook Markdown + Before/After HTML | `docs/design/ux-audit/rule-pages/` |
| Detection check | DET `*.check.js` or AI prompt | `design-rules/deterministic/generated/`, `design-rules/ai/prompts/generated/` |
| Fixture | Defect campaign (`manifest.json`, `website/`) | `generator/build_rule_defect_fixtures.py` → workbench |
| Auditor | `analyze-website-ux.mjs` on fixture URL | `tools/website-ux-auditor/` |
| Deterministic fixer | Pilot automated fix + verify before agent | `lib/ux-deterministic-fixers/` |
| Remediation script fix | Apply handbook After to fixture HTML | `auditor-tests/apply-harness-fixture-remediation.py` (harness backend for `handbook_after`) |
| Remediation script | Loop + optional Cursor agent | `run-website-ux-remediation-loop.sh`, `harness-remediation.prompt.md` |
| Harness campaign | Batch invoke + `state.jsonl` | `invoke-det-ruleset-harness.sh`, `invoke-det-ruleset-remediation-verify.sh`, `invoke-ai-ruleset-harness.sh` |

**Terminology:** “Remediation script” = agent-capable loop; “Remediation script fix” = deterministic After copy (no agent).

## Current coverage snapshot

- [CURRENT-COVERAGE.md](CURRENT-COVERAGE.md) — registry counts, fixer decision summary, matrix gate status (regenerate with `npm run harness:coverage` in `website-ux-auditor`).
- [RELEASE-NOTES-2026-05-29.md](../RELEASE-NOTES-2026-05-29.md) — pack migration notes for the 2026-05 ruleset campaign.

## DoR / DoD index

| Artifact | Ready | Done |
|----------|-------|------|
| Ruleset | [definition-of-ready-ruleset.md](definition-of-ready-ruleset.md) | [definition-of-done-ruleset.md](definition-of-done-ruleset.md) |
| Rule page | [definition-of-ready-rule-page.md](definition-of-ready-rule-page.md) | [definition-of-done-rule-page.md](definition-of-done-rule-page.md) |
| Detection check | [definition-of-ready-detection-check.md](definition-of-ready-detection-check.md) | [definition-of-done-detection-check.md](definition-of-done-detection-check.md) |
| Fixture | [definition-of-ready-fixture.md](definition-of-ready-fixture.md) | [definition-of-done-fixture.md](definition-of-done-fixture.md) |
| Auditor | [definition-of-ready-auditor.md](definition-of-ready-auditor.md) | [definition-of-done-auditor.md](definition-of-done-auditor.md) |
| Remediation script fix | [definition-of-ready-remediation-script-fix.md](definition-of-ready-remediation-script-fix.md) | [definition-of-done-remediation-script-fix.md](definition-of-done-remediation-script-fix.md) |
| Remediation script | [definition-of-ready-remediation-script.md](definition-of-ready-remediation-script.md) | [definition-of-done-remediation-script.md](definition-of-done-remediation-script.md) |
| Deterministic fixer | [definition-of-ready-deterministic-fixer.md](definition-of-ready-deterministic-fixer.md) | [definition-of-done-deterministic-fixer.md](definition-of-done-deterministic-fixer.md) |
| Harness campaign | [definition-of-ready-harness-campaign.md](definition-of-ready-harness-campaign.md) | [definition-of-done-harness-campaign.md](definition-of-done-harness-campaign.md) |

## Coverage and script testing

| Document | Role |
|----------|------|
| [E2E-COVERAGE-MATRIX.md](E2E-COVERAGE-MATRIX.md) | Per-rule E2E tier (`full_e2e`, `detect_e2e`, …) from registry + campaigns |
| [FIXTURE-SCRIPT-TEST-MAP.md](FIXTURE-SCRIPT-TEST-MAP.md) | Harness scripts × fixture needs × `*.test.sh` coverage |

Regenerate both:

```bash
cd tools/website-ux-auditor/auditor-tests
node generate-harness-e2e-matrix.mjs
```

**Handbook version sync** (no Cursor pagegen — when Before/After already valid):

```bash
./invoke-sync-handbook-versions.sh
# or bootstrap rows only: ./invoke-sync-handbook-versions.sh --bootstrap-only
```

## Harness operations (quick links)

| Resource | Path |
|----------|------|
| DET harness index | `tools/website-ux-auditor/auditor-tests/DET-RULESET-HARNESS-INDEX.md` |
| Closure checklist | `tools/website-ux-auditor/auditor-tests/RULESET-HARNESS-CLOSURE.md` |
| Rule page schema | `docs/design/ux-audit/rule-pages/RULE_PAGE_SCHEMA.md` |
| UX auditor README | `tools/website-ux-auditor/README.md` |
