---
rule_id: DET.APP.ROUTE_DEEPLINK_STATE
lane: deterministic
title: App route deep-link state
summary: Deep-linked routes render main content and active nav matches location.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-route-deeplink-state
registry_status: implemented
page_version: bc85b704ae669ccc6c1916d1d3c3dec1379f1dc61a60a149b10fa883f7a12a50
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
generated_at: 2026-08-13T02:31:57.045Z
---

## Purpose

Deep-linked routes render main content and active nav matches location.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.ROUTE_DEEPLINK_STATE` after changing app shells or workspace markup. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-route-deeplink-state.check.js`.
