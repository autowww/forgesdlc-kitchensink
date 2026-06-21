---
rule_id: DET.APP.PRIMITIVE_MARKERS
lane: deterministic
title: React primitive KS markers
summary: Every visible KS React primitive root emits hash, data-ks-hash, data-ks-type, data-ks-name, and data-ks-react-root per ksReactPrimitiveAttrs().
page_version: bea28d34baf7530df4a75aaa0348712067b5ef581b6de321e9b1986ab50d8f62
generated_at: 2026-05-28T18:30:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primitive_markers
related_rules:
  - DET.HASH.MARKERS
  - DET.APP.PRIMITIVE_SOURCE
  - DET.APP.CONTROL_A11Y
  - DET.APP.PRIMITIVE_STYLES
  - AI.APP.PRIMITIVE_CONSISTENCY
---

## Purpose

Kitchen Sink **React primitives** (`ForgeStatusBanner`, `ForgeWorkflowStageBar`, `WorkspaceLensControl`, and siblings in `react/*.tsx`) are governed catalog surfaces. Each primitive mounts at a single DOM root that must expose the same marker contract as Python `ks_hash_attrs()` outputs, plus a React-specific root flag. The helper **`ksReactPrimitiveAttrs(componentKey)`** in `react/ksVisualAttrs.ts` spreads:

- `hash` and `data-ks-hash` — the child hash from `KS_REACT_PRIMITIVE` (for example **Fsb** for `ForgeStatusBanner`)
- `data-ks-type="react-primitive"`
- `data-ks-name` — registry slug (for example `forge-status-banner`)
- `data-ks-react-root="true"` — so auditors and catalog tooling can select primitive roots

This deterministic rule scans **visible** primitive roots in built HTML (`collectAppPrimitiveMarkersReport` in `design-rules/deterministic/generated/det-app-primitive-markers.check.js`). It does not judge visual polish or ARIA quality — those are **`DET.APP.CONTROL_A11Y`** and **`AI.APP.PRIMITIVE_CONSISTENCY`**. Source spreading is **`DET.APP.PRIMITIVE_SOURCE`**.

**Plan:** Add or edit a primitive in `react/` and register its hash in `docs/design/catalog/visual-registry.yaml`. **Do:** Spread `ksReactPrimitiveAttrs('ComponentKey')` on the outermost primitive element (see `react/ForgeStatusBanner.tsx`). **Check:** Run `node tools/website-ux-auditor/analyze-website-ux.mjs` on `showcase/forge-react-primitives.html` or consumer app pages that mount primitives. **Adjust:** Fix markers before registry row or stylesheet issues — a root can fail here while still missing `forge-react-primitives.css` (**`DET.APP.PRIMITIVE_STYLES`**).

## Passing signals

- Every visible root matching `[data-ks-react-root="true"]` or `[data-ks-type="react-primitive"]` carries **`hash`**, **`data-ks-hash`**, **`data-ks-type="react-primitive"`**, **`data-ks-name`**, and **`data-ks-react-root="true"`** with matching hash values.
- Hash tokens are exactly three **distinct** ASCII letters (`/^[A-Za-z]{3}$/` with `new Set(hash).size === 3`), aligned with `KS_REACT_PRIMITIVE` in `ksVisualAttrs.ts` (for example **Fsb**, **Fwb**, **Wlc**).
- `data-ks-name` matches the registry slug for that component (for example `forge-status-banner`, not a placeholder like `chip`).
- `appPrimitiveMarkersReport.violations` is empty; `primitiveRootCount` reflects the number of governed roots on the page.
- Showcase and ecosystem embeds (for example `showcase/ux-audit-ecosystem-examples.html`) show paired markers on `ks-fe-banner`, `ks-fe-stagebar`, `ks-fe-run-header`, and related `ks-fe-*` roots.
- Passing this rule does **not** imply the hash is registered (**`DET.HASH.REGISTRY_ROW`**) or that paired `hash` / `data-ks-hash` on non-primitive visual roots pass globally — see **`DET.HASH.MARKERS`** for all governed surfaces.

## Failing signals

- **`missing-data-ks-hash` (minor):** Root has `data-ks-type="react-primitive"` but no `data-ks-hash` (common when someone hand-pastes markup or omits the spread).
- **`invalid-data-ks-hash` (warn):** Value is not three distinct letters — for example `data-ks-hash="abcd"` or `data-ks-hash="Aaa"`.
- **`missing-data-ks-type` / `wrong-data-ks-type` (minor):** Attribute absent or set to `component` / other type instead of `react-primitive`.
- **`missing-data-ks-name` (minor):** Slug missing so remediation cannot tie the node to `FAM-react-primitives.md` or a child contract.
- **`missing-hash-attr` / `hash-mismatch` (minor / warn):** `data-ks-hash` without `hash=`, or `hash="Fsb"` with `data-ks-hash="Bad"` on the same root.
- **`missing-react-root-flag` (minor):** `data-ks-type="react-primitive"` without `data-ks-react-root="true"` (skipping `ksReactPrimitiveAttrs()`).
- Hidden or `aria-hidden` subtrees are skipped; findings cap at **`MAX_APP_PRIMITIVE_MARKERS_FINDINGS` (10)** per page with an "additional issues omitted" tail when many roots break at once.

## Before example

Failing operator surface: `ForgeStatusBanner` styling is present (`ks-fe-banner`, variant modifier, internal `ks-fe-banner__*` structure) and the node is flagged as a react root, but governed hash markers and `data-ks-name` were never emitted. Crawl reports `missing-data-ks-hash`, `missing-data-ks-name`, and `missing-hash-attr`.

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

Passing primitive root (same surface as `react/ForgeStatusBanner.tsx` after `ksReactPrimitiveAttrs('ForgeStatusBanner')`): paired **Fsb** markers, react-primitive type, registry slug, and root flag on the outer `ks-fe-banner` element.

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

1. **Detect:** `node tools/website-ux-auditor/analyze-website-ux.mjs --url …` or harness `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.PRIMITIVE_MARKERS` after `generator/build_rule_defect_fixtures.py`.
2. **Read findings:** Look for `area: visual-catalog`, `kind=` in evidence (`missing-data-ks-hash`, `hash-mismatch`, etc.), and selectors like `[data-ks-hash="Fsb"]` when the hash is known.
3. **Fix in source:** On each primitive root in `react/*.tsx`, spread `{...ksReactPrimitiveAttrs('ComponentKey')}` where `ComponentKey` exists in `KS_REACT_PRIMITIVE` (see `docs/design/catalog/primitives/FAM-react-primitives.md`).
4. **Do not hand-roll** partial attrs — copy the full spread so `hash`, `data-ks-hash`, `data-ks-type`, `data-ks-name`, and `data-ks-react-root` stay aligned.
5. **Rebuild:** `python3 generator/build-showcase.py` when showcase or static embeds change; re-run the DET harness or sitewide UX audit.
6. **Escalate:** If markers pass but surfaces look unstyled or Bootstrap mixes in, fix **`DET.APP.PRIMITIVE_STYLES`** / **`DET.APP.SHELL_INTEGRATION`**; if ARIA is wrong, fix **`DET.APP.CONTROL_A11Y`**.

## Related rules

- `DET.HASH.MARKERS` — all governed visual roots need paired `hash` / `data-ks-hash`; this rule specializes react-primitive roots and `data-ks-react-root`.
- `DET.APP.PRIMITIVE_SOURCE` — repo scan ensures each `KS_REACT_PRIMITIVE` `.tsx` spreads `ksReactPrimitiveAttrs()` in source.
- `DET.APP.CONTROL_A11Y` — interactive primitives expose correct ARIA roles, labels, and keyboard behavior after markers exist.
- `DET.APP.PRIMITIVE_STYLES` — pages with primitive roots load `forge-react-primitives.css` and `ks-fe-*` presentation.
- `AI.APP.PRIMITIVE_CONSISTENCY` — judgment-heavy coherence across adjacent primitives on the same operator surface.
