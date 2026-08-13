---
rule_id: DET.HTML.EMPTY_INLINE
lane: deterministic
title: Empty inline emphasis in main
summary: Main content must not contain empty strong or em tags—common when autodoc table focus rows or Markdown transforms emit emphasis wrappers without visible text.
page_version: 0b7168d011bcb26941e8be75536667a1d7704109261819dbd13e3dad0093263c
generated_at: 2026-05-25T11:30:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-html-empty-inline
---

## Purpose

Handbook and product pages built with **forge-autodoc** and Kitchen Sink transforms (`components/transforms.py` **`enhance_tables`**, `render_table` in `components/components.py`) often wrap table focus cells or Markdown emphasis in **`<strong>`** or **`<em>`**. When a generator bug, partial Markdown parse, or placeholder row leaves the wrapper with **no trimmed text**, the tag still appears in the DOM but announces nothing to screen readers and adds noise to accessibility semantics scans.

This deterministic rule evaluates **`main#main`** (or the first **`main`** landmark) only. It counts **`<strong>`** and **`<em>`** elements whose **`textContent`**, with whitespace collapsed, is empty. Empty **`<strong>`** findings are **minor**; empty **`<em>`** are **trivial**. Content outside **`main`** (header chrome, sidebars) is out of scope.

**Plan:** Crawl handbook chapters, token grids, and comparison tables inside **`doc-main`**. **Do:** Fix transforms so emphasis tags wrap real labels or omit the tag when there is no focus text. **Check:** `metrics.emptyInlineReport` reports zero counts. **Adjust:** Pair with **`DET.DATA.TABLE_HEADERS`** when table structure also lacks scoped headers.

## Passing signals

- Every **`<strong>`** / **`<em>`** inside **`main`** contains at least one non-whitespace character (visible text or `.sr-only` helper text inside the same element).
- **`render_table`** cells use plain text or populated emphasis—for example **`<td><strong>Recommended</strong></td>`** instead of an empty wrapper.
- Autodoc / Markdown pipelines that mark a “focus” row emit a word such as “Primary”, “Focus”, or the row label inside **`<strong>`**, not an empty shell left for CSS to style.
- Prose in **`forge-support`** paragraphs uses **`<strong>visible</strong>`** for inline emphasis; decorative bolding uses CSS classes on spans, not empty semantic tags.
- **`metrics.emptyInlineReport`**: `{ emptyStrongCount: 0, emptyEmCount: 0 }` after crawl.
- No finding evidence keys **`empty_strong_count=`** or **`empty_em_count=`** on audited URLs.

## Failing signals

- **`empty_strong_count=N`** — one or more **`<strong></strong>`** (or whitespace-only **`<strong> </strong>`**) inside **`main`** (**minor**).
- **`empty_em_count=N`** — empty **`<em></em>`** tags in **`main`** (**trivial**).
- **Autodoc table focus column** with **`<td><strong></strong></td>`** where the Markdown cell was blank but the transform still opened an emphasis wrapper.
- **Handbook comparison tables** in **`.forge-table-wrap`** beside **`forge-support`** lede copy that references “marked rows” while the marker cell is an empty **`<strong>`**.
- **Generator regression** after editing **`enhance_tables`** or autodoc post-processors: emphasis tags emitted as placeholders for future content.
- Page may still pass **`DET.CTA.LABEL_NONEMPTY`** (buttons named) while failing here—empty inline semantics are independent of CTA naming.

## Before example

Failing KS markup: handbook **`doc-main`** with a comparison table whose focus column uses empty **`<strong>`** wrappers (typical autodoc table focus-row defect).

```html
<main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pb-5 doc-main">
  <h1 class="font-display mb-3">Methodology comparison</h1>
  <p class="forge-support mb-3">
    Rows marked <strong></strong> indicate the recommended delivery focus for agent-assisted teams.
  </p>
  <div class="forge-table-wrap mt-2">
    <table class="table table-sm table-striped mb-0">
      <thead>
        <tr>
          <th scope="col">Methodology</th>
          <th scope="col">Focus</th>
          <th scope="col">Iteration</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Scrum</td>
          <td><strong></strong></td>
          <td>2-week sprint</td>
        </tr>
        <tr>
          <td>Forge</td>
          <td><em></em></td>
          <td>Spark-driven</td>
        </tr>
        <tr>
          <td>Kanban</td>
          <td>Continuous flow</td>
          <td>Ongoing</td>
        </tr>
      </tbody>
    </table>
  </div>
</main>
```

## After example

Passing KS markup: same table with populated emphasis labels (or plain text when no emphasis is needed).

```html
<main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pb-5 doc-main">
  <h1 class="font-display mb-3">Methodology comparison</h1>
  <p class="forge-support mb-3">
    Rows marked <strong>Recommended</strong> indicate the delivery focus for agent-assisted teams.
  </p>
  <div class="forge-table-wrap mt-2">
    <table class="table table-sm table-striped mb-0">
      <thead>
        <tr>
          <th scope="col">Methodology</th>
          <th scope="col">Focus</th>
          <th scope="col">Iteration</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Scrum</td>
          <td><strong>Recommended</strong></td>
          <td>2-week sprint</td>
        </tr>
        <tr>
          <td>Forge</td>
          <td><em>Primary path</em></td>
          <td>Spark-driven</td>
        </tr>
        <tr>
          <td>Kanban</td>
          <td>Continuous flow</td>
          <td>Ongoing</td>
        </tr>
      </tbody>
    </table>
  </div>
</main>
```

## Evidence and remediation

**Evidence:** Playwright probe **`collectEmptyInlineReport`** (or crawl metric **`metrics.emptyInlineReport`**) inside **`main#main`**. Finding messages cite **`empty_strong_count=N`**, **`empty_em_count=N`**, and optional **`url=`** suffix. Module: `design-rules/deterministic/generated/det-html-empty-inline.check.js`.

**Remediate (in order):**

1. **Locate empty tags:** In DevTools, search **`main`** for **`strong`** / **`em`** with zero text; common sites are **`.forge-table-wrap`** focus columns and autodoc-generated comparison matrices.
2. **Fix generators:** Update autodoc or **`enhance_tables`** transforms so emphasis wrappers are omitted when cell text is blank, or inject the focus label (for example “Recommended”, “Primary”) from Markdown metadata.
3. **Fix hand-authored HTML:** Replace **`<strong></strong>`** with visible copy or remove the tag; use **`forge-support`** + CSS weight classes when semantics are decorative only.
4. **Optional regions:** Align with **`DET.PY.OPTIONAL_REGIONS`**—do not emit placeholder emphasis for slots that render empty.
5. **Re-verify:** Run `analyze-website-ux.mjs` on affected handbook routes; confirm **`emptyInlineReport`** counts are zero. For ruleset harness: `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.HTML.EMPTY_INLINE`.

## Related rules

- `DET.DATA.TABLE_HEADERS` — programmatic header scope on the same `.forge-table-wrap` tables.
- `DET.CTA.LABEL_NONEMPTY` — empty accessible names on buttons and links (different element class).
- `DET.PY.OPTIONAL_REGIONS` — optional slots that should omit markup when empty, not emit ghost emphasis.
- `DET.PROSE.LENGTH` — prose density; empty inline tags often sit beside over-long paragraphs in handbook pages.
