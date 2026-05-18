# 00 — Master sequence (KS Visual Hash Catalog)

## Goal

Establish governance for KS visuals in `forgesdlc-kitchensink`: inventory → ontology → registry/hashes → DOM markers → contracts → screenshots reference → validation/CI → auditor/scorer awareness → QA report. Do not redesign visuals—add traceability only.

## Execution order

1. Inventory current visual objects (`01`).
2. Catalog standard and ontology (`02`).
3. Allocate stable hashes and registry (`03`).
4. Emit hash attributes on visual roots (`04`).
5. Generate design contracts (`05`).
6. Screenshot/showcase reference (`06`).
7. Validation tooling and CI (`07`).
8. Auditor/scorer/remediation awareness (`08`).
9. Final QA and coverage report (`09`).
10. README maintenance + `.cursor/rules/forge-visual-catalog-governance.mdc` (kit Prompt 10, after core catalog).

## Child plans (see each file)

| Plan | Stop condition |
|------|----------------|
| `01-discover-current-visual-inventory.md` | `visual-inventory.generated.{json,md}` + summary; no final allocation |
| `02-create-catalog-standard-and-ontology.md` | README + dirs + ontology usable by humans/agents |
| `03-build-registry-and-allocate-hashes.md` | `visual-registry.yaml` + `.generated.json` + `visual-registry-coverage.md` |
| `04-apply-hash-attributes-to-visual-roots.md` | Showcase HTML shows markers for required entries |
| `05-generate-design-contracts.md` | All active rows: own or family-covered contract |
| `06-showcase-screenshots-and-hosted-reference.md` | Capture script + `screenshot_status` documented |
| `07-validation-tooling-and-ci.md` | `check-visual-catalog.mjs` + CI green |
| `08-auditor-scorer-remediation-awareness.md` | Shared parser; no CLI cross-calls |
| `09-final-qa-and-coverage-report.md` | Filled report + coverage metrics |

## Per-child checklist template

- **Goal:** one sentence.
- **Files to inspect:** key paths.
- **Expected changes:** artifacts and code.
- **Validation commands:** build-showcase, inventory, check, auditor tests, pytest.
- **Risks:** a11y, drift, hash exhaustion.
- **Stop condition:** explicit.
- **Rollback:** revert commit / remove generated artifacts.

## Architecture rules (non-negotiable)

- Design catalog CLIs must **not** invoke `analyze-website-ux.mjs` or `score-website-ux.mjs`.
- Auditor and scorer must **not** call each other.
- Kit `catalog-examples/` and `reference-analysis/` are **not** authoritative for hashes.
