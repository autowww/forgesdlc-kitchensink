---
rule_id: DET.PAGE.LANG
lane: deterministic
title: Document language declaration
summary: The root html element declares a BCP 47 language tag so assistive tech, hyphenation, and translation tools can infer the page's primary language.
page_version: 44c6f35dae6a383cc76fab9c0dca814bfe8c1309ffa6bd28a6473d44f81cad9e
generated_at: 2026-05-25T14:32:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-page-lang
related_rules:
  - DET.PAGE.TITLE
  - DET.PAGE.VIEWPORT
  - DET.LANDMARKS.REQUIRED
  - DET.PAGE.MODE
---

## Purpose

Screen readers, browser translation, spell-check, and hyphenation all use the **document language** on the root `<html>` element. Without it, assistive tech may guess wrong pronunciation, and mixed-language pages lose a reliable default for embedded content.

Kitchen Sink layouts (`handbook_page`, `chapter_page`, `product_page`, `landing_page`, showcase shells) emit **`lang` from Python** — typically **`html lang="en"`** via the `html_lang` parameter on `handbook_page`. Consumer site generators should pass the same value they use for visible copy and SEO `og:locale` hints.

This deterministic rule runs in the **metrics** phase. The crawler reads `document.documentElement.getAttribute('lang')`. A page **passes** when that attribute is present and non-empty (any valid BCP 47 tag, e.g. `en`, `en-US`). A page **fails** when `lang` is missing or empty.

**Plan:** Decide the primary locale per site SKU before shipping HTML. **Do:** Set `html_lang` in layout calls and verify generated `website/` output. **Check:** `metrics.lang` is truthy in audit output. **Adjust:** Add `lang` on the root element in templates, partials, or SPA shells that currently emit bare `<html>`.

## Passing signals

- Root element is **`<html lang="en">`** (or another declared tag such as `en-US`, `fr`, `de`) on every full document shell.
- **`handbook_page`** output includes `lang="{html_lang}"` with default **`html_lang="en"`** in `layouts.py`.
- **`chapter_page`**, **`product_page`**, and marketing shells match the same pattern — language is on `<html>`, not only on inner `main` or `p` nodes.
- Audit metrics report **`lang: "en"`** (or the chosen tag); `DET.PAGE.LANG` produces no findings.
- Language tag aligns with visible body copy (English handbook pages use `en`, not a mismatched locale).

## Failing signals

- **Missing attribute:** `<html>` with no `lang` — common when a minimal HTML stub or client-rendered shell omits the root declaration.
- **Empty attribute:** `<html lang="">` — treated as absent; `metrics.lang` is falsy.
- **Wrong placement:** `lang` only on `<main>` or a wrapper `div` — the check reads **`document.documentElement`** only; inner attributes do not satisfy the rule.
- **Generator drift:** Python layout sets `html_lang` but a consumer override strips it during post-processing or static export.
- Auditor evidence: *"The document lang attribute is missing."* with *`<html lang> not found.`*

## Before example

Failing KS markup: handbook-style shell mirrors `handbook_page` anatomy (`forge-aurora`, skip link, sidebar, `main#main`) but the root omits `lang`, so assistive tech has no document default.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Forge SDLC — Governed delivery handbook</title>
  <link rel="stylesheet" href="assets/forge-theme.css" />
</head>
<body>
  <div class="forge-aurora"></div>
  <a href="#main" class="skip-link">Skip to content</a>
  <div class="container-fluid px-0">
    <div class="row g-0 flex-lg-nowrap min-vh-100">
      <aside class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0">
        <nav class="nav-scroll px-2 py-3" aria-label="Primary navigation">
          <p class="nav-section-label">Handbook</p>
          <a href="/docs/start" class="nav-link active">Getting started</a>
          <a href="/docs/govern" class="nav-link">Governance</a>
        </nav>
      </aside>
      <main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pt-lg-5 pb-5">
        <div class="mx-auto doc-content" style="max-width:56rem">
          <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
            <p class="section-label text-cyan mb-2">Methodology</p>
            <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed human + agent delivery</h1>
            <p class="forge-support mt-2 mb-0" style="font-size:1rem">English prose with no root language declaration.</p>
          </header>
          <div class="forge-card p-3">
            <p class="card-label mb-1">Outcome</p>
            <p class="forge-support mb-0">Screen readers cannot infer document language from the html root.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</body>
</html>
```

## After example

Passing KS markup: same handbook shell with **`html lang="en"`** as emitted by `handbook_page` when `html_lang="en"` is passed through the layout.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Forge SDLC — Governed delivery handbook</title>
  <link rel="stylesheet" href="assets/forge-theme.css" />
</head>
<body>
  <div class="forge-aurora"></div>
  <a href="#main" class="skip-link">Skip to content</a>
  <div class="container-fluid px-0">
    <div class="row g-0 flex-lg-nowrap min-vh-100">
      <aside class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0">
        <nav class="nav-scroll px-2 py-3" aria-label="Primary navigation">
          <p class="nav-section-label">Handbook</p>
          <a href="/docs/start" class="nav-link active">Getting started</a>
          <a href="/docs/govern" class="nav-link">Governance</a>
        </nav>
      </aside>
      <main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pt-lg-5 pb-5">
        <div class="mx-auto doc-content" style="max-width:56rem">
          <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
            <p class="section-label text-cyan mb-2">Methodology</p>
            <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed human + agent delivery</h1>
            <p class="forge-support mt-2 mb-0" style="font-size:1rem">Document language matches English body copy.</p>
          </header>
          <div class="forge-card p-3">
            <p class="card-label mb-1">Outcome</p>
            <p class="forge-support mb-0">Assistive tech and translation tools read lang from the html root.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</body>
</html>
```

## Evidence and remediation

| Evidence | Meaning | Remediation |
|----------|---------|-------------|
| `metrics.lang` empty in crawl JSON | Root `lang` missing or blank | Add `<html lang="en">` (or site locale) in the layout template |
| Finding: *document lang attribute is missing* | `lang.check.js` failed | Set `html_lang` on `handbook_page` / other `layouts.py` callers; rebuild consumer `website/` |
| Raw HTML lacks `lang=` on first `<html>` | Post-build regression | Fix generator or export step that strips attributes |

**Kitchen Sink:** Pass `html_lang="en"` (or the handbook locale) into `handbook_page(..., html_lang=...)`. Confirm `generator/build-showcase.py` and consumer builds emit `lang` on the first line of the document element.

**Consumer sites:** After layout fixes, run `python3 generator/build-site.py` (or handbook build), then re-audit. Spot-check: `curl -s … | head -n 3` should show `<html lang="…">`.

**Harness:** `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.PAGE.LANG` for regression. Implementation: `tools/website-ux-auditor/design-rules/deterministic/page/lang.check.js`.

## Related rules

- **DET.PAGE.TITLE** — non-empty, descriptive `<title>` (same metadata-a11y bundle).
- **DET.PAGE.VIEWPORT** — responsive viewport meta for web pages.
- **DET.LANDMARKS.REQUIRED** — semantic `main`, `nav`, `header`, `footer` landmarks (often audited on the same handbook shells).
- **DET.PAGE.MODE** — single primary page mode above the fold; language declaration is independent but fixed in the same layout contracts.
