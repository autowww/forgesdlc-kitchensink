---
rule_id: DET.APP.CLIENT_ERROR_LOG_CLEAN
lane: deterministic
title: App client error log clean
summary: Scenario steps must not leave console/page errors after interactions.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-client-error-log-clean
registry_status: implemented
---

## Purpose

Scenario step execution captures console errors/page errors after interactions, not just on initial load.

## Evidence and remediation

Re-run `tools/ui-app-audit/run-scenario-audit.mjs` for the failing scenario; fix script errors on the interaction path. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-client-error-log-clean.check.js` with `metrics.scenarioClientErrorReport` from scenario capture.
