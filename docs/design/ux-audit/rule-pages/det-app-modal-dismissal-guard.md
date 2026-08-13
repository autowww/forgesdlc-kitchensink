---
rule_id: DET.APP.MODAL_DISMISSAL_GUARD
lane: deterministic
title: App modal dismissal guard
summary: Modals include close affordance and unsaved/destructive guards.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-modal-dismissal-guard
registry_status: implemented
page_version: 7d5f3450a3d518542c72a4c3dbeb1e0bdeebd8af599b18a17579e9963cf04a00
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-08-13T02:31:57.037Z
---

## Purpose

Modals/panels include close affordance, escape handling where safe, and unsaved-change guard for destructive workflows.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.MODAL_DISMISSAL_GUARD`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-modal-dismissal-guard.check.js`.
