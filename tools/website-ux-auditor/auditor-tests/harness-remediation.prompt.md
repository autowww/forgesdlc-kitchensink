# Harness remediation — synthetic defect fixture

You are fixing a **DET ruleset harness** defect page (ephemeral workbench HTML), not a production consumer site.

## Order of edits

1. **Fixture HTML** under the campaign `fixture-website/` or rule `rules/<RULE_ID>/fixture-website/` — apply the **After example** from the rule handbook markdown (Before → After). Or run:
   ```bash
   python3 tools/website-ux-auditor/auditor-tests/apply-harness-fixture-remediation.py \
     --rule-id DET.HASH.MARKERS \
     --fixture-dir /path/to/campaign/rules/DET.HASH.MARKERS/fixture-website
   ```
2. If the finding is a **false positive/negative**, adjust the DET check in `tools/website-ux-auditor/design-rules/deterministic/generated/`.
3. If the agent cannot act, improve `cursor-agent-run-ux-plan.sh` prompts or `.cursor/rules/forge-ux-remediation-plan-runner.mdc`.

Do **not** edit `forge-fleet-website` or other product repos for harness runs.

## Verify

Re-run the auditor on the same local URL after edits. Target: **0 findings** for the rule under test.
