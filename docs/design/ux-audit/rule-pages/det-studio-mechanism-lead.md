---
rule_id: DET.STUDIO.MECHANISM_LEAD
lane: deterministic
title: Studio outcome-led lead
summary: Lead paragraph after H1 states human outcome before harvest/API/pipeline mechanism vocabulary.
page_version: studio-mechanism-lead-v1
generated_at: 2026-08-13T00:00:00.000Z
registry_status: documented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-studio-mechanism_lead
related_rules:
  - DET.STUDIO.TITLE_NAV_MATCH
  - AI.DASHBOARD.ACTIONABILITY_PRIORITY
  - AI.CREDIBILITY.NO_OVERCLAIM
---

## Purpose

Studio operators are not maintainers reading an ingestion README. The first paragraph after **H1** should answer **what they can do here** (find, compare, track, review, watch, monitor)—not which harvest job or API endpoint powers the screen.

`DET.STUDIO.MECHANISM_LEAD` flags leads that open with mechanism vocabulary (`harvest`, `API`, `pipeline`, `EDGAR`, `XBRL`, `multi-select`) without outcome verbs in the same snippet.

**Plan:** Read the lead aloud as an analyst. **Do:** Rewrite one sentence for outcome; move mechanism to a disclosure link or footer meta. **Check:** `page.json.lead_text` passes heuristic. **Adjust:** Keep technical labels on controls, not in the hero lead.

## Passing signals

- Lead: **Review and compare the issuers you are tracking.**
- Mechanism detail in **Show details** disclosure, tooltips, or handbook links.
- Primary CTA label is outcome-shaped (**Open watchlist**, **Compare selected**).

## Failing signals

- Lead: **Harvest EDGAR filings into the pipeline API for XBRL facts.**
- Lead opens with internal codenames before scope or outcome.
- Empty lead while dense mechanism copy fills the first card title.

## Before example

```html
<header class="fc-page-header">
  <h1>Filings</h1>
  <p class="text-muted">Harvest EDGAR submissions via the ingestion API and normalize XBRL into the facts pipeline.</p>
</header>
```

## After example

```html
<header class="fc-page-header" data-testid="filings-header">
  <h1>Filings</h1>
  <p class="text-muted">Review new SEC submissions for issuers on your watchlists and open documents that need attention.</p>
  <p class="forge-support small"><a href="/handbook/ingest">How ingestion works</a></p>
</header>
```

## Evidence and remediation

- Scorer: `lead_text` in `page.json` from `capture-page.mjs`.
- Axis: `human_outcome` in GPT assessment.
- Copy pattern: [forge-enterprise-app-ux-standard.md](../../forge-enterprise-app-ux-standard.md).

## Related rules

- `DET.STUDIO.TITLE_NAV_MATCH` — identity before copy polish.
- `AI.DASHBOARD.ACTIONABILITY_PRIORITY` — next step visible after outcome lead.
- `AI.CREDIBILITY.NO_OVERCLAIM` — bounded capability statements.
