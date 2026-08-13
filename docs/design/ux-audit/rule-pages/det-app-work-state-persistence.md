---
rule_id: DET.APP.WORK_STATE_PERSISTENCE
lane: deterministic
title: App work-state persistence
summary: Editable workspaces expose autosave, draft recovery, or saved-view persistence cues.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-work-state-persistence
registry_status: implemented
page_version: 4d908e875b16422509bac7386a6de8b45465f940c8805f0f2c1494b5bc58c294
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-08-13T02:55:00.035Z
---

## Purpose

Operators must not reconstruct filters, drafts, or form progress after navigation. Editable Studio workspaces show autosave/draft/saved-view cues (`ForgePersistentWorkspace` / `Fas` / `Fdr` / `Fsm`).

## Pass criteria

- Editable workspace has at least one of: `[data-work-state]`, `.ks-fe-autosave`, `[data-ks-hash="Fas"]`, `[data-ks-hash="Fdr"]`, `[data-ks-hash="Fsm"]`, `[data-ks-hash="Fpw"]`, or visible autosave/draft/saved copy.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.WORK_STATE_PERSISTENCE`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-work-state-persistence.check.js`. Prefer `createPersistentWorkspace` on long-edit screens.
