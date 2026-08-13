# Frw — Forge record workspace

**Hash:** `Frw` · **Type:** composition · **Family:** enterprise-app · **Status:** active

Complete job shell: header, metadata, stage, timeline, main + inspector split. Implemented in `js/ks-record-workspace.js`. Showcase: `enterprise-app-compositions.html` `#sec-eac-record`.

## Purpose

Design the complete job, not an isolated screen (ENT.APP.01)—one workspace for record identity, workflow position, history, primary work, and side inspection.

## Expected look

- Page header with `h1` title, optional subtitle, status badges, and header actions.
- Optional metadata, stage bar, and timeline sections stacked above a split body.
- Split body: `<main id="main">` for primary content and `<aside>` inspector when provided.

## Root element

```html
<div class="forge-record-workspace" hash="Frw" data-ks-hash="Frw"
     data-ks-type="composition" data-ks-name="forge-record-workspace"
     data-studio-workspace="record">
```

## Accessibility

- Single page-level `<h1>` in the workspace header (`DET.STUDIO.H1`).
- `<main id="main">` landmark for primary record content (`DET.LANDMARKS.REQUIRED`).
- Inspector is `<aside>`—supplementary, not a second primary landmark.
- Badges are list items with text labels, not color-only status.

## Deterministic checks

- Root `[data-ks-hash="Frw"]` visible with exactly one `.forge-record-workspace__title` (`h1`).
- `#main` landmark present when `mainHtml` is supplied.
- Title text matches supplied `title` option (`DET.STUDIO.TITLE_NAV_MATCH` when paired with nav).
- Stage and timeline slots render only when their HTML options are non-empty.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| One shell for the full operator job | ENT.APP.01 | `DET.STUDIO.JOB_BUDGET`, `DET.LANDMARKS.REQUIRED` |
| Primary state visible in header badges and stage | ENT.APP.01, ENT.APP.03 | `DET.APP.PRIMARY_STATE` |
| Inspect evidence beside the record without navigation | ENT.APP.08 | `AI.APP.WORKFLOW_CONTINUITY`, `DET.STUDIO.H1` |

Contract: [`enterprise-app/rules/ENT.APP.01.yaml`](../../enterprise-app/rules/ENT.APP.01.yaml).
