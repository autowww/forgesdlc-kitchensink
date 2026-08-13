---
rule_id: DET.APP.AI_PROVENANCE
lane: deterministic
title: App AI provenance
summary: AI suggestion surfaces show label, provenance, confidence, and accept/reject/revert controls.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-ai-provenance
registry_status: implemented
page_version: 460a8845024f7b08b7379e2bb38e7b046b8a674a3f4a4192ed0574e384922393
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-08-13T02:54:59.996Z
---

## Purpose

AI-assisted operator suggestions must disclose provenance and confidence and support human accept/reject/revert (`ForgeAISuggestionReview`).

## Pass criteria

When `[data-ai-generated]`, `[data-ks-hash="Fai"]`, or `.forge-ai-suggestion-review` is present, the surface includes:

- AI label (`Fal` / `.forge-ai-label` / `data-ai-label`)
- Provenance panel (`Fpv` / `data-ai-provenance`)
- Confidence indicator (`Fci` / `data-ai-confidence`)
- Accept/reject and/or revert (`Fra` / matching button labels)

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.AI_PROVENANCE`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-ai-provenance.check.js`. Prefer `createAISuggestionReview`.
