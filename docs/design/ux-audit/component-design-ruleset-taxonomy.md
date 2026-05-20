# Component design ruleset taxonomy

This document is the **canonical per-level ruleset** for Kitchen Sink UX governance. Each row defines **purpose**, **expected visual role**, **deterministic checks** (`DET.*`), **AI-enabled principles** (`AI.*`), **forbidden patterns**, and **design contract fields** required.

**Standards alignment:** See [`industry-standard-page-quality.md`](industry-standard-page-quality.md) for WCAG-oriented and landing-page conventions mapped to these IDs.

---

## 1. Page types

| Aspect | Definition |
|--------|------------|
| **Purpose** | Declare what job the page performs for the visitor (learn, decide, operate, configure, read reference material). |
| **Expected visual role** | First paint establishes mode: hero-led marketing, split handbook, dense listing, dashboard/console, wizard steps, or presentation slide—**one** dominant story. |
| **Deterministic checks** | `DET.PAGE.MODE`, `DET.PAGE.TITLE`, `DET.PAGE.LANG`, `DET.PAGE.VIEWPORT`, `DET.LANDMARKS.REQUIRED`, `DET.CONTEXT.BURDEN`, `DET.SECTION.HEADING` |
| **AI-enabled principles** | `AI.NARRATIVE.COHERENCE`, `AI.CONTEXT.COGNITIVE_CLARITY`, `AI.TRUST.BOUNDARY_CLARITY`, `AI.CONTEXT.BURDEN_SUBJECTIVE` |
| **Forbidden patterns** | Competing hero stories; docs-index dump above fold; ambiguous mode (marketing + API reference interleaved without tabs/split); missing `main`. |
| **Contract fields required** | `page_mode`, `primary_job`, `audiences`, `sections_outline`, `cta_policy`, `trust_surface_refs`, `density_class` |

---

## 2. Layouts

| Aspect | Definition |
|--------|------------|
| **Purpose** | Provide reusable page scaffolding: columns, sticky regions, content gutters, responsive breakpoints. |
| **Expected visual role** | Stable grid, predictable section widths, chrome/content separation; layouts feel “designed” not improvised. |
| **Deterministic checks** | `DET.LAYOUT.GRID_CONSISTENCY`, `DET.CHROME.BOUNDARY`, `DET.VISUAL.RHYTHM`, `DET.HASH.MARKERS`, `DET.CONTRACT.PATH` |
| **AI-enabled principles** | `AI.VISUAL.HIERARCHY`, `AI.VISUAL.RHYTHM_SUBJECTIVE`, `AI.PREMIUM.ENTERPRISE_FEEL` |
| **Forbidden patterns** | Accidental full-bleed prose; unequal sibling columns without intent; sticky chrome overlapping focus outlines. |
| **Contract fields required** | `grid_tokens`, `chrome_slots`, `breakpoints`, `section_spacing_token`, `nested_layout_rules`, `layout_preview_hash` |

---

## 3. Chrome regions

| Aspect | Definition |
|--------|------------|
| **Purpose** | Persistent shell: primary nav, doc sidebar, TOC, footer, offcanvas—orient the user across pages. |
| **Expected visual role** | Visually subordinate to page story but always discoverable; clear active location; separation from content canvas. |
| **Deterministic checks** | `DET.CHROME.BOUNDARY`, `DET.NAV.DEPTH`, `DET.NAV.DEDUP`, `DET.NAV.FOCUS_ORDER`, `DET.NAV.BREADCRUMB`, `DET.HASH.MARKERS` |
| **AI-enabled principles** | `AI.APP.WORKFLOW_CONTINUITY`, `AI.VISUAL.HIERARCHY`, `AI.CONTEXT.BURDEN_SUBJECTIVE` |
| **Forbidden patterns** | Duplicate inconsistent nav trees; mystery meat icons without labels; chrome stealing first-screen focus on marketing pages. |
| **Contract fields required** | `region_role`, `allowed_links`, `active_state`, `mobile_transition`, `kbd_pattern`, `hash` |

---

## 4. Content sections

| Aspect | Definition |
|--------|------------|
| **Purpose** | Compose the interior story: feature bands, proof strips, FAQ, comparison tables within `main`. |
| **Expected visual role** | Each section skimmable in ≤10s; heading introduces one idea; generous spacing signals transitions. |
| **Deterministic checks** | `DET.SECTION.HEADING`, `DET.SECTION.SINGLE_JOB`, `DET.PROSE.LENGTH`, `DET.LANDMARKS.REQUIRED`, `DET.CARD.ACTION_LIMIT` (when section is card-led) |
| **AI-enabled principles** | `AI.NARRATIVE.COHERENCE`, `AI.CONTEXT.COGNITIVE_CLARITY`, `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE` |
| **Forbidden patterns** | Heading ladder skips; orphan headings; six unrelated topics under one `h2`; wall of bullets without framing sentence. |
| **Contract fields required** | `section_intent`, `heading_level`, `max_cards`, `copy_constraints`, `forbidden_patterns`, `related_hashes` |

---

## 5. Cards & surfaces

| Aspect | Definition |
|--------|------------|
| **Purpose** | Package related content/actions (tile, panel, stat tile, feature card). |
| **Expected visual role** | Reads as a bounded object; title scans first; actions visually secondary unless action-first pattern is declared. |
| **Deterministic checks** | `DET.CARD.TITLE`, `DET.CARD.ACTION_LIMIT`, `DET.SURFACE.ELEVATION_TOKEN`, `DET.CTA.LABEL_NONEMPTY`, `DET.HASH.MARKERS` |
| **AI-enabled principles** | `AI.VISUAL.HIERARCHY`, `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE`, `AI.PREMIUM.ENTERPRISE_FEEL` |
| **Forbidden patterns** | Card-within-card clutter; invisible hit targets; fake stats; mixed metaphors (pricing card using diagram metaphors without legend). |
| **Contract fields required** | `anatomy`, `states`, `cta_slots`, `elevation_token`, `icon_policy`, `hash` |

---

## 6. Navigation components

| Aspect | Definition |
|--------|------------|
| **Purpose** | Move users across IA: menus, tabs, pills, pagination, in-page TOC. |
| **Expected visual role** | Current location obvious; overflow handled deliberately; keyboard parity. |
| **Deterministic checks** | `DET.NAV.DEPTH`, `DET.NAV.IN_PAGE_TOC`, `DET.NAV.FOCUS_ORDER`, `DET.NAV.BREADCRUMB`, `DET.NAV.DEDUP` |
| **AI-enabled principles** | `AI.APP.WORKFLOW_CONTINUITY`, `AI.CONTEXT.COGNITIVE_CLARITY`, `AI.CONTEXT.BURDEN_SUBJECTIVE` |
| **Forbidden patterns** | Hover-only navigation without keyboard path; tabs that look like buttons without `role`; pagination losing filter context silently. |
| **Contract fields required** | `nav_band`, `max_nodes`, `overflow_pattern`, `current_marker`, `mobile_pattern`, `hash` |

---

## 7. CTA & button groups

| Aspect | Definition |
|--------|------------|
| **Purpose** | Drive explicit next actions without forcing premature commitment. |
| **Expected visual role** | One visually dominant primary per region; secondary/destructive subdued; alignment follows grid. |
| **Deterministic checks** | `DET.CTA.HIERARCHY`, `DET.CTA.LABEL_NONEMPTY`, `DET.BUTTON.GROUP.MAX`, `DET.CONTRACT.PATH` (when CTA policy is contract-bound) |
| **AI-enabled principles** | `AI.VISUAL.HIERARCHY`, `AI.CREDIBILITY.NO_OVERCLAIM`, `AI.TRUST.BOUNDARY_CLARITY` |
| **Forbidden patterns** | Duplicated primaries; “Learn more”-only clusters; aggressive dark patterns; misleading verb labels. |
| **Contract fields required** | `primary_cta`, `secondary_cta`, `destructive_allowed`, `alignment`, `loading_state`, `hash` |

---

## 8. Data & chart components

| Aspect | Definition |
|--------|------------|
| **Purpose** | Present quantitative information legibly: tables, sparklines, chart widgets. |
| **Expected visual role** | Headers explain units; trends annotated; empty/zero states honest; interactions reversible. |
| **Deterministic checks** | `DET.DATA.TABLE_HEADERS`, `DET.CHART.ALT_SUMMARY`, `DET.DATA.COLOR_ONLY`, `DET.JS.NO_CONSOLE_ERROR` (interactive charts) |
| **AI-enabled principles** | `AI.DATA.INSIGHT_LEGIBILITY`, `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE`, `AI.CREDIBILITY.NO_OVERCLAIM` |
| **Forbidden patterns** | Chartjunk hiding signal; missing axis labels; tables scanned as images without text alternative policy. |
| **Contract fields required** | `dataset_shape`, `caption_policy`, `empty_state`, `interaction_contract`, `color_palette_ref`, `hash` |

---

## 9. Diagram & visual systems

| Aspect | Definition |
|--------|------------|
| **Purpose** | Explain architecture, flows, or relationships via SVG templates and legends. |
| **Expected visual role** | Labels readable at target sizes; legend maps glyphs to meaning; decorative flourishes do not obscure semantics. |
| **Deterministic checks** | `DET.DIAGRAM.LABELS`, `DET.DIAGRAM.ALT`, `DET.DIAGRAM.ASSET_REGISTRY`, `DET.HASH.MARKERS`, `DET.CATALOG.CONTRACT_SPECIFICITY` |
| **AI-enabled principles** | `AI.DIAGRAM.SEMANTIC_ACCURACY`, `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE`, `AI.CONTRACT.IMPLEMENTATION_USEFULNESS` |
| **Forbidden patterns** | Orphan arrows; unexplained color coding; duplicated legends across unrelated diagrams without tie-in. |
| **Contract fields required** | `legend_map`, `semantics`, `decorative_rule`, `minimum_sizes`, `svg_template_ref`, `hash` |

---

## 10. Motion & ambient layers

| Aspect | Definition |
|--------|------------|
| **Purpose** | Reinforce depth/presence (canvas backgrounds, particles, subtle parallax) without harming readability. |
| **Expected visual role** | Ambient sits **behind** content plane; motion respects reduced-motion preference; loops are calm. |
| **Deterministic checks** | `DET.MOTION.PREFERS_REDUCED`, `DET.MOTION.NO_AUTO_PLAY_FLASH`, `DET.AMBIENT.Z_INDEX`, `DET.JS.NO_CONSOLE_ERROR` |
| **AI-enabled principles** | `AI.MOTION.INTENTIONALITY`, `AI.AMBIENT.READABILITY_CONFLICT`, `AI.PREMIUM.ENTERPRISE_FEEL` |
| **Forbidden patterns** | Full-screen autoplay distractions; text over busy animation without scrim; seizure-risk strobing. |
| **Contract fields required** | `motion_scope`, `reduced_motion_behavior`, `layer_plane`, `performance_budget`, `fallback_static_frame`, `hash` |

---

## 11. Desktop & app interfaces

| Aspect | Definition |
|--------|------------|
| **Purpose** | Studio/shell experiences with persistent chrome, panels, and keyboard-heavy workflows. |
| **Expected visual role** | Density appropriate to operator tasks; clear panel boundaries; uninterrupted focus contexts. |
| **Deterministic checks** | `DET.APP.FOCUS_TRAP`, `DET.APP.PERSISTENT_CHROME`, `DET.LANDMARKS.REQUIRED`, `DET.NAV.FOCUS_ORDER` |
| **AI-enabled principles** | `AI.APP.DENSITY_BALANCE`, `AI.APP.WORKFLOW_CONTINUITY`, `AI.REACT.PRIMITIVE_CONSISTENCY` |
| **Forbidden patterns** | Modal stacks without trail; panels that resize unpredictably; silent destructive shortcuts. |
| **Contract fields required** | `shell_regions`, `route_contract`, `density_level`, `shortcut_policy`, `density_a11y_exceptions`, `hash` |

---

## 12. React primitives

| Aspect | Definition |
|--------|------------|
| **Purpose** | Leaf interactive controls shipped from `react/` with KS visual identity. |
| **Expected visual role** | Matches system spacing/typography tokens; states visibly distinct; accessible names exposed. |
| **Deterministic checks** | `DET.REACT.KS_ATTRS`, `DET.REACT.A11Y_ROLE`, `DET.HASH.MARKERS`, `DET.THEME.CONTRAST_MIN` |
| **AI-enabled principles** | `AI.REACT.PRIMITIVE_CONSISTENCY`, `AI.CONTRACT.IMPLEMENTATION_USEFULNESS`, `AI.PREMIUM.ENTERPRISE_FEEL` |
| **Forbidden patterns** | One-off CSS bypassing tokens; invisible disabled states; ambiguous icons. |
| **Contract fields required** | `props_surface`, `states`, `size_scale`, `a11y_notes`, `story_urls`, `hash` |

---

## 13. Python-generated HTML modules

| Aspect | Definition |
|--------|------------|
| **Purpose** | Renderers in `components/` emitting static or server-built HTML for consumers. |
| **Expected visual role** | Predictable wrapper hierarchy; minimal nesting noise; optional regions omitted cleanly when empty. |
| **Deterministic checks** | `DET.PY.KS_HASH_ATTRS`, `DET.PY.OPTIONAL_REGIONS`, `DET.SECTION.HEADING`, `DET.HASH.MARKERS`, `DET.CONTRACT.PATH` |
| **AI-enabled principles** | `AI.PY.HTML_AUTHORING_QUALITY`, `AI.CONTRACT.IMPLEMENTATION_USEFULNESS` |
| **Forbidden patterns** | Ghost headings for empty slots; inline styles breaking tokens; missing landmarks when wrapping full sections. |
| **Contract fields required** | `render_entrypoints`, `slot_contract`, `empty_state`, `wrapper_elements`, `hash` |

---

## 14. Visual styles & theme packs

| Aspect | Definition |
|--------|------------|
| **Purpose** | Ship cohesive color, type, elevation, and motion tokens (`css/` theme packs). |
| **Expected visual role** | Harmonized accents; readable contrast; intentional dark/light behavior. |
| **Deterministic checks** | `DET.THEME.CONTRAST_MIN`, `DET.THEME.FONT_STACK`, `DET.TOKEN.NO_DRIFT`, `DET.SURFACE.ELEVATION_TOKEN` |
| **AI-enabled principles** | `AI.THEME.PERSONALITY_COHERENCE`, `AI.PREMIUM.ENTERPRISE_FEEL` |
| **Forbidden patterns** | Ad hoc hex sprawl; illegible muted text; contradictory radii across sibling components. |
| **Contract fields required** | `token_table_ref`, `surface_roles`, `dark_light_rules`, `compat_hashes`, `rollback_policy`, `hash` |

---

## 15. Interaction scripts

| Aspect | Definition |
|--------|------------|
| **Purpose** | Client behaviors in `js/` (portal nav, theme toggle, progressive enhancement modules). |
| **Expected visual role** | Enhancement layered on usable baseline HTML; errors surfaced to users or logged deterministically in tests. |
| **Deterministic checks** | `DET.JS.PROGRESSIVE`, `DET.JS.NO_CONSOLE_ERROR`, `DET.MOTION.PREFERS_REDUCED`, `DET.NAV.FOCUS_ORDER` (when script manages focus) |
| **AI-enabled principles** | `AI.JS.BEHAVIOR_DISCOVERABILITY`, `AI.MOTION.INTENTIONALITY` |
| **Forbidden patterns** | Hard dependency blocking content; focus loss on toggle; unannounced route swaps without live region strategy (when applicable). |
| **Contract fields required** | `entrypoints`, `noscript_degrade`, `events_emitted`, `failure_modes`, `hash` |

---

## Rule ID stability

- **`DET.*` / `AI.*`** IDs are **stable contracts for tooling**. Add new IDs rather than repurposing existing ones.  
- When automated checks ship, reference these IDs in defect JSON to keep **`analyze-website-ux.mjs`**, **`score-website-ux.mjs`**, and AI batches aligned.

## Related docs

- Matrix crosswalk: [`element-level-ruleset-matrix.md`](element-level-ruleset-matrix.md)  
- Deterministic catalog: [`deterministic-design-rules.md`](deterministic-design-rules.md)  
- AI catalog: [`ai-enabled-design-principles.md`](ai-enabled-design-principles.md)  
- README / scope: [`README.md`](README.md)
