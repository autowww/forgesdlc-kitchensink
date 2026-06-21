# Industry-standard page quality (mapped to KS rule IDs)

This document ties **common industry expectations** for public web and product UI quality to Kitchen Sink **`DET.*`** (deterministic) and **`AI.*`** (judgment) rule IDs. It does **not** replace WCAG legal interpretation; it gives engineers and auditors a **shared checklist** aligned with enterprise landing norms and accessibility baselines.

## Accessibility & inclusive design

| Industry expectation | Primary `DET.*` | Primary `AI.*` |
|---------------------|-----------------|----------------|
| Perceivable text/contrast for body UI | `DET.THEME.CONTRAST_MIN` | `AI.AMBIENT.READABILITY_CONFLICT` |
| Meaningful non-color cues | `DET.DATA.COLOR_ONLY`, `DET.CHART.ALT_SUMMARY` | `AI.DATA.INSIGHT_LEGIBILITY` |
| Keyboard operability | `DET.NAV.FOCUS_ORDER`, `DET.APP.CONTROL_A11Y`, `DET.APP.FOCUS_TRAP` | `AI.JS.BEHAVIOR_DISCOVERABILITY` |
| Reduced motion respect | `DET.MOTION.PREFERS_REDUCED` | `AI.MOTION.INTENTIONALITY` |
| Landmark structure | `DET.LANDMARKS.REQUIRED`, `DET.SECTION.HEADING` | `AI.CONTEXT.COGNITIVE_CLARITY` |

## Landing & marketing page conventions

| Industry expectation | Primary `DET.*` | Primary `AI.*` |
|---------------------|-----------------|----------------|
| Clear page mode / story | `DET.PAGE.MODE`, `DET.CONTEXT.BURDEN` | `AI.NARRATIVE.COHERENCE`, `AI.VISUAL.HIERARCHY` |
| Obvious primary next step | `DET.CTA.HIERARCHY`, `DET.BUTTON.GROUP.MAX` | `AI.VISUAL.HIERARCHY` |
| Trust boundaries stated plainly | `DET.PROSE.LENGTH` (proxy: readable blocks) | `AI.TRUST.BOUNDARY_CLARITY`, `AI.CREDIBILITY.NO_OVERCLAIM` |
| Technical depth linked, not dumped | `DET.CONTEXT.BURDEN`, `DET.SECTION.SINGLE_JOB` | `AI.CONTEXT.COGNITIVE_CLARITY` |

## Documentation & handbook surfaces

| Industry expectation | Primary `DET.*` | Primary `AI.*` |
|---------------------|-----------------|----------------|
| Scannable hierarchy | `DET.SECTION.HEADING`, `DET.NAV.IN_PAGE_TOC` | `AI.CONTEXT.COGNITIVE_CLARITY` |
| Consistent chrome | `DET.CHROME.BOUNDARY`, `DET.NAV.BREADCRUMB` | `AI.APP.WORKFLOW_CONTINUITY` |

## Data-rich & dashboard surfaces

| Industry expectation | Primary `DET.*` | Primary `AI.*` |
|---------------------|-----------------|----------------|
| Tables/charts interpretable | `DET.DATA.TABLE_HEADERS`, `DET.CHART.ALT_SUMMARY` | `AI.DATA.INSIGHT_LEGIBILITY` |
| Operator density balanced | `DET.APP.PERSISTENT_CHROME` | `AI.APP.DENSITY_BALANCE` |

## Design-system governance (KS-specific but industry-aligned)

| Industry expectation | Primary `DET.*` | Primary `AI.*` |
|---------------------|-----------------|----------------|
| Stable visual identity via tokens | `DET.TOKEN.NO_DRIFT`, `DET.THEME.FONT_STACK` | `AI.THEME.PERSONALITY_COHERENCE`, `AI.PREMIUM.ENTERPRISE_FEEL` |
| Traceable visuals via hashes | `DET.HASH.MARKERS`, `DET.HASH.REGISTRY_ROW`, `DET.CONTRACT.PATH` | `AI.CONTRACT.IMPLEMENTATION_USEFULNESS` |
| Contracts actionable | `DET.CATALOG.CONTRACT_SPECIFICITY` | `AI.CONTRACT.FAMILY_COVERAGE_JUSTIFIED` |

## Explicit non-goals

- **No Fleet-specific profile** or checklist fork—only generic patterns may be exemplified.  
- **No certification claims** (WCAG AAA, compliance-ready, etc.) unless backed by an authorized audit outside this repo.

## References

- [`forge-enterprise-ai-website-standard.md`](../forge-enterprise-ai-website-standard.md) — enterprise web standard consumed by UX tooling  
- [`component-design-ruleset-taxonomy.md`](component-design-ruleset-taxonomy.md) — full taxonomy tables  
- [`deterministic-design-rules.md`](deterministic-design-rules.md), [`ai-enabled-design-principles.md`](ai-enabled-design-principles.md) — complete rule/principle catalogs  
