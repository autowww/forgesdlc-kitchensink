# AI-enabled design principles (`AI.*`)

These principles require **human-style judgment**—holistic reading of screenshots, copy nuance, perceived hierarchy, and credibility. They complement **`DET.*`** rules; they **do not** replace hash governance or catalog checks.

AI review is an **advisory layer**: it surfaces high-order design quality, proposes **candidate deterministic rules** for repeatable patterns, and records how much of the issue is already covered by existing checks.

## Required finding shape (every AI finding)

Each finding MUST include the judgment metadata below (in addition to `url`, `severity`, `title`, and other batch-schema fields your runner specifies).

```json
{
  "principleId": "AI.CONTEXT.COGNITIVE_CLARITY",
  "deterministicCoverage": "covered|partially-covered|not-covered",
  "candidateDeterministicRule": "...",
  "hashesOrContractsAffected": ["..."],
  "screenshotOrDomEvidence": "...",
  "confidence": 0.0
}
```

| Field | Meaning |
|--------|--------|
| `principleId` | One of the **canonical** `AI.*` ids in the next section (primary judgment lens). |
| `deterministicCoverage` | Whether an existing deterministic check already catches this pattern: `covered`, `partially-covered`, or `not-covered`. |
| `candidateDeterministicRule` | If the issue is repeatable, propose a concrete **`DET.*`** id and check shape; otherwise explain why it must stay AI-only. |
| `hashesOrContractsAffected` | Relevant `hash="XYZ"` / contract paths / registry ids. |
| `screenshotOrDomEvidence` | What you saw (DOM snippet, screenshot path, or observable on-page signal). |
| `confidence` | Model confidence in **this** finding, **0.0–1.0** (not severity). |

**Promotion bias:** Prefer turning repeatable issues into **`DET.*`** (or catalog) checks. Use `AI.RULE_DISCOVERY.CANDIDATE_DETERMINISTIC_RULE` when the finding is primarily about discovering or refining that promotion path.

## Canonical AI review principles (required `principleId` set)

These ids are the **primary** judgment lenses. Extended principles later in this doc are optional vocabulary; align new work to these seven where possible.

| Principle ID | Review question | Signals looked for |
|----------------|----------------|-------------------|
| `AI.PREMIUM.ENTERPRISE_FEEL` | Does this feel deliberate, calm, and confident—not hectic or “template soup”? | Spacing generosity, typographic refinement, consistent radii, purposeful imagery |
| `AI.VISUAL.HIERARCHY_CONFIDENCE` | Is there a clear focal path where scale, contrast, and grouping make the next read obvious? | Hero → proof → depth; intentional contrast steps; no competing “equal-weight” shouting |
| `AI.CONTEXT.COGNITIVE_CLARITY` | Can a first-time reader form a correct mental model in one pass? | Jargon explained before reuse; progressive disclosure; headings match substance |
| `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE` | Do visuals explain product structure or user benefit—not generic decoration? | Diagrams tied to claims; captions earn their space |
| `AI.GOVERNANCE.CREDIBILITY` | Do trust, boundaries, and claims read as bounded, inspectable, and operator-authentic? | Plain-language trust copy; no overclaim; evidence hooks match reality |
| `AI.CONTRACT.ACTIONABILITY` | Could an engineer implement from the contract (or paired specs) without guessing UX intent? | Concrete anatomy, states, edge cases; element-specific acceptance signals |
| `AI.RULE_DISCOVERY.CANDIDATE_DETERMINISTIC_RULE` | Is there a repeatable failure pattern that should become a **`DET.*`** or catalog check? | Stable DOM/copy/layout signals; proposed check id + threshold + fixture |

## Premium & credibility (extended)

| Principle ID | Review question | Signals looked for |
|----------------|----------------|-------------------|
| `AI.TRUST.BOUNDARY_CLARITY` | Are data, execution, and human-control boundaries understandable without insider knowledge? | Plain-language trust copy; avoids hand-wavy “AI magic” |
| `AI.CREDIBILITY.NO_OVERCLAIM` | Are capabilities stated in bounded, verifiable ways? | Absence of invented certifications, metrics, or logos |

## Context & narrative (extended)

| Principle ID | Review question | Signals looked for |
|----------------|----------------|-------------------|
| `AI.NARRATIVE.COHERENCE` | Does the page tell one ordered story (problem → outcome → mechanism → next step)? | Section sequencing; no argumentative contradictions |
| `AI.CONTEXT.BURDEN_SUBJECTIVE` | Despite passing numeric **`DET.CONTEXT.BURDEN`**, does the page still feel overwhelming? | Visual noise, competing focal points, dense diagrams |

## Visual communication (extended)

| Principle ID | Review question | Signals looked for |
|----------------|----------------|-------------------|
| `AI.VISUAL.RHYTHM_SUBJECTIVE` | Do spacing and grouping feel rhythmic, not accidental? | Repeated motifs; aligned grids |

## Components & contracts (extended)

| Principle ID | Review question | Signals looked for |
|----------------|----------------|-------------------|
| `AI.CONTRACT.IMPLEMENTATION_USEFULNESS` | Could an engineer implement from the contract without guessing UX intent? | Concrete anatomy, states, edge cases |
| `AI.CONTRACT.FAMILY_COVERAGE_JUSTIFIED` | Does family-level wording truly cover every child hash—or should children split? | Child variance vs boilerplate |

## Data & diagrams

| Principle ID | Review question | Signals looked for |
|----------------|----------------|-------------------|
| `AI.DATA.INSIGHT_LEGIBILITY` | Does the chart communicate the intended insight—not only accurate geometry? | Annotation, emphasis, takeaway title |
| `AI.DIAGRAM.SEMANTIC_ACCURACY` | Do shapes/arrows match the described mechanism? | Mismatch between caption and topology |

## Motion & ambient

| Principle ID | Review question | Signals looked for |
|----------------|----------------|-------------------|
| `AI.MOTION.INTENTIONALITY` | Does motion guide attention—or distract from reading? | Timing, easing, restraint |
| `AI.AMBIENT.READABILITY_CONFLICT` | Do ambient layers reduce text readability or affordance clarity? | Contrast under particles/canvas |

## Desktop / app UX

| Principle ID | Review question | Signals looked for |
|----------------|----------------|-------------------|
| `AI.APP.WORKFLOW_CONTINUITY` | Do panels, tabs, and routes preserve sense of place? | Orientation cues; stable chrome |
| `AI.APP.DENSITY_BALANCE` | Is information dense without feeling chaotic (ops/console contexts)? | Grouping, labeling, affordances |

## React & Python surfaces (judgment layer)

| Principle ID | Review question | Signals looked for |
|----------------|----------------|-------------------|
| `AI.REACT.PRIMITIVE_CONSISTENCY` | Do primitives feel like one system (states, focus, density)? | Mixed metaphors across controls |
| `AI.PY.HTML_AUTHORING_QUALITY` | Does generated HTML read as intentional markup—not accidental nesting soup? | Heading jumps, redundant wrappers |

## Styles & scripts (judgment layer)

| Principle ID | Review question | Signals looked for |
|----------------|----------------|-------------------|
| `AI.THEME.PERSONALITY_COHERENCE` | Does the theme reinforce brand temperament without fighting content? | Accent usage; dark/light balance |
| `AI.JS.BEHAVIOR_DISCOVERABILITY` | Are interactions hinted or documented where non-obvious? | Hover affordances, helper copy |

---

**Governance:** AI review is **KS-wide**. Do **not** introduce product-specific profiles (including Fleet-specific audit packs); use consumer sites only as generic fixtures when illustrating repeatable patterns.
