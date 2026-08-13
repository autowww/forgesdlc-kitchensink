---
rule_id: DET.APP.PRIMITIVE_SOURCE
lane: deterministic
title: App primitive source
summary: KS_REACT_PRIMITIVE components spread ksReactPrimitiveAttrs in source.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primitive_source
registry_status: implemented
page_version: 5b0918ec75bec9e915ce9ff01e37f4bc151455a166e54d6ed04aa78023dcba98
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
generated_at: 2026-05-28T17:05:34.731Z
---

## Purpose

Repo scan: every `react/*.tsx` listed in `KS_REACT_PRIMITIVE` must spread `ksReactPrimitiveAttrs()` on the primitive root. Harness uses a **repo overlay** (defects come from overlay `react/*.tsx`, not DOM).

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<p class="forge-support">Harness serves this page; audit uses <code>--repo</code> overlay sources.</p>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4">
<p class="forge-support">Overlay <code>react/HarnessStatusBanner.tsx</code> spreads <code>ksReactPrimitiveAttrs()</code>.</p>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.PRIMITIVE_SOURCE` with `--repo` pointing at the overlay kitchensink root.
