---
rule_id: DET.APP.CLIENT_ERROR_LOG_CLEAN
lane: deterministic
title: App client error log clean
summary: Scenario steps must not leave console/page errors after interactions.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-client-error-log-clean
registry_status: implemented
page_version: 8c10a5efa9df3db86ff8fc6c5f89f543f39306298f38ccb1e2389895ea0a96a2
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-08-13T02:31:57.001Z
---

## Purpose

Scenario step execution captures console errors/page errors after interactions, not just on initial load.

## Evidence and remediation

Re-run `tools/ui-app-audit/run-scenario-audit.mjs` for the failing scenario; fix script errors on the interaction path. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-client-error-log-clean.check.js` with `metrics.scenarioClientErrorReport` from scenario capture.
