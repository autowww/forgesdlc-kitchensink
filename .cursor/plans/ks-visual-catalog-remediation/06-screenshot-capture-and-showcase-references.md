# Phase 06 — Showcase screenshot capture and hosted references

Evidence for **capture-showcase-screenshots.mjs**, registry screenshot fields, mirrored `showcase/screenshots/`, and catalog validation.

## Acceptance (phase criteria)

| Criterion | Result |
|-----------|--------|
| Screenshot capture documented with runnable commands | Yes — [`docs/design/catalog/README.md`](../../../docs/design/catalog/README.md), [`docs/design/catalog/screenshots/README.md`](../../../docs/design/catalog/screenshots/README.md), header comments in `tools/design-catalog/capture-showcase-screenshots.mjs` |
| All showcase-rendered entries with `emit_marker_in_showcase: true` captured **or** explicit blocked/planned reasons | **48** hashes **captured** (every row with `emit_marker_in_showcase: true` and not `not-applicable` / `blocked`). **2** rows **`blocked`** with `screenshot_reason` (**Kra**, **Msm**) — not expected from static HTML capture |
| Registry / report reflects current capture | **`screenshot_status: captured`** + **`screenshot_url`** set for captured hashes in [`visual-registry.yaml`](../../../docs/design/catalog/visual-registry.yaml); machine report [`screenshot-capture-report.json`](../../../docs/design/catalog/screenshots/screenshot-capture-report.json) + [`screenshot-capture-report.md`](../../../docs/design/catalog/screenshots/screenshot-capture-report.md) |
| Deterministic enough for review | Playwright **`reducedMotion: reduce`**, injected CSS to zero transitions/animations, fixed **`deviceScaleFactor: 1`**, consistent viewports |
| Local capture without remote dependency | **`--serve-showcase`** uses Node **`http`** static server on loopback only |

## Screenshot status counts (registry)

Totals over **91** registry entries (from [`visual-registry-coverage.md`](../../../docs/design/catalog/visual-registry-coverage.md) after `check-visual-catalog.mjs`):

| screenshot_status | Count |
|-------------------|------:|
| captured | 48 |
| not-applicable | 41 |
| blocked | 2 |
| planned | 0 |
| missing | 0 |

**Blocked (explicit reasons in YAML):**

- **Kra** — Showcase React app sources; not a single static showcase HTML root for this pipeline.
- **Msm** — Museum studio Electron shell; not served as static showcase HTML.

## Hosted reference pattern

- Desktop: `https://ks.forgesdlc.com/showcase/screenshots/{HASH}.png`
- Mobile (produced locally): same path pattern `{HASH}.mobile.png`

Registry rows use **`screenshot_url`** for the desktop PNG. Mirroring to **`showcase/screenshots/`** (via `--mirror-to-showcase`) aligns the on-disk tree with that URL path when the showcase tree is deployed; deployment itself is out of scope for this phase.

## Commands run (evidence generation)

```bash
python3 generator/build-showcase.py
cd tools/design-catalog && npm ci && npx playwright install chromium
node capture-showcase-screenshots.mjs --repo ../.. --serve-showcase --update-registry --mirror-to-showcase
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase
bash tools/design-catalog/verify-bad-fixture.sh
cd tools/website-ux-auditor && npm test
```

## Tooling / policy updates (this phase)

- **`capture-showcase-screenshots.mjs`**: `--base-url` / `--showcase-url`, optional `--registry-json`, built-in **`--serve-showcase`**, desktop + mobile + light PNGs, JSON/MD report, **`--update-registry`**, **`--mirror-to-showcase`**, fallback pages for **Shw** / **Gly** when `showcase_url` was null.
- **`check-visual-catalog.mjs`**: `screenshot_status` **`blocked`** allowed; same documentation requirement as `planned` / `missing` (URL, notes, or `screenshot_reason`).
- **Registry**: **`showcase_url`** set for **Shw**, **Gly**; **Kra** / **Msm** moved to **`blocked`** with **`screenshot_reason`**.

## Artifact counts (this run)

- **PNG files mirrored to `showcase/screenshots/`:** 144 (= 48 hashes × 3 variants: desktop dark, desktop light, mobile dark).
