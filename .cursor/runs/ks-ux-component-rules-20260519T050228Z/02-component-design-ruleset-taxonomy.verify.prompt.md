Verify this phase without editing files.

Start with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide concise evidence, missing work, and exact next actions.

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

--- EXECUTION LOG START ---
Phase **02 — Component design ruleset taxonomy** is done. Here is what was added and how it meets the acceptance criteria.

## Created under `docs/design/ux-audit/`

| File | Contents |
|------|----------|
| [`README.md`](docs/design/ux-audit/README.md) | Index, deterministic vs AI split, tooling boundaries, **no Fleet profile** note, links to catalog + enterprise standard + auditor doc |
| [`deterministic-design-rules.md`](docs/design/ux-audit/deterministic-design-rules.md) | **`DET.*`** tables by area (governance, pages, layouts, chrome, sections, cards, nav, CTAs, data/charts, diagrams, motion, desktop, React, Python, themes, scripts), including **`DET.PAGE.MODE`**, **`DET.CONTEXT.BURDEN`**, **`DET.VISUAL.RHYTHM`**, **`DET.CATALOG.CONTRACT_SPECIFICITY`** |
| [`ai-enabled-design-principles.md`](docs/design/ux-audit/ai-enabled-design-principles.md) | **`AI.*`** tables + requirement for **`candidateDeterministicRule`**; includes **`AI.PREMIUM.ENTERPRISE_FEEL`**, **`AI.CONTEXT.COGNITIVE_CLARITY`**, **`AI.VISUAL.PRODUCT_EXPLANATORY_VALUE`** (and related IDs) |
| [`element-level-ruleset-matrix.md`](docs/design/ux-audit/element-level-ruleset-matrix.md) | Matrix: each taxonomy level → primary **`DET.*`** / **`AI.*`** → **contract fields** |
| [`component-design-ruleset-taxonomy.md`](docs/design/ux-audit/component-design-ruleset-taxonomy.md) | **15 levels** with purpose, visual role, deterministic checks, AI principles, forbidden patterns, contract fields |
| [`industry-standard-page-quality.md`](docs/design/ux-audit/industry-standard-page-quality.md) | A11y / landing / handbook / dashboard expectations mapped to **`DET.*`** / **`AI.*`**; explicit non-goals (no Fleet profile, no certification claims) |

## Plan evidence

Updated [`.cursor/plans/ks-ux-component-rules/02-component-design-ruleset-taxonomy.md`](.cursor/plans/ks-ux-component-rules/02-component-design-ruleset-taxonomy.md) with deliverables, acceptance table, and validation commands.

## Checks run

- `python3 generator/build-showcase.py` — exit **0**
- `npm test` in `tools/website-ux-auditor` — **91/91** pass
- `node tools/design-catalog/check-visual-catalog.mjs …` — exit **0**, `check-visual-catalog OK (91 entries)`

`visual-registry-coverage.md` only picked up timestamp churn from that script; it was **checked out again** so this phase stays limited to the new UX-audit docs and the plan file.

If you want phase 03 next, the taxonomy doc already points at wiring selected **`DET.*`** IDs into the auditor/scorer without merging the two CLIs.
--- EXECUTION LOG END ---
