---
rule_id: AI.FORM.FRICTION_AND_RECOVERY
lane: ai
title: Form friction and recovery
summary: Users can recover from validation mistakes with inline guidance and preserved input.
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-form-friction-and-recovery
page_version: 2eedb4c63e0d2c7fe13690fa254b7658212d75e77e5599076662bef7ad7cdbac
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
generated_at: 2026-08-13T02:31:57.144Z
---

## Purpose

Users can recover from validation mistakes with inline guidance and preserved input.

Judgment overlay for `AI.FORM.FRICTION_AND_RECOVERY`. Pair with `DET.FORM.LABEL_ERROR_SUMMARY` and related form DET checks; propose `candidateDeterministicRule` when the pattern repeats.

## Required finding metadata

Each finding must include: `principleId`, `severity`, `deterministicCoverage`, `candidateDeterministicRule`, `screenshotOrDomEvidence`, `hashesOrContractsAffected`, `confidence`, `recommendedFixScope`, `sourceFilesLikelyAffected`.
