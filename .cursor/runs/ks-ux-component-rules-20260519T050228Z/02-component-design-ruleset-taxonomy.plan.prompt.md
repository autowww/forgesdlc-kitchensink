Read the phase prompt below and create a precise implementation plan. Do not edit files in this planning step. The work belongs under .cursor/plans/ks-ux-component-rules/. Include files to inspect/change, deterministic checks, AI-enabled rules, risks, and validation commands.

--- PHASE PROMPT START ---
# 02 — Component design ruleset taxonomy

Goal: create detailed design rulesets by element level, not one generic principle for everything.

Create or update:

- `docs/design/ux-audit/README.md`
- `docs/design/ux-audit/deterministic-design-rules.md`
- `docs/design/ux-audit/ai-enabled-design-principles.md`
- `docs/design/ux-audit/element-level-ruleset-matrix.md`
- `docs/design/ux-audit/component-design-ruleset-taxonomy.md`
- `docs/design/ux-audit/industry-standard-page-quality.md`

The taxonomy must define rules for:

- page types
- layouts
- chrome regions
- content sections
- cards and surfaces
- navigation components
- CTA/button groups
- data/chart components
- diagram/visual systems
- motion/ambient layers
- desktop/app interfaces
- React primitives
- Python-generated HTML modules
- visual styles/theme packs
- interaction scripts

For each level, define:

- purpose
- expected visual role
- deterministic checks
- AI-enabled review principles
- forbidden patterns
- contract fields required

Do not write generic prose only. Use tables and rule IDs that scripts can reference, for example:

- `DET.PAGE.MODE`
- `DET.CONTEXT.BURDEN`
- `DET.VISUAL.RHYTHM`
- `DET.CATALOG.CONTRACT_SPECIFICITY`
- `AI.PREMIUM.ENTERPRISE_FEEL`
- `AI.CONTEXT.COGNITIVE_CLARITY`
- `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE`

Acceptance:
- docs exist;
- docs explicitly split deterministic and AI-enabled rules;
- no Fleet-specific doc/profile exists.
--- PHASE PROMPT END ---
