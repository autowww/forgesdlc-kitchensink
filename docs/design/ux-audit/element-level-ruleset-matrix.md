# Element-level ruleset matrix

Crosswalk from **taxonomy levels** (columns of responsibility) to **`DET.*`** / **`AI.*`** anchors and **design contract fields**. Use this for scorer tagging, AI batches, and remediation plans.

**Legend:**  
- **Primary DET*** — rules that should fire first for this level when automated.  
- **Primary AI*** — judgment-heavy overlays that never subsume hash/catalog failures.

## Matrix

| Taxonomy level | Primary `DET.*` (examples) | Primary `AI.*` (examples) | Contract fields required |
|----------------|---------------------------|---------------------------|---------------------------|
| **Page types** | `DET.PAGE.MODE`, `DET.PAGE.TITLE`, `DET.LANDMARKS.REQUIRED`, `DET.CONTEXT.BURDEN`, `DET.PAGE.LANG` | `AI.NARRATIVE.COHERENCE`, `AI.CONTEXT.COGNITIVE_CLARITY`, `AI.TRUST.BOUNDARY_CLARITY` | `page_mode`, `primary_job`, `sections_outline`, `hero_contract_ref`, `trust_surface_refs`, `cta_policy` |
| **Layouts** | `DET.LAYOUT.GRID_CONSISTENCY`, `DET.CHROME.BOUNDARY`, `DET.VISUAL.RHYTHM`, `DET.SECTION.HEADING` | `AI.VISUAL.HIERARCHY`, `AI.VISUAL.RHYTHM_SUBJECTIVE` | `grid_tokens`, `chrome_slots`, `responsive_breakpoints`, `section_spacing_token`, `layout_preview_hash` |
| **Chrome regions** | `DET.NAV.DEPTH`, `DET.NAV.DEDUP`, `DET.CHROME.BOUNDARY`, `DET.NAV.FOCUS_ORDER` | `AI.APP.WORKFLOW_CONTINUITY`, `AI.VISUAL.HIERARCHY` | `region_role`, `allowed_links`, `kbd_pattern`, `breakpoint_behavior`, `hash` |
| **Content sections** | `DET.SECTION.SINGLE_JOB`, `DET.SECTION.HEADING`, `DET.PROSE.LENGTH`, `DET.LANDMARKS.REQUIRED` | `AI.NARRATIVE.COHERENCE`, `AI.CONTEXT.COGNITIVE_CLARITY` | `section_intent`, `max_cards`, `heading_level`, `copy_constraints`, `related_hashes` |
| **Cards & surfaces** | `DET.CARD.TITLE`, `DET.CARD.ACTION_LIMIT`, `DET.SURFACE.ELEVATION_TOKEN`, `DET.HASH.MARKERS` | `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE`, `AI.PREMIUM.ENTERPRISE_FEEL` | `anatomy`, `states`, `cta_slots`, `elevation_token`, `hash` |
| **Navigation components** | `DET.NAV.DEPTH`, `DET.NAV.IN_PAGE_TOC`, `DET.NAV.BREADCRUMB`, `DET.NAV.FOCUS_ORDER` | `AI.APP.WORKFLOW_CONTINUITY`, `AI.CONTEXT.BURDEN_SUBJECTIVE` | `nav_band`, `max_nodes`, `mobile_pattern`, `overflow_pattern`, `hash` |
| **CTA / button groups** | `DET.CTA.HIERARCHY`, `DET.CTA.LABEL_NONEMPTY`, `DET.BUTTON.GROUP.MAX` | `AI.VISUAL.HIERARCHY`, `AI.CREDIBILITY.NO_OVERCLAIM` | `primary_cta`, `secondary_cta`, `destructive_allowed`, `alignment`, `hash` |
| **Data / chart components** | `DET.DATA.TABLE_HEADERS`, `DET.CHART.ALT_SUMMARY`, `DET.DATA.COLOR_ONLY` | `AI.DATA.INSIGHT_LEGIBILITY`, `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE` | `dataset_shape`, `caption_policy`, `accent_colors`, `interaction_contract`, `hash` |
| **Diagram / visual systems** | `DET.DIAGRAM.LABELS`, `DET.DIAGRAM.ALT`, `DET.DIAGRAM.ASSET_REGISTRY`, `DET.HASH.MARKERS` | `AI.DIAGRAM.SEMANTIC_ACCURACY`, `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE` | `legend_map`, `semantics`, `decorative_rule`, `svg_template_ref`, `hash` |
| **Motion / ambient layers** | `DET.MOTION.PREFERS_REDUCED`, `DET.MOTION.NO_AUTO_PLAY_FLASH`, `DET.AMBIENT.Z_INDEX` | `AI.MOTION.INTENTIONALITY`, `AI.AMBIENT.READABILITY_CONFLICT` | `motion_scope`, `reduced_motion_behavior`, `layer_plane`, `performance_budget`, `hash` |
| **Desktop / app interfaces** | `DET.APP.FOCUS_TRAP`, `DET.APP.PERSISTENT_CHROME`, `DET.LANDMARKS.REQUIRED` | `AI.APP.DENSITY_BALANCE`, `AI.APP.WORKFLOW_CONTINUITY` | `shell_regions`, `route_contract`, `density_level`, `keyboard_map`, `hash` |
| **React primitives** | `DET.REACT.KS_ATTRS`, `DET.REACT.A11Y_ROLE`, `DET.HASH.MARKERS` | `AI.REACT.PRIMITIVE_CONSISTENCY`, `AI.CONTRACT.IMPLEMENTATION_USEFULNESS` | `props_surface`, `states`, `a11y_notes`, `story_urls`, `hash` |
| **Python HTML modules** | `DET.PY.KS_HASH_ATTRS`, `DET.PY.OPTIONAL_REGIONS`, `DET.SECTION.HEADING` | `AI.PY.HTML_AUTHORING_QUALITY`, `AI.CONTRACT.IMPLEMENTATION_USEFULNESS` | `render_entrypoints`, `slot_contract`, `empty_state`, `hash` |
| **Visual styles / theme packs** | `DET.THEME.CONTRAST_MIN`, `DET.THEME.FONT_STACK`, `DET.TOKEN.NO_DRIFT`, `DET.SURFACE.ELEVATION_TOKEN` | `AI.THEME.PERSONALITY_COHERENCE`, `AI.PREMIUM.ENTERPRISE_FEEL` | `token_table_ref`, `surface_roles`, `dark_light_rules`, `compat_hashes`, `hash` |
| **Interaction scripts** | `DET.JS.NO_CONSOLE_ERROR`, `DET.JS.PROGRESSIVE`, `DET.MOTION.PREFERS_REDUCED` | `AI.JS.BEHAVIOR_DISCOVERABILITY`, `AI.MOTION.INTENTIONALITY` | `entrypoints`, `noscript_degrade`, `events_emitted`, `hash` |

## Contract field glossary (shared)

| Field | Meaning |
|-------|---------|
| `hash` | Three-letter registry hash + mirrored `data-ks-hash` on roots. |
| `anatomy` | Ordered list of subregions / mandatory nodes. |
| `states` | Default, hover, focus, active, disabled, loading, error. |
| `forbidden_patterns` | Explicit anti-patterns for implementers and auditors. |
| `verification` | How to validate (screenshot, DOM probe, manual step). |
| `family_coverage_note` | Justification when using a roll-up contract across multiple hashes. |

## References

- Taxonomy detail: [`component-design-ruleset-taxonomy.md`](component-design-ruleset-taxonomy.md)  
- Full `DET.*` list: [`deterministic-design-rules.md`](deterministic-design-rules.md)  
- Full `AI.*` list: [`ai-enabled-design-principles.md`](ai-enabled-design-principles.md)
