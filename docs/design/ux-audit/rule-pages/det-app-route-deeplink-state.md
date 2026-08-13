---
rule_id: DET.APP.ROUTE_DEEPLINK_STATE
lane: deterministic
title: App route deep-link state
summary: Deep-linked routes render main content and active nav matches location.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-route-deeplink-state
registry_status: implemented
page_version: bd901511c6c891a5c2b0093c77251491a93d988fdffaadf4824a02e4bf6bc685
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-08-13T02:31:57.045Z
---

## Purpose

Deep-linked routes render main content and active nav matches location.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.ROUTE_DEEPLINK_STATE` after changing app shells or workspace markup. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-route-deeplink-state.check.js`.
