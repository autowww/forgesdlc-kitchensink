---
rule_id: DET.APP.TOAST_LIFECYCLE
lane: deterministic
title: App toast lifecycle
summary: Toasts use live regions, dismiss when persistent, and avoid covering CTAs.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-toast-lifecycle
registry_status: implemented
page_version: d8a5e6b353e1e7c25b61593cecf5cd12d4de72bac295e26e304ae4bb83cdefa6
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-08-13T02:31:57.049Z
---

## Purpose

Toast/status messages use `role=status` or `aria-live`, can dismiss when persistent, and do not cover primary controls.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.TOAST_LIFECYCLE`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-toast-lifecycle.check.js`.
