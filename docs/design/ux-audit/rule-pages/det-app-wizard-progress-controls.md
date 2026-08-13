---
rule_id: DET.APP.WIZARD_PROGRESS_CONTROLS
lane: deterministic
title: App wizard progress controls
summary: Wizards expose step progress, Back/Next, and disabled-next reasons.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-wizard-progress-controls
registry_status: implemented
page_version: 3256280c004f99aa8b8b5ac88220cd84bb752c58660835919ad3bacce40c3dd6
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
generated_at: 2026-08-13T02:31:57.049Z
---

## Purpose

Wizard/stepper flows expose step count/current step, stable back/next controls, and disabled next explanation.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.WIZARD_PROGRESS_CONTROLS`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-wizard-progress-controls.check.js`.
