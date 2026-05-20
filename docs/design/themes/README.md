# KS Design Themes

Kitchen Sink design themes capture the reusable look-and-feel rules that sit on
top of the structural visual catalog.

## Current Default Model

The base KS catalog remains the source of truth for visual roots:

- `docs/design/catalog/visual-registry.yaml` stores component, page, layout,
  chrome, style, and interaction rows.
- `docs/design/catalog/visual-registry.generated.json` is the runtime form read
  by Python helpers and the website UX auditor.
- `docs/design/catalog/**/<HASH>-*.md` files store per-element contracts with
  expected anatomy, deterministic checks, AI review cues, forbidden patterns,
  and verification notes.
- `docs/design/ux-audit/deterministic-design-rules.md` defines stable `DET.*`
  rules that are blended into
  `tools/website-ux-auditor/design-rules/registry.generated.json`.
- `docs/design/ux-audit/ai-enabled-design-principles.md` defines the advisory
  `AI.*` judgment layer used after deterministic Major+ findings are clean.

Themes do not replace those artifacts. They add a selectable layer for tokens,
thresholds, personality language, capture provenance, and optional contract
overlays.

## Theme Layout

Each theme lives under `docs/design/themes/<theme-id>/`:

- `theme.yaml` is the editable source descriptor.
- `design-standard.md` is the human-readable standard for the theme, or a
  wrapper that points to a canonical standard.
- `tokens.json` stores measurable palette, type, spacing, surface, motion, and
  density roles.
- `deterministic-rules.md` stores theme-specific thresholds and deterministic
  rule notes.
- `ai-principles.md` stores theme-specific judgment language.
- `contracts/` may contain contract overlays for specific hashes or families.
- `theme.generated.json` is the generated runtime artifact consumed by tools.

Runtime tooling should read `theme.generated.json`, not `theme.yaml`.
