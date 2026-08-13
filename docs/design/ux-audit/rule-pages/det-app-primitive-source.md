---
rule_id: DET.APP.PRIMITIVE_SOURCE
lane: deterministic
title: App primitive source
summary: KS_REACT_PRIMITIVE components spread ksReactPrimitiveAttrs in source.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primitive_source
registry_status: implemented
page_version: 4442b823bacd1c3e62a40a05c4c9debc6b8b53fe6b14a423f07955c208506cd3
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
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
