---
rule_id: DET.TOKEN.NO_DRIFT
lane: deterministic
title: Design token no drift
summary: Consumer-bound CSS under css/ must not declare raw hex colors outside the theme-pack allowlist; use --forge-* custom properties or define new tokens in sanctioned theme files.
page_version: 53a3887c59e39d84ed2ca7f199dbceec852ca7bc4163d428d8cbb997c8fab24c
generated_at: 2026-05-29T20:15:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-token-no_drift
related_rules:
  - DET.THEME.CONTRAST_MIN
  - DET.THEME.FONT_STACK
  - DET.SURFACE.ELEVATION_TOKEN
  - DET.KS.CSS_SCOPE_LEAK
  - AI.THEME.PERSONALITY_COHERENCE
  - AI.PREMIUM.ENTERPRISE_FEEL
---

## Purpose

Kitchen Sink ships canonical color tokens in theme packs (`css/forge-theme.css`, `css/docs-theme.css`, `css/forgesdlc-theme.css`, and related pack basenames). Those files are the **only** sanctioned place to author raw `#` literals that define the Forge palette (`--forge-bg`, `--forge-cyan`, `--forge-amber`, `--forge-text`, and siblings).

When feature stylesheets under `css/` add one-off hex values—magenta accents on `.forge-card`, custom panel backgrounds, or neon borders on CTA bands—the visual system drifts across consumer sites. Remediation cannot grep a single token table, and AI theme reviews inherit patchwork palettes that still pass contrast checks.

`DET.TOKEN.NO_DRIFT` runs in the **metrics** phase when token-drift policy is enabled (default: repos with a `css/` directory). The check statically scans **`css/*.css`**, builds a hex allowlist from theme-pack files, and flags declarations that use raw `#` outside that allowlist. Up to **12** violations per pass (`MAX_TOKEN_DRIFT_FINDINGS`). Default severity: **warn**.

**Sanctioned hex usage (not flagged):**

- Declarations inside theme-pack basenames (`forge-theme.css`, `docs-theme.css`, `forgesdlc-pack-*.css`, etc.).
- Custom property definitions whose names start with `--` (token sources in packs).
- Hex literals inside `var(--token, #fallback)` fallback spans.
- Hex values already present in the theme-pack allowlist when reused in other `css/` files.

**Skipped:** `@keyframes` blocks.

**Plan:** Inventory feature CSS for `#` literals. **Do:** Replace with `var(--forge-*)` or add the value to a theme pack `--*` definition. **Check:** Re-run the auditor or harness with an empty `tokenDriftReport`. **Adjust:** Pair with `DET.SURFACE.ELEVATION_TOKEN` when the same file mixes raw rgba shadows with off-palette hex.

## Passing signals

- Feature CSS (e.g. `css/nested-roadmap.css`, `css/script-assembly.css`) references `var(--forge-cyan)`, `var(--forge-amber)`, `var(--forge-text-2)`, `var(--forge-surface)`, and `var(--forge-border)` instead of raw hex on selectors.
- New palette values are added as `--forge-*` or `--ks-*` definitions inside a theme pack file, then consumed elsewhere via `var(...)`.
- `var(--forge-cyan, #06B6D4)` fallback hex matches an allowlisted theme-pack literal.
- Repo scan reports `allowlistSize > 0` and `violations: []` when policy is enabled.
- No findings with evidence `raw_hex_outside_allowlist` plus `path=css/…`, `selector="…"`, `property=…`, `hex=#…`.
- Markup uses KS classes (`forge-card`, `forge-support`, `btn btn-forge`, `glass`, `font-display`) without requiring per-page hex in consumer CSS.

## Failing signals

- Feature file such as `css/harness-token-drift.css` with `.harness-drift { color: #ff00ff; background: #00ff00; }`—colors outside the theme allowlist.
- Selectors targeting `.forge-card`, `.glass`, or product bands with `color: #e879f9`, `border-color: #b4c0ff`, or `background: #0d1a2e` when those hex values are not defined in a theme pack and not in a `var()` fallback span.
- Findings message: *Raw hex color #… is used outside the theme token allowlist; prefer var(--forge-*) or other sanctioned design tokens.*
- Evidence includes `raw_hex_outside_allowlist`, `path=css/<file>`, `selector="…"`, `property=color|background|border-color|…`, and `hex=#…`.
- Policy skipped only when `tokenNoDriftPolicy` / `enforceTokenNoDrift` is explicitly `false` or the repo has no `css/` directory.
- **Not flagged:** hex inside theme-pack basenames; `--forge-*: #…` token definitions; allowlisted reuse; keyframe animations.
- Inline HTML `style="color:#…"` is out of scope for the repo CSS scan—use `DET.THEME.CONTRAST_MIN` for live contrast on overrides; still avoid inline hex for maintainability.

## Before example

Failing KS markup: a catalogue card styled by feature CSS that invents off-palette hex instead of Forge tokens (mirrors harness fixture `css/harness-token-drift.css`).

```html
<!DOCTYPE html>
<html lang="en" data-forge-theme="forge">
<head>
  <meta charset="utf-8">
  <title>Token drift — feature CSS</title>
  <link rel="stylesheet" href="/assets/forge-theme.css">
  <style>
    /* Consumer feature sheet — raw hex outside theme allowlist */
    .outcome-ribbon {
      border-left: 3px solid #ff00ff;
      color: #b4c0ff;
    }
    .forge-card.card-cyan {
      background: #0d1a2e;
    }
  </style>
</head>
<body>
<main id="main" class="doc-main px-4 py-4">
  <div class="row g-3">
    <div class="col-md-6">
      <div class="forge-card card-cyan breathe-static p-3 outcome-ribbon">
        <p class="card-label mb-1">Outcome</p>
        <h3 class="font-display mb-2">Off-palette accent</h3>
        <p class="forge-support mb-3">
          Feature CSS uses #ff00ff / #b4c0ff / #0d1a2e — DET.TOKEN.NO_DRIFT flags the stylesheet scan.
        </p>
        <a class="btn btn-forge mt-auto align-self-start" href="/quickstart">Start quickstart</a>
      </div>
    </div>
  </div>
</main>
</body>
</html>
```

## After example

Passing KS markup: the same card anatomy uses theme custom properties only; hex lives in `forge-theme.css`, not feature selectors.

```html
<!DOCTYPE html>
<html lang="en" data-forge-theme="forge">
<head>
  <meta charset="utf-8">
  <title>Token-backed feature CSS</title>
  <link rel="stylesheet" href="/assets/forge-theme.css">
  <style>
    .outcome-ribbon {
      border-left: 3px solid var(--forge-cyan);
      color: var(--forge-text-2);
    }
    .forge-card.card-cyan {
      background: var(--forge-surface-2);
      border-color: var(--forge-border);
    }
    .forge-card.card-cyan:hover {
      box-shadow: var(--forge-glow-cyan);
    }
  </style>
</head>
<body>
<main id="main" class="doc-main px-4 py-4">
  <div class="row g-3">
    <div class="col-md-6">
      <div class="forge-card card-cyan breathe-static p-3 outcome-ribbon">
        <p class="card-label mb-1">Outcome</p>
        <h3 class="font-display mb-2">Token-backed accent</h3>
        <p class="forge-support mb-3">
          Cyan rail, surface, and hover glow from sanctioned --forge-* variables.
        </p>
        <a class="btn btn-forge mt-auto align-self-start" href="/quickstart">Start quickstart</a>
      </div>
    </div>
  </div>
</main>
</body>
</html>
```

## Evidence and remediation

| Evidence | Meaning |
|----------|---------|
| `raw_hex_outside_allowlist path=css/harness-token-drift.css` | Violation in a non-pack stylesheet under `css/` |
| `selector=".harness-drift"` | Rule selector containing the raw hex |
| `property=color` | Declaration property with the off-allowlist literal |
| `hex=#ff00ff` | Normalized hex (3-digit shorthand expanded to 6) |

**Remediation steps**

1. **Locate** the reported `css/<file>` and selector; grep the repo for the `hex=` value from the finding.
2. **Replace** raw literals with the closest semantic token: `var(--forge-text)`, `var(--forge-text-2)`, `var(--forge-cyan)`, `var(--forge-amber)`, `var(--forge-surface)`, `var(--forge-bg)`, `var(--forge-border)`.
3. If the color is genuinely new, **add** a `--forge-*` (or `--ks-*`) definition in `css/forge-theme.css` or the active theme pack, then reference it from feature CSS—do not copy hex into `css/nested-roadmap.css`, `css/script-assembly.css`, or other feature files.
4. For `var(--token, #fallback)` patterns, ensure fallback hex appears in the theme-pack allowlist.
5. Rebuild consumer sites when CSS changes ship (`python3 generator/build-showcase.py` for KS; consumer documented builds elsewhere), then re-run `node tools/website-ux-auditor/analyze-website-ux.mjs …`, or `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.TOKEN.NO_DRIFT` after `python3 generator/build_rule_defect_fixtures.py`.
6. Pilot fixer: `DET.TOKEN.NO_DRIFT` maps to repo-production remediation in `lib/ux-deterministic-fixers/fixers/patch-registry.mjs` when plans are generated.

## Related rules

- `DET.THEME.CONTRAST_MIN` — samples live foreground/background contrast; token-legal pairs can still fail WCAG AA.
- `DET.THEME.FONT_STACK` — display/body/mono stacks must match approved tokens; complements stylesheet governance.
- `DET.SURFACE.ELEVATION_TOKEN` — raw rgba `box-shadow` on surface selectors must use elevation tokens; often fixed in the same feature CSS pass.
- `DET.KS.CSS_SCOPE_LEAK` — KS stylesheet rules must not bleed into unrelated consumer markup.
- `AI.THEME.PERSONALITY_COHERENCE` — judgment when allowlisted tokens still feel patchwork or off-brand.
- `AI.PREMIUM.ENTERPRISE_FEEL` — judgment on perceived finish once deterministic token drift is cleared.
