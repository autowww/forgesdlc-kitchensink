---
rule_id: DET.STUDIO.FULLPAGE_SHOT
lane: deterministic
title: Studio full-page capture
summary: PDCA capture expands nested scroll roots so assessors see below-the-fold competing jobs.
page_version: caddcf63629093d25b6ae4df4aba9e190c9d4a11b3be2a021f8718dbcadbfd9a
generated_at: 2026-08-13T00:00:00.000Z
registry_status: documented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-studio-fullpage_shot
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
---

## Purpose

Studio shells scroll inside **`main.fc-main`**, not only the viewport. If ChatGPT receives a viewport-height PNG, it cannot judge below-the-fold competing jobs and will false-pass `DET.STUDIO.JOB_BUDGET`.

`capture-page.mjs` temporarily expands nested scroll roots before screenshot. This rule fails when `screenshot_height << scroll_height` for tall workspaces.

## Passing signals

- `capture-page.mjs` sets `scroll_height` and full PNG height ≥ 90% of scroll when content > 900px.
- `REQUIRE_SCREENSHOT_ATTACH=1` (default) ensures GPT receives the PNG.

## Failing signals

- Screenshot shows only the header band while H2 sections exist below the fold.
- `capture_capped: true` without documented reason.

## Before example

Capture with default viewport only — assessor sees header but not four H2 sections below nested scroll.

## After example

Run `capture-page.mjs` which expands `main.fc-main` chain before `page.screenshot({ fullPage: true })`.

## Evidence and remediation

- Fix capture harness, not product UI, when this rule fires alone.
- Re-run PDCA iteration after capture fix.

## Related rules

- `DET.STUDIO.JOB_BUDGET` — requires full scroll evidence.
