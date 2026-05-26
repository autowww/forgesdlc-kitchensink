# Harness remediation — synthetic defect fixture

You are fixing a **DET ruleset harness** defect page (ephemeral workbench HTML), not a production consumer site.

## Required environment

- **`FORGE_UX_RULESET_FIXTURE_ROOT`** must point at an existing detection campaign (e.g. `workbench/ux-auditor/rule-defect-fixtures/ruleset-harness-20260525T104745Z`). Do **not** rebuild an empty fixture root.
- For standalone rules, audits use **`LOOP_REPO=fixture-website`** (minimal `harness-minimal-assets/` only). Do **not** scan the full Kitchen Sink tree unless the rule is repo-scoped.

## Order of edits

1. **Prefer deterministic apply first** — copy handbook **After** HTML into the fixture (do not edit consumer repos):

   ```bash
   python3 tools/website-ux-auditor/auditor-tests/apply-harness-fixture-remediation.py \
     --rule-id <RULE_ID> \
     --fixture-dir "${FORGE_UX_RULESET_FIXTURE_ROOT}/website"
   ```

   For **`multi_page`** rules (`DET.APP.PERSISTENT_CHROME`), apply to **every** route HTML (`index.html`, `settings.html`, …). For **`repo_overlay`**, use the campaign overlay path.

2. **Then** hand-edit fixture HTML only if apply did not run or After blocks need a small fix. Or run rule-specific pilot scripts:
   ```bash
   bash tools/website-ux-auditor/auditor-tests/run-agent-pilot-hash-markers-remediation.sh
   bash tools/website-ux-auditor/auditor-tests/run-agent-pilot-persistent-chrome-remediation.sh
   bash tools/website-ux-auditor/auditor-tests/run-agent-pilot-surface-elevation-remediation.sh
   bash tools/website-ux-auditor/auditor-tests/run-agent-pilot-breadcrumb-remediation.sh
   ```

3. If the finding is a **false positive/negative**, adjust the DET check in `tools/website-ux-auditor/design-rules/deterministic/generated/`.
4. Registry-heavy rules (`DET.HASH.MARKERS`, …): ensure `docs/design/catalog/visual-registry.generated.json` exists under the fixture or overlay before audit.

Do **not** edit `forge-fleet-website` or other product repos for harness runs.

## Verify

Re-run the auditor on the same local URL after edits. Target: **0 findings** for the rule under test.
