---
rule_id: DET.APP.PRIMITIVE_SOURCE
lane: deterministic
title: App primitive source
summary: KS_REACT_PRIMITIVE components spread ksReactPrimitiveAttrs in source.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primitive_source
registry_status: implemented
page_version: dcd89ed635e96f69d709fef2924729dc2e975effe9d98a4b3bcb2ec0020c4671
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
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
