---
rule_id: DET.STUDIO.TITLE_NAV_MATCH
lane: deterministic
title: Studio title matches app rail
summary: Page H1 matches the active app-rail label so operators always know where they are.
page_version: d4a1c54ca76992afcee20e32ff8b24aaff0ba5d9aa9d21e0b996b45e1fc84164
generated_at: 2026-08-13T00:00:00.000Z
registry_status: documented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-studio-title_nav_match
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
---

## Purpose

Forge Studio SPAs use a persistent **app rail** (`.fc-app-rail`) plus a workspace **H1**. When the rail says **Watchlists** but the H1 says **Tickers**, operators lose sense of place and automated PDCA scoring flags a critical identity defect.

`DET.STUDIO.TITLE_NAV_MATCH` compares normalized text from `h1` and the active rail label (`.fc-app-rail__btn--active .fc-app-rail__label` or `[aria-current="page"]`). Rail subtitle mismatches are **minor** at most when H1 already matches the active destination.

**Plan:** Walk each route in the Studio manifest. **Do:** Rename H1 to match the active rail label; keep mechanism detail in the lead paragraph. **Check:** `page.json` shows matching `h1` and `active_rail_label`. **Adjust:** If marketing copy needs a longer title, shorten H1 and move prose to `p` below.

## Passing signals

- `h1` text equals active rail label after lowercasing and stripping punctuation (e.g. both **Watchlists**).
- `data-testid` on page header and rail active state for Playwright (`DET.STUDIO.TESTID`).
- Breadcrumb or tab selection agrees with H1 when present.

## Failing signals

- H1 **Tickers** with rail **Watchlists** (classic Forge Market defect).
- H1 empty while rail shows a label (`DET.STUDIO.H1` may also fire).
- H1 names a sub-tab job while rail names the parent hub without tabs demoting the mismatch.

## Before example

```html
<nav class="fc-app-rail" aria-label="App" data-ks-hash="Cap" data-ks-type="chrome-region">
  <button type="button" class="fc-app-rail__btn fc-app-rail__btn--active" aria-current="page">
    <span class="fc-app-rail__label">Watchlists</span>
  </button>
</nav>
<main class="fc-main" data-studio-workspace="watchlists">
  <header class="fc-page-header">
    <h1>Tickers</h1>
    <p class="text-muted">Harvest EDGAR filings into the pipeline API.</p>
  </header>
</main>
```

## After example

```html
<nav class="fc-app-rail" aria-label="App" data-ks-hash="Cap" data-ks-type="chrome-region">
  <button type="button" class="fc-app-rail__btn fc-app-rail__btn--active" aria-current="page">
    <span class="fc-app-rail__label">Watchlists</span>
  </button>
</nav>
<main class="fc-main" data-studio-workspace="watchlists" data-ks-hash="Wls">
  <header class="fc-page-header" data-testid="watchlists-header">
    <h1>Watchlists</h1>
    <p class="text-muted">Review and compare the issuers you are tracking.</p>
  </header>
</main>
```

## Evidence and remediation

- Studio UX PDCA: `tools/studio-ux-pdca/score-page.mjs` on `page.json` from `capture-page.mjs`.
- Remediation: rename H1 in the React page component; prefer KS `Cap` shell header slot.
- Related axis: `page_identity` in `assessment.json`.

## Related rules

- `DET.STUDIO.H1` — visible heading required before match can pass.
- `DET.APP.PERSISTENT_CHROME` — rail must persist across routes.
- `AI.APP.WORKFLOW_CONTINUITY` — judgment when chrome is stable but headings still confuse.
