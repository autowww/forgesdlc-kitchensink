---
rule_id: DET.APP.PRIMITIVE_SOURCE
lane: deterministic
title: React primitive attribute source
summary: Every KS_REACT_PRIMITIVE .tsx file spreads ksReactPrimitiveAttrs() on the primitive root so governed hash markers stay aligned in source.
page_version: 2570d3ca3419a0b02824bffb6f7f139345dc20514be9cb84d4143f53455cf44c
generated_at: 2026-05-28T18:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primitive_source
related_rules:
  - DET.APP.PRIMITIVE_MARKERS
  - DET.HASH.MARKERS
  - DET.APP.CONTROL_A11Y
  - DET.APP.PRIMITIVE_STYLES
  - AI.APP.PRIMITIVE_CONSISTENCY
---

## Purpose

Kitchen Sink **React primitives** (`ForgeStatusBanner`, `ForgeWorkflowStageBar`, `WorkspaceLensControl`, and siblings) are registered in **`KS_REACT_PRIMITIVE`** inside `react/ksVisualAttrs.ts`. Each entry maps a component key to a child hash and registry slug (for example **Fsb** / `forge-status-banner` for `ForgeStatusBanner`).

This deterministic rule runs at **repo phase** (`scanAppPrimitiveSource` in `design-rules/deterministic/generated/det-app-primitive-source.check.js`). It walks every key in `KS_REACT_PRIMITIVE`, opens the matching `react/<ComponentKey>.tsx`, and requires a **`ksReactPrimitiveAttrs(`** call in that file. The spread is the single supported way to emit paired `hash` / `data-ks-hash`, `data-ks-type="react-primitive"`, `data-ks-name`, and `data-ks-react-root="true"` on the outermost primitive element — the same contract Python renderers satisfy via `ks_hash_attrs()`.

**Plan:** Add or rename a primitive in `react/` and register it in `KS_REACT_PRIMITIVE` plus `docs/design/catalog/visual-registry.yaml`. **Do:** Import `ksReactPrimitiveAttrs` from `./ksVisualAttrs` and spread `{...ksReactPrimitiveAttrs('ComponentKey')}` on the primitive root (see `react/ForgeStatusBanner.tsx`). **Check:** Repo scan via `analyze-website-ux.mjs` with `--repo` pointing at the kitchensink root, or the DET harness overlay. **Adjust:** Fix source spreading before chasing DOM marker drift (**`DET.APP.PRIMITIVE_MARKERS`**) or stylesheet gaps (**`DET.APP.PRIMITIVE_STYLES`**).

## Passing signals

- Every `react/<ComponentKey>.tsx` listed in `KS_REACT_PRIMITIVE` contains **`ksReactPrimitiveAttrs(`** (typically `{...ksReactPrimitiveAttrs('ForgeStatusBanner')}` on the outer `ks-fe-*` root).
- `appPrimitiveSourceReport.skipped` is `false` when `react/ksVisualAttrs.ts` (or `kitchensink/react/ksVisualAttrs.ts` in consumer trees) defines the primitive map.
- `appPrimitiveSourceReport.issues` is empty — no “does not spread `ksReactPrimitiveAttrs()`” messages.
- Built HTML from passing sources shows full marker sets on primitive roots (for example **Fsb** on `ks-fe-banner`), which **`DET.APP.PRIMITIVE_MARKERS`** can then verify in the DOM.
- Harness overlay passes when overlay `react/HarnessStatusBanner.tsx` includes the spread even if the served HTML is minimal.

## Failing signals

- **`react/<Component>.tsx does not spread ksReactPrimitiveAttrs() on the primitive root.`** — file exists and is registered but the helper call is absent (hand-rolled `data-ks-hash` alone does not satisfy this rule).
- **`Primitive component react/<Component>.tsx is listed in KS_REACT_PRIMITIVE but missing on disk.`** — registry key without a matching source file.
- Repo scan **skips** when no `ksVisualAttrs.ts` with `KS_REACT_PRIMITIVE` block is found (not a pass).
- Findings cap at **`MAX_APP_PRIMITIVE_SOURCE_FINDINGS` (12)** with an “additional issues omitted” tail when many primitives break at once.
- Partial manual attrs in TSX (for example only `data-ks-react-root` and `data-ks-hash`) often still fail here and may also fail **`DET.APP.PRIMITIVE_MARKERS`** (`missing-hash-attr`, `missing-data-ks-name`, `hash-mismatch`) after build.

## Before example

Failing pattern: `ForgeStatusBanner` styling without `ksReactPrimitiveAttrs()` in source — hand-pasted react-primitive flags on the root. Repo scan flags the `.tsx`; rendered HTML lacks paired `hash`, `data-ks-name`, and consistent slug alignment.

```html
<main id="main" class="doc-main px-4 py-4">
  <div class="mx-auto doc-content" style="max-width:56rem">
    <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
      <p class="section-label text-cyan mb-2">Studio run</p>
      <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.25rem)">Docs health #8842</h1>
    </header>
    <div
      class="ks-fe-banner ks-fe-banner--failed mt-3"
      role="alert"
      data-ks-react-root="true"
      data-ks-type="react-primitive"
      data-ks-hash="Fsb"
    >
      <div class="ks-fe-banner__body">
        <strong class="ks-fe-banner__title">Failed step</strong>
        <div class="ks-fe-banner__desc">Container argv drift detected. Resolve before approval.</div>
      </div>
      <div class="ks-fe-banner__actions">
        <button type="button" class="btn btn-sm btn-outline-secondary">View logs</button>
      </div>
    </div>
  </div>
</main>
```

## After example

Passing pattern: same `ks-fe-banner` surface after `{...ksReactPrimitiveAttrs('ForgeStatusBanner')}` on the primitive root in `react/ForgeStatusBanner.tsx` — governed markers emitted from `KS_REACT_PRIMITIVE` in source.

```html
<main id="main" class="doc-main px-4 py-4">
  <div class="mx-auto doc-content" style="max-width:56rem">
    <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
      <p class="section-label text-cyan mb-2">Studio run</p>
      <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.25rem)">Docs health #8842</h1>
    </header>
    <div
      class="ks-fe-banner ks-fe-banner--failed mt-3"
      role="alert"
      hash="Fsb"
      data-ks-hash="Fsb"
      data-ks-type="react-primitive"
      data-ks-name="forge-status-banner"
      data-ks-react-root="true"
    >
      <div class="ks-fe-banner__body">
        <strong class="ks-fe-banner__title">Failed step</strong>
        <div class="ks-fe-banner__desc">Container argv drift detected. Resolve before approval.</div>
      </div>
      <div class="ks-fe-banner__actions">
        <button type="button" class="btn btn-sm btn-outline-secondary">View logs</button>
      </div>
    </div>
  </div>
</main>
```

## Evidence and remediation

1. **Detect:** `node tools/website-ux-auditor/analyze-website-ux.mjs --repo /path/to/forgesdlc-kitchensink` (repo phase), or `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.PRIMITIVE_SOURCE` after `python3 generator/build_rule_defect_fixtures.py` with `--repo` pointing at the overlay kitchensink root.
2. **Read findings:** `area: visual-catalog`, `evidence: tsx_source=react/<Component>.tsx`, message mentions missing **`ksReactPrimitiveAttrs()`** spread.
3. **Fix in source:** On each primitive root in `react/*.tsx`, add `import { ksReactPrimitiveAttrs } from './ksVisualAttrs'` and spread `{...ksReactPrimitiveAttrs('ComponentKey')}` where `ComponentKey` matches the `KS_REACT_PRIMITIVE` entry (see `docs/design/catalog/primitives/FAM-react-primitives.md`).
4. **Do not hand-roll** partial `data-ks-*` attrs — they drift from registry hashes and break **`DET.APP.PRIMITIVE_MARKERS`** even when styling looks correct.
5. **Add missing files:** If the map lists a key without `react/<Key>.tsx`, add the component file or remove the stale `KS_REACT_PRIMITIVE` row and registry entry together.
6. **Rebuild and re-check:** `python3 generator/build-showcase.py` when showcase embeds change; re-run repo scan, then DOM rules on `showcase/forge-react-primitives.html` or consumer app pages.

## Related rules

- `DET.APP.PRIMITIVE_MARKERS` — DOM scan confirms visible primitive roots emit the marker set that `ksReactPrimitiveAttrs()` provides.
- `DET.HASH.MARKERS` — all governed visual roots need paired `hash` / `data-ks-hash`, not only react primitives.
- `DET.APP.CONTROL_A11Y` — interactive primitives expose correct ARIA after the governed root exists.
- `DET.APP.PRIMITIVE_STYLES` — pages with primitive roots load `forge-react-primitives.css` and `ks-fe-*` presentation.
- `AI.APP.PRIMITIVE_CONSISTENCY` — judgment-heavy coherence across adjacent primitives on the same operator surface.
