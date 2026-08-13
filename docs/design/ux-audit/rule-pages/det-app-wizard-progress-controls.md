---
rule_id: DET.APP.WIZARD_PROGRESS_CONTROLS
lane: deterministic
title: App wizard progress controls
summary: Wizards expose step progress, Back/Next, and disabled-next reasons.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-wizard-progress-controls
registry_status: implemented
page_version: 441aea767ca5d2031afd056da22e30deb9af56e424ac38a6416c33d68370931e
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-08-13T02:31:57.049Z
---

## Purpose

Wizard/stepper flows expose step count/current step, stable back/next controls, and disabled next explanation.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.WIZARD_PROGRESS_CONTROLS`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-wizard-progress-controls.check.js`.
