---
rule_id: DET.PROSE.LENGTH
lane: deterministic
title: Prose length and list caps
summary: Visible paragraphs stay within the 85-word readability budget; card lists cap at three outcome bullets and main-column lists at twelve scannable items.
page_version: b246000e8074dc2ec8325cca1ad2af3f39e46152d69d019a9536befacd6887f9
generated_at: 2026-05-25T18:30:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-prose-length
related_rules:
  - DET.LAYOUT.GRID_CONSISTENCY
  - DET.SECTION.HEADING
  - DET.SECTION.SINGLE_JOB
  - DET.CONTEXT.BURDEN
  - DET.HTML.EMPTY_INLINE
  - AI.CONTEXT.COGNITIVE_CLARITY
  - AI.NARRATIVE.COHERENCE
  - AI.TRUST.BOUNDARY_CLARITY
---

## Purpose

Enterprise Forge pages (`landing_page`, `product_page`, `handbook_page`, showcase docs) are meant to scan in layers: short paragraphs, outcome cards with at most three bullets, and reference detail on linked docs pages. Dense walls of `forge-support` copy and over-long lists slow first-pass comprehension and push technical depth above the fold.

This deterministic rule runs in the **metrics** phase. It evaluates visible `p` word counts from DOM metrics (`metrics.paragraphs`) and, when Playwright is available, scans `ul` / `ol` inside `main` via `collectProseLengthReport`. Budgets align with `forge-enterprise-ai-website-standard.md` and `det-prose-length.check.js`: **85 words** per paragraph (`MAX_PARAGRAPH_WORDS`), **3** direct list items per `.forge-card` / `.card` / `[data-card]` (`MAX_CARD_LIST_ITEMS`), and **12** direct items per main-column prose list (`MAX_PROSE_LIST_ITEMS`). Nav, pagination, breadcrumb, dropdown, `.forge-toc`, `.ks-doc-toc`, and sidebar lists are excluded. Platform handbook inner pages (`siteKind: platform` with inner doc paths) are skipped entirely.

**Plan:** Audit heroes, mechanism bands, outcome grids, and handbook chapters on a crawl URL. **Do:** Keep paragraphs to one or two sentences; trim card bullets to three outcome-led items; break long indexes into grouped sections or linked pages. **Check:** `longParagraphViolations` is empty and `proseLengthReport.violations` is empty. **Adjust:** Split copy in `components/components.py`, `marketing_sections.py`, or consumer Markdown before re-running `analyze-website-ux.mjs`.

## Passing signals

- Every visible `p.forge-support`, `p.landing-hero-tagline`, and body `p` in `main` reports **≤ 85 words** in `metrics.paragraphs`.
- Outcome and trust **`.forge-card.breathe-static`** tiles expose **≤ 3** direct `li` children with visible text (outcome-led bullets, not reference dumps).
- Main-column procedural or feature lists (`ul` / `ol` in `main`, not inside excluded chrome) have **≤ 12** direct visible `li` items, or the list lives on a linked docs / index page.
- Long reference material is staged in a follow-on `forge-section`, `forge-callout`, or child handbook page—not repeated in one paragraph block.
- `findingsFromProseLengthMetrics` returns no findings for generic product and handbook URLs; platform inner handbook paths are intentionally out of scope.
- Landing heroes may use short `landing-hero-explainer` / `landing-hero-clarification` paragraphs that respect the same word cap when sampled as visible `p` elements.

## Failing signals

- **`long-paragraph`:** One or more `p` elements exceed **85 words** — evidence `long_paragraphs count=N max_words=W threshold=85 sample="Nw@Ypx; …"`. Severity **minor** by default; **major** when four or more paragraphs exceed the cap or the worst block exceeds **120 words** (threshold + 35).
- **`card-list`:** A `.forge-card`, `.card`, or `[data-card]` root contains **> 3** direct visible list items — evidence `card-list items=5 max=3 list="ul.forge-card"`. Severity **major** (competing bullets on a conversion tile).
- **`prose-list`:** A main-column `ul` / `ol` (not in nav, TOC, or sidebar) has **> 12** direct visible items — evidence `prose-list items=14 max=12 list="ol.steps"`. Severity **minor**.
- Repeated filler sentences in one `p` to game layout without adding structure (still counts as one over-budget paragraph).
- Card lists that hide extra items in nested lists still count **direct** `li` children only; nested sub-lists are not a workaround for the card cap.
- Page may pass **`DET.LAYOUT.GRID_CONSISTENCY`** (readable measure) yet still fail here when copy density is too high for enterprise scan patterns.

## Before example

Failing KS markup: one `forge-support` paragraph exceeds the 85-word cap, an outcome card lists five bullets, and a main-column ordered list exposes fourteen steps—triggers `long-paragraph`, `card-list`, and `prose-list` violations.

```html
<main id="main" class="doc-main px-4 py-4">
  <section class="forge-section ks-section">
    <p class="section-label text-cyan mb-2">Mechanism</p>
    <h2 class="font-display h4 mb-3">Governed delivery</h2>
    <p class="forge-support">
      Teams delegate more work to agents but still need clear intent, review gates, and evidence on every release.
      Forge creates the structure for human-owned, agent-executed delivery across methodology, workspace visibility,
      governed reasoning, and controlled execution without turning the landing page into a handbook dump.
      Repeat the mechanism sentence so word count crosses the readable prose budget and auditors flag a single dense block
      instead of staged cards or linked docs pages that carry reference depth below the fold for first-time readers.
    </p>
    <div class="row g-3 g-lg-4 mt-2">
      <div class="col-md-4">
        <div class="forge-card breathe-static p-3 h-100" hash="Out" data-ks-hash="Out" data-ks-type="component" data-ks-name="outcome-card-fail">
          <p class="card-label mb-1">Outcomes</p>
          <h3 class="h5 mt-2 mb-2">Scan faster</h3>
          <ul class="forge-support mb-0 ps-3">
            <li>Shape intent before delegation</li>
            <li>Keep review gates on critical paths</li>
            <li>Capture evidence per release</li>
            <li>Link schemas to child docs</li>
            <li>Expose operator controls in Fleet</li>
          </ul>
        </div>
      </div>
    </div>
    <ol class="forge-support ps-3 mt-4">
      <li>Define product promise in the hero</li>
      <li>Stage trust boundaries in the next band</li>
      <li>Move API tables to reference docs</li>
      <li>Cap card bullets at three items</li>
      <li>Split paragraphs over eighty-five words</li>
      <li>Run analyze-website-ux on handbook URLs</li>
      <li>Confirm proseLengthReport is empty</li>
      <li>Trim generated link indexes</li>
      <li>Use forge-callout for warnings</li>
      <li>Link long procedural lists</li>
      <li>Re-audit marketing and showcase pages</li>
      <li>File defects in the ruleset harness</li>
      <li>Promote repeated issues to new DET rules</li>
      <li>Publish remediation in kitchensink first</li>
    </ol>
  </section>
</main>
```

## After example

Passing KS markup: short `forge-support` blocks, three outcome bullets in the card, and the procedural steps moved to a linked docs page (main column keeps a short pointer list within the twelve-item cap).

```html
<main id="main" class="doc-main px-4 py-4">
  <div class="mx-auto doc-content" style="max-width:56rem">
    <section class="forge-section ks-section">
      <p class="section-label text-cyan mb-2">Mechanism</p>
      <h2 class="font-display h4 mb-3">Governed delivery</h2>
      <p class="forge-support mb-3">
        Teams delegate more work to agents but still need clear intent, review gates, and evidence on every release.
      </p>
      <p class="forge-support mb-0">
        Forge structures human-owned, agent-executed delivery. Reference schemas and operator detail live on linked docs pages.
      </p>
      <div class="row g-3 g-lg-4 mt-4">
        <div class="col-md-4">
          <div class="forge-card breathe-static p-3 h-100" hash="Out" data-ks-hash="Out" data-ks-type="component" data-ks-name="outcome-card-pass">
            <p class="card-label mb-1">Outcomes</p>
            <h3 class="h5 mt-2 mb-2">Scan faster</h3>
            <ul class="forge-support mb-3 ps-3">
              <li>Shape intent before delegation</li>
              <li>Keep review gates on critical paths</li>
              <li>Capture evidence per release</li>
            </ul>
            <a class="btn btn-forge-outline btn-sm" href="/docs/methodology">Read methodology</a>
          </div>
        </div>
      </div>
      <p class="forge-support mt-4 mb-2">
        Full remediation checklist (14 steps) lives on the handbook page—this band links instead of inlining fourteen <code>li</code> rows.
      </p>
      <ul class="forge-support mb-0 ps-3">
        <li><a href="/docs/ux-audit/remediation-cycle">UX remediation cycle</a></li>
        <li><a href="/docs/ux-audit/deterministic-design-rules">Deterministic design rules</a></li>
      </ul>
    </section>
  </div>
</main>
```

## Evidence and remediation

**Evidence:** Metrics phase supplies `metrics.paragraphs[]` (`words`, `top`, truncated `text`) and optional `metrics.proseLengthReport` with `listCount` and `violations[]` (`kind`: `card-list` | `prose-list`, `itemCount`, `maxItems`, `selectorHint`, `context`). Findings use area `readability`, default severity `minor` (card lists and dense paragraph clusters `major`). Sample evidence: `long_paragraphs count=2 max_words=96 threshold=85 sample="96w@420px; 102w@680px"`, `card-list items=5 max=3 list="ul.forge-support"`, `prose-list items=14 max=12 list="ol.forge-support"`. Capture a screenshot of the offending paragraph or list band plus the audit JSON snippet.

**Remediate (in order):**

1. **Split long paragraphs** — break each `p.forge-support` over 85 words into two one- or two-sentence blocks; move mechanism and API detail into `forge-callout` bands or child docs.
2. **Trim card bullets** — keep at most three outcome-led `li` items per `.forge-card`; demote reference lines to `btn-forge-outline` links or a sibling docs section.
3. **Break long main lists** — when `prose-list` fires, group items under subheadings, use tables for dense enumerations, or link a handbook index page instead of fourteen inline steps.
4. **Fix at the source** — update `components/components.py`, `marketing_sections.py`, or site Markdown generators so rebuilt HTML respects caps before consumer submodule bumps.
5. **Re-audit** — run `analyze-website-ux.mjs` on landing, product, and handbook URLs; confirm no `DET.PROSE.LENGTH` findings. Harness regression: `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.PROSE.LENGTH` and `npm test -- det-prose-length.test.js` from `tools/website-ux-auditor`.

## Related rules

- `DET.LAYOUT.GRID_CONSISTENCY` — readable line length and gutter alignment; complements word-count caps on the same `forge-support` blocks.
- `DET.SECTION.HEADING` — section labels and heading ladder; long prose often hides missing section breaks.
- `DET.SECTION.SINGLE_JOB` — one topic per `forge-section`; split paragraphs when a section mixes outcomes and reference dumps.
- `DET.CONTEXT.BURDEN` — first-screen density; pairs with paragraph length on heroes and above-the-fold bands.
- `DET.HTML.EMPTY_INLINE` — empty inline tags; often co-occur with over-long paragraphs in handbook exports.
- `AI.CONTEXT.COGNITIVE_CLARITY` — undefined jargon and heading bait-and-switch beyond deterministic word counts.
- `AI.NARRATIVE.COHERENCE` — story flow when prose length passes but sections still feel disjointed.
- `AI.TRUST.BOUNDARY_CLARITY` — trust copy must stay scannable; this rule is a structural proxy for readable trust blocks.
