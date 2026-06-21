---
rule_id: DET.APP.WIZARD_PROGRESS_CONTROLS
lane: deterministic
title: App wizard progress controls
summary: Wizards expose step progress, Back/Next, and disabled-next reasons.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-wizard-progress-controls
registry_status: implemented
---

## Purpose

Wizard/stepper flows expose step count/current step, stable back/next controls, and disabled next explanation.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.WIZARD_PROGRESS_CONTROLS`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-wizard-progress-controls.check.js`.
