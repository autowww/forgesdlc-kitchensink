---
rule_id: DET.SECTION.SINGLE_JOB
lane: deterministic
title: Section Single Job
summary: Harness bootstrap handbook page for DET.SECTION.SINGLE_JOB.
page_version: f2d19970eb6d951bd839725df5b8bb6d1f821c608c62d7c49e3e3c996fa5d0eb
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-section-single-job
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-section-single-job.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.SECTION.SINGLE_JOB` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<h1 class="font-display">Platform overview</h1>
<section class="forge-card p-4 mb-4 ks-section" style="min-height:140px">
<h2 class="h4">Everything at once</h2>
<p class="forge-support">Get started quickstart install setup try sign up now. Pricing plan tier subscription cost license fee. Trust security governance boundary privacy audit evidence compliance posture. Outcome benefit value impact result why forge why choose. Forgesdlc lenses lcdl fleet platform blueprints ecosystem partners. Workflow stages lifecycle pipeline process from intent to ship. Get started quickstart install setup try sign up now. Pricing plan tier subscription cost license fee. Trust security governance boundary privacy audit evidence compliance posture. Outcome benefit value impact result why forge why choose. Forgesdlc lenses lcdl fleet platform blueprints ecosystem partners. Workflow stages lifecycle pipeline process from intent to ship. Get started quickstart install setup try sign up now. Pricing plan tier subscription cost license fee. Trust security governance boundary privacy audit evidence compliance posture. Outcome benefit value impact result why forge why choose. Forgesdlc lenses lcdl fleet platform blueprints ecosystem partners. Workflow stages lifecycle pipeline process from intent to ship. </p>
</section>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4">
<h1 class="font-display">Governed delivery</h1>
<section class="forge-card p-4 mb-4" style="min-height:120px">
<h2 class="h4">Methodology spine</h2>
<p class="forge-support">One coherent topic: how Forge SDLC connects intent to evidence.</p>
</section>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.SECTION.SINGLE_JOB`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
