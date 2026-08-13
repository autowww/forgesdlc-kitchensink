---
rule_id: DET.SECTION.SINGLE_JOB
lane: deterministic
title: Section Single Job
summary: Harness bootstrap handbook page for DET.SECTION.SINGLE_JOB.
page_version: 8127174a3da197c9b4482fa02555df5fa72e1c3b2f4233ef77caa880eee2c730
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
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
