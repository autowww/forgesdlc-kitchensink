---
rule_id: DET.THEME.FONT_STACK
lane: deterministic
title: Theme font stacks (display, body, label, mono)
summary: Display, body, label, and monospace text roles must use approved theme font stacks from KS theme packs—not ad-hoc font-family overrides in consumer CSS or computed drift on live pages.
page_version: 855117ccb546d0ee21cc5acc6dc802220159feb9e559b67b64419387dde5768a
generated_at: 2026-05-29T18:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-theme-font_stack
related_rules:
  - DET.TOKEN.NO_DRIFT
  - DET.THEME.CONTRAST_MIN
  - DET.VISUAL.RHYTHM
  - AI.THEME.PERSONALITY_COHERENCE
  - AI.PREMIUM.ENTERPRISE_FEEL
---

## Purpose

Forge Kitchen Sink theme packs (`css/forge-theme.css`, `css/docs-theme.css`, `css/forgesdlc-theme.css`, and sanctioned pack variants) define **four text roles** through CSS custom properties:

| Role | Token(s) | Typical DOM |
|------|----------|-------------|
| **Display** | `--font-display` | `h1`, `h2`, `.font-display` |
| **Body** | `--bs-body-font-family`, `--font-body` | `body`, `main p`, `article p` |
| **Label** | `--font-label` | `nav a`, `.nav-link`, `button`, `.btn`, `.section-label` |
| **Mono** | `--font-mono` | `pre`, `code`, `.font-mono`, `.doc-mono` |

`DET.THEME.FONT_STACK` keeps consumer sites and app shells from drifting into one-off typefaces that pass token color scans but break brand rhythm. The check runs in the **metrics** phase (`det-theme-font-stack.check.js`): **Playwright** samples computed `font-family` on representative roles, and a **static CSS scan** flags raw `font-family` declarations under `css/` and `src/` that are outside the allowlist built from theme pack files. Theme pack basenames themselves are excluded from the drift scan.

**Plan:** Load a KS theme stylesheet on every surface; route typography through role classes (`.font-display`, `.font-label`, `.section-label`) or `var(--font-*)` tokens—not page-local face names. **Do:** Fix consumer CSS and remove inline `font-family` overrides. **Check:** Run `analyze-website-ux.mjs` on the site repo (or KS root for static scan). **Adjust:** Replace drift with `themeVarHint` targets (`var(--font-display)`, `var(--font-label)`, `var(--font-mono)`, `var(--bs-body-font-family)`).

## Passing signals

- `:root` / `html` computed stacks for `--font-display`, `--font-label`, `--font-mono`, and `--bs-body-font-family` match faces declared in loaded theme packs (for Forge dark: **Proxima Nova Black** / **Open Sans** display and label roles; **Courier New** mono).
- Headings use `.font-display` or inherit `var(--font-display)` without a competing `font-family` on the same element.
- Body copy in `main` / `article` resolves to the body stack (Open Sans via Bootstrap body token), not a stray serif or system UI-only override.
- Navigation and controls (`.forge-sidebar .nav-link`, `.btn`, `button`) resolve to the label stack (`var(--font-label)`).
- Code blocks (`pre`, `code`, `.doc-mono`) resolve to `var(--font-mono)`.
- Consumer CSS under `css/` or `src/` uses `font-family: var(--font-display)` (or other `FONT_TOKEN_VARS`) instead of literal face names like `"Comic Sans MS"` or `Georgia`.
- `fontStackReport` / `fontStackRepoReport` return zero violations; findings cap at **12** per pass (`MAX_FONT_STACK_FINDINGS`).
- Generic named fallbacks (Inter, Roboto, Helvetica, etc.) are tolerated only when no theme pack is present; once KS packs load, observed primaries must match the pack-derived allowlist.

## Failing signals

- **Computed drift (live page):** Playwright samples report `font_stack_drift` — e.g. `role=heading` with `observed="comic sans ms"` while `expectedRole=display`.
- **Static drift (repo CSS):** Non–theme-pack file declares `font-family: "Comic Sans MS", cursive` on a content selector (harness fixture: `css/harness-font-stack-drift.css` / `.harness-font-drift`).
- Inline `<style>` or `style="font-family: …"` on handbook/showcase markup overrides `.font-display` or `.forge-support` with unapproved primaries.
- Per-page CSS sets `font-family: Georgia, serif` on `.doc-main p` instead of inheriting body tokens.
- Vite/React `src/**/*.css` modules hard-code display faces that are not in the theme union.
- Finding message pattern: `Font stack drift on <role>: observed "<face>" is outside the approved <expectedRole> theme stack.` with evidence `font_stack_drift role=… expectedRole=… observed="…"`.
- Remediation hint in findings: `Set font-family via theme tokens (var(--font-display)|var(--font-label)|var(--font-mono)|var(--bs-body-font-family)) in shared theme CSS — not per-page inline overrides.`
- Passing this rule does **not** guarantee premium feel or personality cohesion — see AI rules below.

## Before example

Failing handbook fragment: a local stylesheet overrides display and body roles while KS utility classes are present. Auditors flag **computed** drift on `h1.font-display` and `p.forge-support`, and **static** drift if the same rules live in `css/harness-font-stack-drift.css`.

```html
<main id="main" class="doc-main px-4 py-4">
  <style>
    .drift-hero { font-family: "Comic Sans MS", cursive; }
    .drift-body { font-family: Georgia, "Times New Roman", serif; }
  </style>
  <header class="site-header mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
    <p class="section-label text-cyan mb-2">Typography</p>
    <h1 class="font-display drift-hero mb-2" style="font-size:clamp(1.75rem,4vw,2.5rem)">Wrong display stack</h1>
    <p class="forge-support drift-body mb-0">Body paragraph forced to Georgia—not the Forge body token.</p>
  </header>
  <div class="forge-card p-3">
    <nav class="forge-sidebar p-0" style="border:0;min-height:auto">
      <a href="#drift" class="nav-link active" style="font-family: Impact, Haettenschweiler, sans-serif">Nav link drift</a>
    </nav>
    <pre class="doc-mono mt-3 mb-0" style="font-family: Consolas, monospace">const drift = true;</pre>
  </div>
</main>
```

## After example

Passing fragment: typography comes only from loaded `forge-theme.css` role tokens—`.font-display`, `.section-label`, `.forge-support`, `.nav-link`, and `.doc-mono` without competing `font-family` overrides.

```html
<main id="main" class="doc-main px-4 py-4">
  <header class="site-header mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
    <p class="section-label text-cyan mb-2">Typography</p>
    <h1 class="font-display mb-2" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed display stack</h1>
    <p class="forge-support mb-3">Body copy inherits <code>var(--bs-body-font-family)</code> from the active theme pack.</p>
    <button type="button" class="btn btn-forge-cyan">Primary action</button>
  </header>
  <div class="forge-card p-3">
    <aside class="forge-sidebar p-3" style="border-radius:12px;border:1px solid var(--forge-border);min-height:120px">
      <p class="nav-section-label">Section</p>
      <div class="nav-rail">
        <a href="#pass" class="nav-link active">Label stack via theme</a>
      </div>
    </aside>
    <pre class="doc-mono mt-3 mb-0"><code>font-family: var(--font-mono);</code></pre>
  </div>
</main>
```

## Evidence and remediation

**Capture:** Store finding `evidence` (`font_stack_drift`, `role`, `expectedRole`, `observed`, `selector`, `path`, optional `url`) from `analyze-website-ux.mjs` output; for static violations attach the `css/…` or `src/…` file and selector from `scanCssTextForFontStackViolations`.

| Violation kind | Typical source | Remediation |
|----------------|----------------|-------------|
| `computed-font-family` | Live DOM / Playwright | Remove inline or scoped overrides; ensure theme CSS loads before content; use `.font-display` / `.section-label` / `.doc-mono` only. |
| `raw-font-family` | Consumer `css/`, `src/` | Replace literal stacks with `font-family: var(--font-display)` (or `--font-label`, `--font-mono`, `--bs-body-font-family`). |
| Drift on `navigation` / `control` | Custom nav CSS | Point selectors at `var(--font-label)`; match `.nav-link` / `.btn` patterns in `forge-theme.css`. |

**Remediation (PDCA):**

1. **Plan** — Identify which role drifted (`display`, `body`, `label`, `mono`) from `expectedRole` in the finding; open the active theme pack (`forge-theme.css` or site-linked pack) for sanctioned stacks.
2. **Do** — Delete ad-hoc `font-family` rules; add or extend shared theme CSS using `themeVarHint(expectedRole)`; for production sites use the UX fixer path that patches shared CSS (`repo-production.mjs` / `app-vite-react-fixer.mjs` import `themeVarHint` from this check).
3. **Check** — Regenerate defect fixtures if needed: `python3 generator/build_rule_defect_fixtures.py`; run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.THEME.FONT_STACK`; re-audit with `analyze-website-ux.mjs`.
4. **Adjust** — If a new face is intentional for a product pack, add it to a **theme pack** file listed in `THEME_PACK_BASENAMES` (not a random consumer stylesheet) so the allowlist includes the primary.

Module: `design-rules/deterministic/generated/det-theme-font-stack.check.js`. Default severity **warn**; score dimension **visualRhythmFirstScreen**.

## Related rules

- `DET.TOKEN.NO_DRIFT` — raw hex and non-token colors in consumer CSS; complements font stack governance on stylesheets.
- `DET.THEME.CONTRAST_MIN` — text/background contrast floors for readable body UI.
- `DET.VISUAL.RHYTHM` — spacing and section cadence on the same score dimension.
- `AI.THEME.PERSONALITY_COHERENCE` — judgment when token-legal typography still feels patchwork across sections.
- `AI.PREMIUM.ENTERPRISE_FEEL` — perceived finish and hierarchy beyond deterministic font allowlists.
