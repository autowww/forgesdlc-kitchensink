---
rule_id: DET.APP.TOAST_LIFECYCLE
lane: deterministic
title: App toast lifecycle
summary: Toasts use live regions, dismiss when persistent, and avoid covering CTAs.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-toast-lifecycle
registry_status: implemented
---

## Purpose

Toast/status messages use `role=status` or `aria-live`, can dismiss when persistent, and do not cover primary controls.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.TOAST_LIFECYCLE`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-toast-lifecycle.check.js`.
