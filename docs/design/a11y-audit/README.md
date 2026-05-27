# Kitchen Sink accessibility audit — design rules

Forge **Website Accessibility Auditor** (`tools/website-a11y-auditor/`) uses this folder for rule IDs, standards mapping, and operator guidance.

## Scope

| In scope | Out of scope |
|----------|----------------|
| WCAG-oriented **axe** lane (generic, all sites) | Legal conformance claims or VPAT signing |
| **DET.A11Y.GENERIC.\*** deterministic checks (any site) | Fleet-specific audit profiles |
| **DET.A11Y.KS.\*** checks (Kitchen Sink emitters) | Merging `analyze-website-a11y.mjs` and `score-website-a11y.mjs` |
| **AI.A11Y.GENERIC.\*** / **AI.A11Y.KS.\*** judgment overlays | Replacing **forge-accessibility** Studio (CDP + deep review) |

## Lanes (non-negotiable split)

| Lane | Definition |
|------|------------|
| **axe** | Deque axe-core in Playwright; violations tagged with WCAG-oriented rule IDs (`AXE.*`). |
| **Deterministic (DET)** | Pass/fail from DOM, repo, or catalog JSON — **no LLM**. |
| **AI-enabled** | Judgment-heavy review for keyboard flows, handbook chrome, region labeling. |

`analyze-website-a11y.mjs` **must not** call `score-website-a11y.mjs` (or vice versa).

## Naming: `-generic-` vs `-ks-`

| Scope | Rule ID example | Module filename |
|-------|-----------------|-----------------|
| Generic | `DET.A11Y.GENERIC.LANDMARKS` | `det-a11y-generic-landmarks.check.js` |
| KS | `DET.A11Y.KS.HASH_MARKERS` | `det-a11y-ks-hash-markers.check.js` |

The rules blender **rejects** scope/filename mismatches.

## KS auto-detection

`--rules-scope auto` (default) enables **KS** DET and AI rules when repo and/or live DOM signals exceed thresholds (see tool README). Use `--rules-scope generic` to force axe + generic DET only; `--rules-scope ks` for harnesses on KS fixtures.

## Document map

| File | Role |
|------|------|
| [`deterministic-a11y-rules.md`](deterministic-a11y-rules.md) | **DET.A11Y.\*** catalog |
| [`ai-enabled-a11y-principles.md`](ai-enabled-a11y-principles.md) | **AI.A11Y.\*** catalog |
| [`compliance-profiles.md`](compliance-profiles.md) | Named bundles (ADA, Section 508, EN 301 549, WCAG) |
| [`standards-traceability.md`](standards-traceability.md) | RTM: SC ↔ axe / DET / AI coverage |
| [`standards-traceability-gaps.md`](standards-traceability-gaps.md) | Generated gap report (after `blend-rules`) |
| [`standards-packs.md`](standards-packs.md) | Per-profile `*.pack.json` for compliance score + CI |
| [`wcag-criteria-catalog.json`](wcag-criteria-catalog.json) | Canonical WCAG 2.0 / 2.1 / 2.2 criteria |
| [`standards-matrix.md`](standards-matrix.md) | Profile → axe tags + DET standards tags |
| [`auditor-ecosystem.md`](auditor-ecosystem.md) | Ecosystem narrative (compiled to showcase) |
| [`rule-pages/`](rule-pages/) | Per-rule handbook Markdown + Before/After HTML |
| [`../../tools/website-a11y-auditor/README.md`](../../tools/website-a11y-auditor/README.md) | Operator manual |

## Kitchen Sink showcase (handbook + examples)

After `python3 generator/build-showcase.py` from the KS repo root:

| Page | Path under `showcase/` |
|------|------------------------|
| Auditor ecosystem | `a11y-audit-ecosystem.html` |
| Rule catalog | `a11y-audit-rules.html` |
| **Before/After gallery** (all rules) | `a11y-audit-ecosystem-examples.html` |
| Per-rule handbook | `a11y-audit-rules/<rule-kebab>.html` |

Bootstrap or refresh rule Markdown: `python3 generator/bootstrap_a11y_rule_pages.py`.

Cursor workflow: [`../../docs/tools/forge-website-a11y-auditor-cursor.md`](../../docs/tools/forge-website-a11y-auditor-cursor.md).

## Related tools

- **Website UX auditor** — enterprise copy/IA; partial a11y heuristics remain there until deprecated. See [`../ux-audit/README.md`](../ux-audit/README.md).
- **forge-accessibility (Leo)** — interactive CDP + axe Studio for deep evidence packages.
