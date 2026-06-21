---
rule_id: AI.FORM.FRICTION_AND_RECOVERY
lane: ai
title: Form friction and recovery
summary: Users can recover from validation mistakes with inline guidance and preserved input.
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-form-friction-and-recovery
---

## Purpose

Users can recover from validation mistakes with inline guidance and preserved input.

Judgment overlay for `AI.FORM.FRICTION_AND_RECOVERY`. Pair with `DET.FORM.LABEL_ERROR_SUMMARY` and related form DET checks; propose `candidateDeterministicRule` when the pattern repeats.

## Required finding metadata

Each finding must include: `principleId`, `severity`, `deterministicCoverage`, `candidateDeterministicRule`, `screenshotOrDomEvidence`, `hashesOrContractsAffected`, `confidence`, `recommendedFixScope`, `sourceFilesLikelyAffected`.
