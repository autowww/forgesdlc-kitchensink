---
rule_id: DET.THEME.CONTRAST_MIN
lane: deterministic
title: Theme contrast minimum (WCAG AA)
summary: Body UI text, links, headings, list items, and CTA labels sampled during metrics must meet WCAG AA contrast against their resolved background (4.5:1 normal, 3:1 at 24px+).
page_version: 97c147779f5f6f04f6305f426ad1aebad6f7de5ded7de9b6d052f38d8f737141
generated_at: 2026-05-29T12:00:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-theme-contrast_min
related_rules:
  - DET.TOKEN.NO_DRIFT
  - DET.THEME.FONT_STACK
  - DET.SURFACE.ELEVATION_TOKEN
  - AI.THEME.PERSONALITY_COHERENCE
  - AI.AMBIENT.READABILITY_CONFLICT
---

## Purpose

Kitchen Sink pages rely on `css/forge-theme.css` tokens (`--forge-bg`, `--forge-text`, `--forge-text-2`, `--forge-surface`, `--forge-border`) so body copy, cards, and CTAs stay readable on dark product shells. When authors override colors with ad-hoc hex on `forge-card`, `forge-support`, or `btn btn-forge`, computed foreground/background pairs can fall below WCAG AA even though the markup looks fine at a glance.

`DET.THEME.CONTRAST_MIN` runs in the **metrics** phase. The check samples visible body UI nodes matching `p, a, button, h1, h2, h3, li`, walks up the DOM for the first opaque background, and compares the contrast ratio to WCAG AA thresholds: **4.5:1** for text under **24px**, **3:1** for text at **24px** and above. Up to **12** low-contrast samples are reported per page (`MAX_CONTRAST_FINDINGS`).

**Plan:** Audit hero copy, catalogue cards, handbook `doc-main` bands, and CTA rows for inline `color` / `background` overrides or muted-on-muted pairings. **Do:** Restore token-backed pairs from `forge-theme.css` (or approved theme variants) instead of one-off grays. **Check:** Re-run the website UX auditor and confirm `metrics.contrastReport.lowContrast` (or `metrics.lowContrast`) is empty. **Adjust:** If a band needs a softer look, use semantic classes (`text-dim`, `text-dim-2`) on approved surfaces—not arbitrary mid-gray stacks.

## Passing signals

- Sampled `p`, `a`, `button`, `h1`–`h3`, and `li` nodes report contrast at or above **4.5:1** (normal size) or **3:1** (computed `font-size` at or above 24px).
- `forge-support`, `text-dim`, and `text-dim-2` appear on `--forge-bg` or `--forge-surface` without inline hex overrides.
- `forge-card` blocks use default `color: var(--forge-text)` on `background: var(--forge-surface)`; headings inherit `--forge-text`.
- Primary actions use `btn btn-forge` with theme button colors—not custom gray fills that shrink contrast against the card or page background.
- `metrics.contrastReport.sampleCount` is positive and `lowContrast` is `[]` (or absent) after crawl/metrics collection.
- No findings with evidence `low_contrast tag=… ratio=… threshold=…`.

## Failing signals

- Inline styles force similar mid-grays on text and panel (e.g. `#5a5a5a` on `#606060`)—typical ratio under **2:1**, well below the **4.5:1** normal-text floor.
- `forge-support` or `text-muted-4` copy placed on a custom `background` that is only slightly darker than the text color.
- `btn btn-forge` with overridden `color` / `background` that fails against the resolved parent surface.
- Findings message: `Body UI text has insufficient contrast (N:1) against its background; WCAG AA requires at least T:1 for this font size.` with **major** severity.
- Evidence includes `low_contrast`, `tag=p|a|button|h2|…`, `ratio=…`, `size=…px`, `threshold=4.5` or `threshold=3`, and a short `text="…"` snippet.
- Page may still pass `DET.TOKEN.NO_DRIFT` (no forbidden hex in static CSS) if overrides live only in inline styles or runtime CSS—contrast is a separate gate.

## Before example

Failing KS markup: a catalogue-style `forge-card` with ad-hoc gray text and CTA colors on a custom mid-gray panel—body UI samples fall below WCAG AA.

```html
<main id="main" class="doc-main px-4 py-4">
  <div class="forge-card p-3" style="background:#606060">
    <p class="card-label mb-1">Outcome</p>
    <h3 class="font-display mb-2" style="color:#6a6a6a">Governed delivery</h3>
    <p class="forge-support mb-3" style="color:#5a5a5a">
      Supporting copy washed out on a one-off panel—contrast below 4.5:1 for 13px body text.
    </p>
    <a
      class="btn btn-forge"
      href="/quickstart"
      style="color:#707070;background:#808080"
    >Start quickstart</a>
  </div>
</main>
```

## After example

Passing KS markup: the same card anatomy uses theme tokens only—`forge-card`, `forge-support`, and `btn btn-forge` resolve to approved foreground/background pairs.

```html
<main id="main" class="doc-main px-4 py-4">
  <div class="forge-card breathe-static p-3 h-100 d-flex flex-column">
    <p class="card-label mb-1">Outcome</p>
    <h3 class="font-display mb-2">Governed delivery</h3>
    <p class="forge-support mb-3">
      Token-backed supporting copy on <code>--forge-surface</code> meets WCAG AA for sampled body UI.
    </p>
    <a class="btn btn-forge mt-auto align-self-start" href="/quickstart">Start quickstart</a>
  </div>
</main>
```

## Evidence and remediation

| Evidence | Meaning |
|----------|---------|
| `low_contrast tag=p ratio=2.1 size=13px threshold=4.5` | Normal body text; needs at least 4.5:1 |
| `low_contrast tag=h2 ratio=2.8 size=28px threshold=3` | Large heading; needs at least 3:1 |
| `text="Supporting copy washed…"` | First ~80 characters of the failing node |

**Remediation steps**

1. Remove inline `color` / `background` overrides on `forge-card`, `forge-support`, `text-dim*`, and `btn-forge` unless a design contract documents an approved pair.
2. Prefer `var(--forge-text)`, `var(--forge-text-2)`, `var(--forge-bg)`, and `var(--forge-surface)` from `forge-theme.css` (or the active consumer theme pack).
3. For softer hierarchy, use `text-dim` / `text-dim-2` on default surfaces—do not invent new gray hex values.
4. After theme fixes, rebuild the site (`python3 generator/build-site.py` or the consumer documented build) and re-run `node tools/website-ux-auditor/analyze-website-ux.mjs …`, or `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.THEME.CONTRAST_MIN` with `generator/build_rule_defect_fixtures.py` fixtures.
5. Pilot fixer: `DET.THEME.CONTRAST_MIN` maps to page-mode patches in `lib/ux-deterministic-fixers/fixers/patch-registry.mjs` when remediation plans are generated.

## Related rules

- `DET.TOKEN.NO_DRIFT` — forbids raw hex outside the token allowlist in static CSS; does not replace live contrast sampling.
- `DET.THEME.FONT_STACK` — display/body/mono stacks must match approved tokens; readable contrast still required per pair.
- `DET.SURFACE.ELEVATION_TOKEN` — elevation shadows and surfaces must use tokens; text on those surfaces must still pass contrast sampling.
- `AI.THEME.PERSONALITY_COHERENCE` — judgment when token-legal palettes still feel patchwork or off-brand.
- `AI.AMBIENT.READABILITY_CONFLICT` — judgment when ambient layers or weak scrims undermine readability beyond ratio thresholds.
