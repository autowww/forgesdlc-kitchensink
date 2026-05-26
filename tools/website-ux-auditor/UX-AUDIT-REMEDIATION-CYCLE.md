---
id: forge.website-ux-auditor.remediation-cycle
kind: ks-runbook
status: published
owner: Forge UX
updated: 2026-06-06
---

# UX audit → fix → re-audit cycle (generic)

Use this runbook on **any** website repo that runs the Forge Website UX auditor (`analyze-website-ux.mjs`). It is **site-agnostic**: your project’s build, serve, and deploy steps live in that repo’s docs (see also **`FORGE_SITE_COMMANDS.md`** for copy-paste command patterns).

## Operator script (short, no commands)

1. **Build** the site the way that repository documents (generator, framework build, or approved CI artifact).
2. **Serve** the built static output locally so the auditor can open real URLs in a browser.
3. **Run** the UX auditor in **live mode** (**`--site` …**, optional **`--start`**): each pass uses **Playwright (Chromium)**. Do **not** use **`--static-only`** here—that path skips browser inspection and is unsuitable as the loop verifier. Budget the crawl (**`--max-pages`**) for the whole published tree, and **without** stopping early just because majors appeared (**`--breadth-crawl`** / **`--stop-disable`**) unless you only want a smoke slice.
4. **Read** the generated report and structured data under the remediation output folder; treat **blocker, critical, and major** findings as mandatory work unless you explicitly waive them.
5. **Fix root causes**: content (copy, headings, meta), navigation or layout shells, generator output, broken links that point at files not served by the static site—or, rarely, unjustified heuristic checks in **this** tooling (only after evidence and tests).
6. **Rebuild**, **serve again**, and **audit again** with the **same live** invocation (**`--site`**, never **`--static-only`**) and the **same** budget shape.
7. **Repeat** until a full **live** crawl records **zero** blocker, critical, or major findings **and** the crawl queue is empty at your chosen budget (or you accept orphaned pages with a tracked exception list). An optional AI-assisted pass (**`--ai`**, **`--force-ai-audit`**, or **`FORGE_UX_ENABLE_AI_AUDIT=1`**) is advisory only — not a replacement for deterministic sign-off.
8. **Shut down** the temporary local server used for auditing.

Pass the finalized path to **`audit-report.md`**, **`audit-data.json`**, and any RCA prompts downstream to reviewers or to Cursor remediation plans already emitted beside them.

---

## Maintainer & agent reference (defaults)

### Tooling placement

- **Analyzer entry:** `tools/website-ux-auditor/analyze-website-ux.mjs` from a **kitchensink checkout**, or `kitchensink/tools/website-ux-auditor/analyze-website-ux.mjs` when the website embeds KS and ships that subtree.
- **Design standard:** If `<repo>/docs/design/forge-enterprise-ai-website-standard.md` exists, the analyzer picks it up automatically; otherwise pass **`--standard`** to a Markdown file that mirrors the Forge enterprise AI website standard. See **`FORGE_SITE_COMMANDS.md`**.

### Loop requirement: Playwright on every verifier pass

- **Remediation/sign-off loops** must re-run **`analyze-website-ux.mjs`** with **`--site`** (and **`npm install`** + **`npx playwright install chromium`** once per machine, per **`FORGE_SITE_COMMANDS.md`** prerequisites).
- **`--static-only`** / **`--no-browser`** is for CI fixtures, offline plan stubs, or triage—not for declaring a handbook “clean.” Static runs lack DOM, homepage-shell, and screenshot-backed checks present in live mode.

### Live crawl knobs (usual pattern)

| Intent | Typical flags |
|--------|----------------|
| Breadth-first pass (do **not** stop after N majors) | **`--breadth-crawl`** (alias **`--stop-disable`**) |
| Cover the whole static site | **`--max-pages`** set above your reachable `.html` (or SPA route) count |
| Slow pages / large hydrate | Larger **`--timeout-ms`** |
| Faster iteration | **`--no-screenshots`**; optional **`--no-ux-csv`** |

**`--site-kind`** should match the product profile (`forgesdlc`, `lcdl`, `fleet`, `lenses`, `platform`, `generic`, or `auto`). Wrong kind skews homepage-shell and product checks.

### What “done” means

Treat these checks as **binding only after** a **`--site`** (Playwright) crawl at your chosen **`--max-pages`** budget—not after **`--static-only`**.

1. Open **`audit-data.json`** (schema v2).
2. For **every** object in **`pages`**, ensure **no** entry in **`findings`** has **`severity`** in **`blocker`**, **`critical`**, or **`major`**.
3. Check **`crawlSummary.queuedRemainingAtStop`** at your **`--max-pages`**: **`0`** means the crawler exhausted the same-origin frontier at that budget (good coverage signal). A non-zero queue with a **low** page cap means you may need a **higher** budget or seed URLs (project-specific).

The numeric **`crawlSummary.majorPlusFindingCountTotal`** is cumulative during the crawl; under **`--breadth-crawl`** the **per-page `findings`** list is still the source of truth for sign-off.

If you enable the loop’s post-clean AI pass, review **`ai-audit/ai-audit-report.md`** and **`ai-audit/ai-audit-data.json`** separately. Those findings are **AI-assisted and advisory**; they intentionally do not modify deterministic **`audit-data.json`** or the Major+ gating rules.

### Common finding families (fix at source)

| Area / check (examples) | Typical root cause |
|---------------------------|-------------------|
| **metadata** — meta description missing or short | Page front matter or generator not emitting **120–160** char (or at least **≥40** char) descriptions where the check applies. |
| **homepage-shell** (strict product profiles) | Full handbook sidebar + mobile offcanvas before the landing story; or chrome copy that trips phrase heuristics. Prefer **layout / rail / routing** fixes over hero-only copy when the report says so. |
| **Links** to repo paths not in the static root | Markdown used **`<a href>`** to `.py`, `.cursor/`, etc.; use **code spans** or plain paths so crawlers do not treat them as site pages. |
| **accessibility** | Missing **`lang`**, missing **alt**, contrast heuristics—fix in templates or content. |

### Scorer vs auditor

For a **portfolio score** over **all** URLs in budget with **no** Major+ governor, prefer **`score-website-ux.mjs`** (`npm run score`). The auditor is tuned for **remediation loops** (default Major+ governor) and emits **plans + RCA**; pair them when you both need breadth scores and prioritized fix lists.

### Hygiene

- Do not pipe analyzer stdout through **`tail`** in wrappers that buffer indefinitely.
- Tear down local servers bound to audit ports after each run.

When in doubt, paste **`FORGE_SITE_COMMANDS.md`** examples and swap in your repo’s build/serve lines.
