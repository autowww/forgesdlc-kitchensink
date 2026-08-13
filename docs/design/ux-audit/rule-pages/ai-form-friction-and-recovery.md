---
rule_id: AI.FORM.FRICTION_AND_RECOVERY
lane: ai
title: Form friction and recovery
summary: Users can recover from validation mistakes with inline guidance and preserved input.
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-form-friction-and-recovery
page_version: 61acc2df0ad87d2fb5b7f9da455d6c5b9b51261d310bc8a408b545effc3929c4
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-08-13T02:31:57.144Z
---

## Purpose

Users can recover from validation mistakes with inline guidance and preserved input.

Judgment overlay for `AI.FORM.FRICTION_AND_RECOVERY`. Pair with `DET.FORM.LABEL_ERROR_SUMMARY` and related form DET checks; propose `candidateDeterministicRule` when the pattern repeats.

## Required finding metadata

Each finding must include: `principleId`, `severity`, `deterministicCoverage`, `candidateDeterministicRule`, `screenshotOrDomEvidence`, `hashesOrContractsAffected`, `confidence`, `recommendedFixScope`, `sourceFilesLikelyAffected`.
