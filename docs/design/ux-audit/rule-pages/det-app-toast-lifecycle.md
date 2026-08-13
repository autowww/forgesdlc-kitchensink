---
rule_id: DET.APP.TOAST_LIFECYCLE
lane: deterministic
title: App toast lifecycle
summary: Toasts use live regions, dismiss when persistent, and avoid covering CTAs.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-toast-lifecycle
registry_status: implemented
page_version: aff990b37f7553e56d652b5bfc6b7ca6dac570a4a6a87955ea169f4fd5c211fe
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
generated_at: 2026-08-13T02:31:57.049Z
---

## Purpose

Toast/status messages use `role=status` or `aria-live`, can dismiss when persistent, and do not cover primary controls.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.TOAST_LIFECYCLE`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-toast-lifecycle.check.js`.
