# Kitchen Sink UX audit — design rules documentation

This folder holds **KS-wide** vocabulary for website UX audits, visual catalog governance, and remediation plans. It applies to Kitchen Sink surfaces (`components/`, `css/`, `js/`, `generator/`, `react/`, `assets/svg/`) and to **consumer sites** that embed KS.

## Scope

| In scope | Out of scope |
|----------|----------------|
| Rule IDs scripts and prompts can cite (`DET.*`, `AI.*`) | Product-specific “profiles” for individual consumer brands |
| Alignment with `docs/design/catalog/visual-registry.yaml` and contracts | Owning the registry (catalog tooling does) |
| Split between **deterministic** checks and **judgment-heavy AI** review | Merging `analyze-website-ux.mjs` and `score-website-ux.mjs` |

**Governance:** Do **not** add a Fleet-specific UX profile. Dense docs-first shells may appear only as **generic regression examples** when illustrating repeatable patterns—never as a named audit profile.

## Document map

| File | Role |
|------|------|
| [`component-design-ruleset-taxonomy.md`](component-design-ruleset-taxonomy.md) | Canonical taxonomy by element level (purpose, checks, principles, forbidden patterns, contract fields). |
| [`element-level-ruleset-matrix.md`](element-level-ruleset-matrix.md) | Crosswalk: taxonomy level → deterministic rule IDs → AI principles → required contract fields. |
| [`deterministic-design-rules.md`](deterministic-design-rules.md) | Full **`DET.*`** catalog (machine-reference friendly tables). |
| [`ai-enabled-design-principles.md`](ai-enabled-design-principles.md) | Full **`AI.*`** catalog; each principle expects a **`candidateDeterministicRule`** when a failure repeats. |
| [`industry-standard-page-quality.md`](industry-standard-page-quality.md) | Industry-aligned quality bar (accessibility, landing conventions, trust) mapped to **`DET.*`** / **`AI.*`**. |
| [`harness/README.md`](harness/README.md) | Ruleset harness **Definition of Ready / Done**, E2E coverage matrix, fixture×script test map. |
| [`auditor-fixing-ecosystem.md`](auditor-fixing-ecosystem.md) | **Auditor + fixers + remediation loop** narrative; links to showcase gallery with every rule’s Before/After. |
| [`enterprise-app-ux-rules.md`](enterprise-app-ux-rules.md) | **Studio / operator SPA** rule pack for Studio UX PDCA (`DET.STUDIO.*` + shared `DET.APP.*` / `AI.APP.*`). |

## Deterministic vs AI-enabled (non-negotiable split)

| Lane | Definition | Examples |
|------|------------|------------|
| **Deterministic** | Pass/fail or measurable thresholds from DOM, crawl metrics, catalog JSON, screenshots, or repo contracts—**no model judgment**. | Hash markers present; heading order; nav item counts; contract stub detection; registry coverage. |
| **AI-enabled** | Quality that needs holistic reading: premium feel, cognitive clarity, explanatory diagrams, narrative coherence. | “Looks crowded despite acceptable counts”; weak distinction between primary and secondary story. |

Shared low-level helpers may live under `tools/website-ux-auditor/lib/`, but **`analyze-website-ux.mjs` must not call `score-website-ux.mjs`** (or vice versa).

## Relationship to the visual catalog

- **Registry + contracts** under `docs/design/catalog/` are the **design source of truth** for hashes and expected anatomy.
- UX audit docs **reference** rule IDs; implementing a check is optional until wired in `analyze-website-ux.mjs` / `score-website-ux.mjs` / design-catalog scripts.

## Accessibility (WCAG / axe) campaigns

For standards-aware accessibility audits (axe lane, `DET.A11Y.GENERIC.*` / `DET.A11Y.KS.*`, optional `AI.A11Y.*`), use the separate **[Website Accessibility Auditor](../../tools/website-a11y-auditor/README.md)** and [`docs/design/a11y-audit/`](../a11y-audit/README.md) (showcase: `showcase/a11y-audit-rules.html`, `a11y-audit-ecosystem-examples.html`). This UX auditor keeps partial a11y heuristics for enterprise copy/IA until those paths are deprecated.

## Quick links

- Catalog ontology: [`../catalog/ONTOLOGY.md`](../catalog/ONTOLOGY.md)
- Enterprise website standard (consumer-facing bar): [`../forge-enterprise-ai-website-standard.md`](../forge-enterprise-ai-website-standard.md)
- Enterprise app / Studio standard: [`../forge-enterprise-app-ux-standard.md`](../forge-enterprise-app-ux-standard.md)
- Studio UX PDCA ruleset: [`enterprise-app-ux-rules.md`](enterprise-app-ux-rules.md)
- Website UX auditor: [`../../tools/forge-website-ux-auditor-cursor.md`](../../tools/forge-website-ux-auditor-cursor.md) (repo `docs/tools/`)
