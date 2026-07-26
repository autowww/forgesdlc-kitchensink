# KS page-type design guidelines

Cross-cutting guidance for pages that **Kitchen Sink layouts and generators** can emit. Use these as the review bar when authoring or remediating sites. Pair with [forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md), [PAGE-LAYOUT-TAXONOMY.md](../../../PAGE-LAYOUT-TAXONOMY.md), and per-hash contracts under `docs/design/catalog/`.

Component- and layout-level expectations are summarized in **Cross-reference** at the end.

---

## Public product landing page

**User intent:** Understand what the offering is, whether it fits their organization, and what to do next—without reading a manual.

**First-screen requirements:** Answer *what / for whom / primary outcome* in headline and subhead; one dominant primary call-to-action and at most one secondary action; hero not obscured by nav chrome or link walls.

**Visual hierarchy:** Hero → proof or outcomes → how it works (short) → trust boundary → ecosystem or docs entry → closing CTA. Each band has a single job.

**Navigation model:** Curated global nav; deep technical trees stay off the hero. Mobile nav remains fully usable.

**Content density budget:** Spacious vertical rhythm; avoid more than three dense paragraphs above the fold; cards limited (for example three per row on desktop).

**Enterprise trust expectations:** Explicit human control, data or execution boundaries, and where evidence or review fits—without inventing certifications, customers, or metrics.

**Responsive behavior:** Stack hero and cards cleanly; tap targets meet KS sizing; no horizontal scroll traps. **Scroll policy:** only the page viewport shows a native scrollbar; rails use peek controls ([scroll-overflow-policy.md](../../../design/scroll-overflow-policy.md)).

**Accessibility expectations:** Landmark order (`header`/`nav`/`main`/`footer`); visible focus; meaningful headings; decorative imagery not required for understanding.

**Forbidden patterns:** Auto-generated index dumps as the hero; competing primary CTAs; icon-only controls without names; motion that is the only signal for state; `overflow-auto` on marketing rails without peek controls; duplicate diagram under an interactive layer rail.

---

## Product architecture landing page

**User intent:** Map how the product’s major capabilities connect and where responsibility sits—suitable for technical buyers and internal alignment.

**First-screen requirements:** Architecture story or diagram anchor with a short framing sentence; link to deeper reference; avoid burying the diagram below unrelated marketing bands.

**Visual hierarchy:** System sketch → bounded responsibilities → integration or deployment context → links to specs or handbooks.

**Navigation model:** Often nested under Product / Platform; preserve wayfinding back to public landing and into docs.

**Content density budget:** Higher information density than pure marketing is acceptable if grouped into labeled regions and scannable lists.

**Enterprise trust expectations:** Clear trust boundaries between components; no implied unlimited data exfiltration or unchecked agent autonomy.

**Responsive behavior:** Diagrams reflow or gain scroll containers; legible labels at tablet width.

**Accessibility expectations:** Diagrams that convey unique information need captions, summaries, or adjacent text—not color alone.

**Forbidden patterns:** Walls of unexplained acronyms; diagrams with illegible microcopy at default zoom.

---

## Docs / handbook page

**User intent:** Complete a reading or lookup task efficiently with strong orientation inside a large corpus.

**First-screen requirements:** Title, context (breadcrumbs or section label), and start of prose or API block visible without hunting.

**Visual hierarchy:** Title → optional summary → body → next/prev or related links; sidebars support, not replace, linear reading.

**Navigation model:** Persistent docs sidebar or TOC; deep links stable; “you are here” state visible.

**Content density budget:** Optimized for reading length and code samples; whitespace for prose, monospace lanes for code.

**Enterprise trust expectations:** Versioning or scope notes where behavior differs; maintenance signals when content may be stale (link to source of truth).

**Responsive behavior:** TOC collapses into offcanvas or dropdown without losing scroll position traps.

**Accessibility expectations:** Skip link to main; code blocks scroll horizontally with focusable containers; heading levels reflect outline.

**Forbidden patterns:** Missing landmark for main content; TOC items that are keyboard traps; unlabeled expand/collapse for entire sections.

---

## Reference / API page

**User intent:** Copy exact names, parameters, payloads, or return shapes—often while implementing.

**First-screen requirements:** Symbol name, kind (function, type, endpoint), and minimal signature visible immediately.

**Visual hierarchy:** Signature → parameters table → returns/errors → examples → see-also cross-links.

**Navigation model:** Strong anchor IDs; sidebar or mini-TOC for long pages; breadcrumb to parent package or module.

**Content density budget:** High density allowed in tables and code; still chunk with headings every few screenfuls.

**Enterprise trust expectations:** Error semantics and auth requirements stated plainly; no silent behavior changes between versions.

**Responsive behavior:** Wide tables scroll or stack; code blocks remain readable without page-wide zoom.

**Accessibility expectations:** Tables have headers; monospace regions exposed as `code` or `pre`; anchors reachable from keyboard.

**Forbidden patterns:** Draft or non-final endpoints documented as shipping; undocumented required headers.

---

## Catalog / gallery page

**User intent:** Browse many homogeneous items (components, figures, screenshots) and open detail quickly.

**First-screen requirements:** Grid or rail with visible filters or sort when the set is large; clear item titles or thumbnails.

**Visual hierarchy:** Intro line → filter/sort → primary grid → pagination or lazy load affordance.

**Navigation model:** Often sits under Docs or Design system; cross-links to contracts or source paths per item.

**Content density budget:** Card-first; maintain breathing room between tiles; avoid ultra-dense thumbnail walls on mobile.

**Enterprise trust expectations:** Metadata (owner, status, version) visible where items are governed assets.

**Responsive behavior:** Grids reflow to fewer columns; hover-only overlays get mobile equivalents.

**Accessibility expectations:** Each tile exposes a name; keyboard can move grid logically; images have alt when informative.

**Forbidden patterns:** Infinite grids with no landmark for “main”; motion-only preview of critical labels.

---

## Listing / resource hub

**User intent:** Scan titles and metadata to pick one resource from dozens or hundreds—indexes, blogs, download hubs.

**First-screen requirements:** Page title, short explainer, optional featured row, then list or cards with consistent metadata columns.

**Visual hierarchy:** Intro → featured (optional) → list → pagination → supporting filters.

**Navigation model:** Pagination or load-more must be predictable; filters avoid full page reload without focus management plan.

**Content density budget:** List rows may be denser than marketing cards but need alignment and rhythm.

**Enterprise trust expectations:** Dates, owners, or stability labels where relevant; empty states are informative, not silent.

**Responsive behavior:** Table-like lists become stacked cards; filters collapse into sheet or drawer.

**Accessibility expectations:** Sort and filter controls labelled; live regions for result counts if updated asynchronously.

**Forbidden patterns:** Duplicate titles with no distinguishing metadata; mystery link text (“read more” without context in the accessible name).

---

## Dashboard / desktop console

**User intent:** Monitor status, triage work, and launch actions across a bounded system—local-first or operator tools.

**First-screen requirements:** Primary status or queue visible; clear primary workspace region; avoid login walls obscuring read-only health.

**Visual hierarchy:** Summary strip → primary panel → secondary panels; dense data uses tables with sticky headers where appropriate.

**Navigation model:** App shell with persistent left or top nav; deep tools open in panes or routes with clear back paths.

**Content density budget:** Higher than marketing; still limit simultaneous competing primary actions per view.

**Enterprise trust expectations:** Auditability and role boundaries surfaced; destructive actions confirmed and labeled.

**Responsive behavior:** Desktop-first; narrow widths degrade to stacked panels without hiding critical status.

**Accessibility expectations:** Data grids expose structure; shortcuts documented; modals trap focus and restore it.

**Forbidden patterns:** Silent failure badges; critical metrics only encoded by color.

---

## Admin / operations page

**User intent:** Change configuration, approve operations, or inspect platform health with low risk of accidental damage.

**First-screen requirements:** Page scoped to one job; dangerous controls grouped and visually secondary to read-only context.

**Visual hierarchy:** Context summary → read-only detail → action panel with explicit labels → audit trail when applicable.

**Navigation model:** Segregated from public marketing IA; breadcrumbs include environment or tenant when relevant.

**Content density budget:** Form-dense allowed; validation and help text adjacent to fields.

**Enterprise trust expectations:** Role gates explicit; irreversible actions require confirmation with plain-language consequences.

**Responsive behavior:** Forms remain usable; wide tables scroll within regions.

**Accessibility expectations:** Errors tied to fields; disabled states explained; long forms chunked with headings.

**Forbidden patterns:** Single ambiguous “Run” for unrelated actions; destructive styling on non-destructive controls.

---

## Wizard / guided flow

**User intent:** Complete a linear or branching setup with confidence at each step.

**First-screen requirements:** Progress model visible (step list or indicator); step title explains the decision being made.

**Visual hierarchy:** Step header → primary inputs → helper text → back / next with clear disabled rules.

**Navigation model:** Linear next/back with validation gates; optional branching documented; escape hatch to save draft if supported.

**Content density budget:** One primary question group per step; avoid embedding unrelated reference docs inline.

**Enterprise trust expectations:** Summarize commitments before final submit; show what will execute vs what is deferred.

**Responsive behavior:** Sticky footers for primary actions avoid keyboard overlap on mobile.

**Accessibility expectations:** Step changes announced for assistive tech where appropriate; focus moves to step heading on advance.

**Forbidden patterns:** Blocking progress on non-critical optional fields without explanation; hiding error summary.

---

## Data report / analytics page

**User intent:** Read trends, compare cohorts, or export numbers for decisions.

**First-screen requirements:** Report title, timeframe, and primary chart or KPI row visible; filters scoped and labelled.

**Visual hierarchy:** Filters → KPI band → charts → detail table → export or drill-down actions.

**Navigation model:** Often nested under Insights or Operations; deep links preserve filter state where possible.

**Content density budget:** Charts need surrounding whitespace; tables may be dense with zebra and alignment.

**Enterprise trust expectations:** Data freshness and definitions linked; anonymization rules stated when handling sensitive categories.

**Responsive behavior:** Charts resize or switch to simplified variants; tables scroll horizontally inside regions.

**Accessibility expectations:** Data visualizations include text summaries or tables of underlying values where feasible.

**Forbidden patterns:** Flavor-only chartjunk; tooltips as the only place for axis labels.

---

## Presentation / storytelling page

**User intent:** Consume a sequenced narrative—deck, scroll story, or demo path—with clear pacing.

**First-screen requirements:** Opening slide or chapter visible full-viewport; obvious affordance to advance (including keyboard).

**Visual hierarchy:** Scene-based; one focal message per scene; speaker notes or captions separated from main stage.

**Navigation model:** Linear next/prev; optional outline or thumbnails for jump navigation.

**Content density budget:** Low per scene; repetition replaces cramming.

**Enterprise trust expectations:** If referencing product behavior, label demos as illustrative—not live customer data.

**Responsive behavior:** Fullscreen modes respect safe areas; controls don’t obscure content.

**Accessibility expectations:** Respect `prefers-reduced-motion` for transitions; slides have titles; video/audio captioned.

**Forbidden patterns:** Auto-advance without pause control; seizure-risk flashes.

---

## Desktop studio / app workspace

**User intent:** Work inside a tool window with panels, inspectors, and canvas (IDE-like or design studio).

**First-screen requirements:** Primary canvas identifiable; toolbars discoverable; status indicators visible but not screaming.

**Visual hierarchy:** Canvas center, tools peripheral, inspectors detail selection; avoid duplicating the same control in three places without hierarchy.

**Navigation model:** Often multi-window or multi-pane; shortcuts for power users documented in help.

**Content density budget:** High in tool rails; canvas stays clean; progressive disclosure for advanced inspectors.

**Enterprise trust expectations:** Local vs remote execution boundaries clear; autosave or version cues where data loss is costly.

**Responsive behavior:** Minimum widths documented; collapse side panels before breaking canvas legibility.

**Accessibility expectations:** Panels are landmarks; focus order follows task flow; custom widgets expose names and values.

**Forbidden patterns:** Unlabelled icon toolbars; drag-only affordances with no keyboard path.

---

## Cross-reference (KS surfaces)

| Concern | See contracts (examples) |
|--------|---------------------------|
| Landing / marketing / listing / gallery layouts | `Ldg`, `Mkt`, `Lst`, `Gly`, `Spl`, preview hashes `Vln`, `Vmk`, `Vlg` |
| Handbook / chapter / product frames | `Hbk`, `Chp`, `Prd`, `Vhb`, `Vcp`, `Vpd` |
| Showcase museum pages | `Idx`, `Nav`, `Ctr`, `Dgm`, `Frp`, `Rpl`, … |
| Doc chrome | `Ksr`, `Kco`, `Ktx`, `Kbc`, `Ksf`, `Kpn` |
| Python renderers (heroes, cards, diagrams) | family **`Kpr`** |
| Styles / theme packs | family **`Ksc`** |
| Scripts / motion / nav behavior | family **`Ksj`** |
| SVG templates and schematics | family **`Ksv`** |
| React primitives | family **`Rpf`** (`FAM-react-primitives.md`) |
| Forge-autodoc consumer pages | **`Fad`**, **`Hdc`** |
| Museum studio shell | **`Msm`**, child **`vYA`** |
| Design terminology source docs | family **`Kdt`** |

**Change policy:** When a page type’s IA or accessibility bar shifts, update this file and the relevant layout or page contract in the same change set.

## Changelog

- 2026-05-18 — Phase 04: authored page-type guidance for catalog remediation.
