---
rule_id: DET.APP.ROUTE_DEEPLINK_STATE
lane: deterministic
title: App route deep-link state
summary: Deep-linked routes render main content and active nav matches location.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-route-deeplink-state
registry_status: implemented
---

## Purpose

Deep-linked routes render main content and active nav matches location.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.ROUTE_DEEPLINK_STATE` after changing app shells or workspace markup. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-route-deeplink-state.check.js`.
