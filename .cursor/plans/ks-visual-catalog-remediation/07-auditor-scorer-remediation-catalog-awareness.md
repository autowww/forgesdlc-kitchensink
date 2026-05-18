# Phase 07 — Auditor, scorer, and remediation plans ↔ catalog (evidence)

## Scope (completed)

- **DOM scan:** `lib/dom-metrics.js` collects `ksVisualHashReport` (valid hashes, invalid values, `hash` vs `data-ks-hash` mismatches, incomplete marker pairs, per-hash instance counts) plus `ksVisualHashes` (backward-compatible unique list).
- **Auditor check:** `checks/visual-catalog-awareness.js` uses only `lib/visual-catalog.js` (+ fs for contract file checks). Stable finding `id`s (e.g. `visual-catalog-unknown-hash`), `hash` / `selector` where applicable, messages cite `docs/design/catalog/visual-registry.generated.json`.
- **Scorer:** `score-website-ux.mjs` adds `visualCatalogCoverage` (from `summarizeVisualCatalogCoverage`) to `ux-quality-score.json` and a **KS visual catalog coverage** section in `ux-quality-score.md` via `buildUxQualityScoreMarkdown`.
- **Remediation plans:** `analyze-website-ux.mjs` Plan **07** includes `visualCatalogRemediationSection` for **known** hashes (contract paths + “update both implementation and contract” guidance) and lists `visual-catalog` findings.
- **Static-only audits:** `ksVisualHashReportFromHtmlBlob` seeds metrics from HTML sources when Playwright is off.
- **Independence:** No new imports between `analyze-website-ux.mjs` and `score-website-ux.mjs`; both consume shared `lib/visual-catalog.js` (generated JSON only, no YAML).

## Severity

- New **`warn`** step in `lib/severity.js` (between **major** and **minor**) for catalog alignment; `SCORE_WEIGHTS.warn = 14`, mapped into design rollup via `visualCatalogGovernance` when `area: visual-catalog`.

## Acceptance checks (2026-05-18)

Run from repo root:

```bash
cd tools/website-ux-auditor && npm test
```

**Result:** `pass` — 68 tests, 0 failures (Node built-in test runner).

**Spot-check scorer coverage output:** after a live crawl, open `ux-quality-score.md` (or JSON `visualCatalogCoverage`) under `--out`; with `visual-registry.generated.json` present you should see coverage ratio and known vs unknown hash lists.

## Fixtures

- `auditor-tests/fixtures/catalog-json-repo/` — single `Tst` entry.
- `auditor-tests/fixtures/catalog-dup-repo/` — duplicate `Dup` rows for registry duplicate finding (once per shared `ctx`).
