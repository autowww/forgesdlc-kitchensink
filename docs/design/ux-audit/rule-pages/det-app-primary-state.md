---
rule_id: DET.APP.PRIMARY_STATE
lane: deterministic
title: App primary state
summary: One visible primary workspace state region per active studio page.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primary-state
registry_status: implemented
page_version: 7f62082ab82c1c2ce9ab7f016fcb2e54839413386514bb23d04c6112a1021d75
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
generated_at: 2026-05-28T17:05:34.727Z
---

## Purpose

Per active workspace, at most one visible `[data-studio-primary-state]` or `.studio-state--*` region.

## Before example

```html
<main id="main" class="studio-page" data-studio-workspace="hub">
<div class="studio-state--running" data-studio-primary-state>Running…</div>
<div class="studio-state--completed">Completed</div>
</main>
```

## After example

```html
<main id="main" class="studio-page" data-studio-workspace="hub">
<div class="studio-state--running" data-studio-primary-state>Running…</div>
<div class="studio-state--completed" hidden>Completed</div>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.PRIMARY_STATE`.
